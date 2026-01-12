require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GameState } = require('./game/GameState');
const { generateRandomGrid, calculateSpinReward, calculateAutoPatternReward } = require('./game/slotMachine');
const { 
  initializeContract, 
  completeLevel, 
  completeGame, 
  failGame, 
  getGameSession,
  setContractAddress 
} = require('./utils/contract');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// ============================================
// ⚠️ 配置区域 - 需要设置合约地址
// ============================================
// 方式1: 通过环境变量设置
if (process.env.CONTRACT_ADDRESS) {
  setContractAddress(process.env.CONTRACT_ADDRESS);
  console.log(`[服务器] 从环境变量加载合约地址: ${process.env.CONTRACT_ADDRESS}`);
}

// 方式2: 通过控制台输入（如果环境变量未设置）
// 初始化合约连接（如果配置了私钥和RPC）
if (process.env.SERVER_PRIVATE_KEY && process.env.CONTRACT_ADDRESS) {
  const initialized = initializeContract();
  if (initialized) {
    console.log('[服务器] 智能合约已初始化');
  } else {
    console.warn('[服务器] 警告：智能合约初始化失败，奖励功能将不可用');
  }
} else {
  console.warn('[服务器] 警告：未配置 SERVER_PRIVATE_KEY 或 CONTRACT_ADDRESS，奖励功能将不可用');
  console.warn('[服务器] 提示：请设置环境变量或使用控制台配置');
}

// 存储游戏状态（实际应该用数据库或Redis）
const gameSessions = new Map();

// 存储游戏会话的元数据（包括以太坊信息）
const gameSessionMetadata = new Map();

// 创建新游戏
app.post('/api/game/new', (req, res) => {
  const { gameMode = 'guest', walletAddress, txHash, blockNumber, sessionId: providedSessionId } = req.body;
  
  const gameState = new GameState();
  // 使用提供的sessionId或生成新的（合约需要固定的sessionId）
  const sessionId = providedSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  gameSessions.set(sessionId, gameState);
  
  // 存储游戏会话元数据
  const metadata = {
    gameMode: gameMode || 'guest',
    createdAt: new Date().toISOString(),
    walletAddress: walletAddress || null,
    txHash: txHash || null,
    blockNumber: blockNumber || null,
    sessionId: sessionId // 保存sessionId用于合约调用
  };
  gameSessionMetadata.set(sessionId, metadata);
  
  console.log(`[创建新游戏] sessionId: ${sessionId}, 模式: ${gameMode}`);
  if (gameMode === 'ethereum') {
    console.log(`  钱包地址: ${walletAddress}`);
    console.log(`  交易哈希: ${txHash}`);
    console.log(`  区块号: ${blockNumber}`);
    console.log(`  合约地址: ${process.env.CONTRACT_ADDRESS || '未配置'}`);
  }
  
  res.json({
    sessionId,
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities(),
    metadata
  });
});

// 获取游戏状态
app.get('/api/game/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  const metadata = gameSessionMetadata.get(sessionId) || {};
  
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities(),
    metadata
  });
});

// 开始新轮
app.post('/api/game/:sessionId/level/start', (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  gameState.startNewLevel();
  
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities(),
    events: gameState.events  // 返回生成的事件
  });
});

// 选择事件
app.post('/api/game/:sessionId/event/select', (req, res) => {
  const { sessionId } = req.params;
  const { eventIndex } = req.body;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  const success = gameState.selectEvent(eventIndex);
  
  if (!success) {
    return res.status(400).json({ error: 'Invalid event index' });
  }
  
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities()
  });
});

// 开始新回合
app.post('/api/game/:sessionId/round/start', (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  gameState.startNewRound();
  
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities()
  });
});

// 选择回合操作
app.post('/api/game/:sessionId/turn/select', (req, res) => {
  const { sessionId } = req.params;
  const { option } = req.body; // 'cheap' or 'expensive'
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  const success = gameState.selectTurnOption(option);
  
  if (!success) {
    return res.status(400).json({ error: 'Cannot select turn option' });
  }
  
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities()
  });
});

// 旋转老虎机
app.post('/api/game/:sessionId/slot/spin', (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  if (gameState.spinsRemaining <= 0) {
    return res.status(400).json({ error: 'No spins remaining' });
  }
  
  // 生成随机网格
  const probabilities = gameState.calculateSymbolProbabilities();
  const grid = generateRandomGrid(probabilities);
  
  // 记录旋转前的状态
  const quantumBefore = gameState.quantum;
  const turnQuantumBefore = gameState.turnQuantum;
  const saintQuartzBefore = gameState.saintQuartz;
  const spinsRemainingBefore = gameState.spinsRemaining;
  
  // 计算奖励（传入当前回合累计量子，用于扣分清零）
  const result = calculateSpinReward(
    grid,
    gameState.symbolStates,
    gameState.activeServants,
    gameState.fullPatternRewards,
    gameState.turnQuantum
  );
  
  // 如果扣分图像形成形状导致清零，turnQuantum会被清零
  if (result.hasNegative) {
    gameState.turnQuantum = 0;
    gameState.quantum += result.reward; // result.reward 是负数，等于 -turnQuantum
  } else {
    // 应用奖励
    gameState.quantum += result.reward;
    gameState.turnQuantum += result.reward;
  }
  
  // 减少全满奖励计数（如果触发了）
  if (result.triggeredFullRewards) {
    Object.entries(result.triggeredFullRewards).forEach(([symbolId, count]) => {
      if (gameState.fullPatternRewards[symbolId]) {
        gameState.fullPatternRewards[symbolId] -= count;
        if (gameState.fullPatternRewards[symbolId] <= 0) {
          delete gameState.fullPatternRewards[symbolId];
        }
        console.log(`  全满奖励计数减少: ${symbolId} 剩余 ${gameState.fullPatternRewards[symbolId] || 0} 次`);
      }
    });
  }
  
  gameState.spinsRemaining--;
  gameState.slotResults = grid;
  
  // 记录老虎机旋转日志
  console.log(`\n[老虎机旋转] 第${gameState.level}轮 第${gameState.round}回合`);
  console.log(`  剩余旋转次数: ${spinsRemainingBefore} → ${gameState.spinsRemaining}`);
  
  // 检查是否有全满奖励待触发
  const hasFullPatternRewards = Object.keys(gameState.fullPatternRewards || {}).some(
    symbolId => (gameState.fullPatternRewards[symbolId] || 0) > 0
  );
  if (hasFullPatternRewards) {
    console.log(`  待触发的全满奖励:`);
    Object.entries(gameState.fullPatternRewards || {}).forEach(([symbolId, count]) => {
      if (count > 0) {
        console.log(`    ${symbolId}: ${count}次`);
      }
    });
  } else {
    console.log(`  无待触发的全满奖励`);
  }
  
  if (result.patterns && result.patterns.length > 0) {
    console.log(`  检测到形状:`);
    result.patterns.forEach(pattern => {
      const symbolName = pattern.symbolId === 'solomon' ? '所罗门(扣分)' : pattern.symbolId;
      const isFull = pattern.type === 'full';
      console.log(`    ${pattern.type} - ${symbolName} (${pattern.positions.length}格)${isFull ? ' [全满]' : ''}`);
    });
  } else {
    console.log(`  未检测到形状`);
  }
  
  if (result.hasNegative) {
    console.log(`  扣分图像触发: 本回合累计量子清零`);
    console.log(`    回合量子: ${turnQuantumBefore.toLocaleString()} → 0 (-${turnQuantumBefore.toLocaleString()})`);
    console.log(`    总量子变化: ${quantumBefore.toLocaleString()} → ${gameState.quantum.toLocaleString()} (${gameState.quantum - quantumBefore > 0 ? '+' : ''}${(gameState.quantum - quantumBefore).toLocaleString()})`);
  } else {
    console.log(`  获得奖励: ${result.reward > 0 ? '+' : ''}${result.reward.toLocaleString()} 量子`);
    console.log(`  总量子变化: ${quantumBefore.toLocaleString()} → ${gameState.quantum.toLocaleString()} (+${(gameState.quantum - quantumBefore).toLocaleString()})`);
    console.log(`  回合量子变化: ${turnQuantumBefore.toLocaleString()} → ${gameState.turnQuantum.toLocaleString()} (+${(gameState.turnQuantum - turnQuantumBefore).toLocaleString()})`);
  }
  
  // BB效果会在calculateSpinReward内部应用，这里记录最终结果
  if (gameState.hasBB && result.reward > 0 && !result.hasNegative) {
    console.log(`  BB效果: 奖励已翻倍`);
  }
  
  console.log(`  圣晶石: ${saintQuartzBefore} (无变化)`);
  console.log(`  当前出战从者: ${gameState.activeServants.map(s => s.name).join(', ') || '无'}\n`);
  
  // 注意：自动形状结算在选择回合操作时已经执行，不需要在每次旋转时重复执行
  
  // 检查游戏结束
  const isGameOver = gameState.checkGameOver();
  
  res.json({
    gameState: gameState.getGameState(),
    spinResult: {
      grid,
      reward: result.reward,
      patterns: result.patterns,
      hasNegative: result.hasNegative
    },
    probabilities: gameState.calculateSymbolProbabilities(),
    isGameOver
  });
});

// 购买从者
app.post('/api/game/:sessionId/servant/buy', (req, res) => {
  const { sessionId } = req.params;
  const { servantId } = req.body;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  const success = gameState.buyServant(servantId);
  
  if (!success) {
    return res.status(400).json({ error: 'Cannot buy servant' });
  }
  
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities()
  });
});

// 花费圣晶石刷新商店
app.post('/api/game/:sessionId/shop/refresh', (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  const success = gameState.refreshShopWithQuartz();
  
  if (!success) {
    return res.status(400).json({ error: 'Not enough saint quartz' });
  }
  
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities()
  });
});

// 激活从者
app.post('/api/game/:sessionId/servant/activate', (req, res) => {
  const { sessionId } = req.params;
  const { servantId } = req.body;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  const success = gameState.activateServant(servantId);
  
  if (!success) {
    return res.status(400).json({ error: 'Cannot activate servant' });
  }
  
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities()
  });
});

// 从者下场
app.post('/api/game/:sessionId/servant/deactivate', (req, res) => {
  const { sessionId } = req.params;
  const { servantId } = req.body;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  const success = gameState.deactivateServant(servantId);
  
  if (!success) {
    return res.status(400).json({ error: 'Cannot deactivate servant' });
  }
  
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities()
  });
});

// 完成轮次
app.post('/api/game/:sessionId/level/complete', async (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  const metadata = gameSessionMetadata.get(sessionId) || {};
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  const levelBefore = gameState.level;
  gameState.completeLevel();
  
  // 如果是以太坊模式且通过了，调用智能合约记录奖励
  if (metadata.gameMode === 'ethereum' && gameState.isLevelComplete && !gameState.isGameOver) {
    try {
      const isPostLevel5 = levelBefore >= 5; // 第5轮及以后算postLevel5
      await completeLevel(sessionId, levelBefore, isPostLevel5);
      console.log(`[服务器] 智能合约：第${levelBefore}轮完成，奖励已记录`);
    } catch (error) {
      console.error('[服务器] 调用智能合约失败:', error);
      console.error('[服务器] 错误详情:', error.message);
      // 不阻止游戏继续，只记录错误
    }
  }
  
  // 如果是以太坊模式且游戏失败，调用智能合约标记失败
  if (metadata.gameMode === 'ethereum' && gameState.isGameOver) {
    try {
      const txHash = await failGame(sessionId);
      if (txHash) {
        console.log(`[服务器] 智能合约：游戏失败，已标记，交易哈希: ${txHash}`);
      } else {
        console.log(`[服务器] 智能合约：游戏失败标记已处理（可能是重复调用）`);
      }
    } catch (error) {
      // 如果是 "already known" 错误，说明交易已经在处理中，可以忽略
      if (error.error && (error.error.message === 'already known' || error.error.code === -32000)) {
        console.log(`[服务器] 交易已在处理中，忽略重复提交`);
      } else {
        console.error('[服务器] 标记游戏失败失败:', error);
        console.error('[服务器] 错误详情:', error.message);
      }
    }
  }
  
  // 如果通过了，completeLevel() 会自动调用 startNewLevel()，所以这里需要返回新轮的状态
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities(),
    isGameOver: gameState.isGameOver,
    isLevelComplete: gameState.isLevelComplete,
    events: gameState.events && gameState.events.length > 0 ? gameState.events : undefined
  });
});

// 游戏成功完成（玩家主动结束或达到目标）
app.post('/api/game/:sessionId/game/complete', async (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  const metadata = gameSessionMetadata.get(sessionId) || {};
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  // 如果是以太坊模式，先确保所有已完成的轮次都已记录到合约，然后完成游戏
  if (metadata.gameMode === 'ethereum' && process.env.CONTRACT_ADDRESS) {
    try {
      const { getGameSession } = require('./utils/contract');
      
      // 先检查合约中的当前状态
      let contractCompletedLevels = 0;
      try {
        const sessionInfo = await getGameSession(sessionId);
        contractCompletedLevels = parseInt(sessionInfo.completedLevels) || 0;
        console.log(`[服务器] 检查奖励记录状态:`);
        console.log(`  合约中已完成的轮数: ${contractCompletedLevels}`);
        console.log(`  合约中总奖励: ${sessionInfo.totalReward} ETH`);
        console.log(`  游戏会话状态: isActive=${sessionInfo.isActive}, isCompleted=${sessionInfo.isCompleted}`);
      } catch (checkError) {
        console.log(`[服务器] 无法获取合约状态，可能游戏会话不存在:`, checkError.message);
        // 如果游戏会话不存在，说明从未调用过 startGame，无法完成游戏
        return res.status(400).json({ 
          error: '游戏会话在合约中不存在，请确保已支付入场费并开始游戏' 
        });
      }
      
      // 计算实际已完成的轮数（当前level是下一轮，所以已完成的是level-1）
      const actualCompletedLevels = gameState.level - 1;
      console.log(`  实际已完成的轮数: ${actualCompletedLevels}`);
      
      // 补录缺失的轮次
      if (actualCompletedLevels > contractCompletedLevels) {
        console.log(`[服务器] 发现缺失的轮次记录，开始补录...`);
        for (let level = contractCompletedLevels + 1; level <= actualCompletedLevels; level++) {
          try {
            const isPostLevel5 = level >= 5; // 第5轮及以后算postLevel5
            await completeLevel(sessionId, level, isPostLevel5);
            console.log(`[服务器] ✓ 补录第${level}轮奖励成功`);
          } catch (error) {
            console.error(`[服务器] ✗ 补录第${level}轮奖励失败:`, error.message);
            // 继续尝试补录其他轮次，不中断
          }
        }
        
        // 重新获取合约状态，确认补录结果
        try {
          const updatedSessionInfo = await getGameSession(sessionId);
          console.log(`[服务器] 补录后的合约状态:`);
          console.log(`  已完成的轮数: ${updatedSessionInfo.completedLevels}`);
          console.log(`  总奖励: ${updatedSessionInfo.totalReward} ETH`);
        } catch (updateError) {
          console.error('[服务器] 无法获取更新后的合约状态:', updateError.message);
        }
      } else if (actualCompletedLevels === contractCompletedLevels) {
        console.log(`[服务器] 所有轮次已正确记录，无需补录`);
      } else {
        console.warn(`[服务器] 警告：实际完成的轮数(${actualCompletedLevels})小于合约中记录的轮数(${contractCompletedLevels})，可能存在数据不一致`);
      }
      
      // 现在调用完成游戏
      try {
        await completeGame(sessionId);
        console.log(`[服务器] ✓ 智能合约：游戏成功完成，奖励已支付`);
      } catch (completeError) {
        console.error('[服务器] ✗ 调用智能合约完成游戏失败:', completeError.message);
        // 即使完成游戏失败，也返回成功，因为奖励已经记录
        // 玩家可以通过 claimReward 手动提取
      }
    } catch (error) {
      console.error('[服务器] 处理智能合约操作失败:', error);
      console.error('[服务器] 错误详情:', error.message);
      // 不阻止响应，只记录错误
    }
  }
  
  res.json({
    success: true,
    message: '游戏完成'
  });
});

// 获取游戏报表
app.get('/api/game/:sessionId/report', async (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  const metadata = gameSessionMetadata.get(sessionId) || {};
  
  // 如果是以太坊模式，从合约获取奖励信息
  let contractReward = null;
  if (metadata.gameMode === 'ethereum' && metadata.walletAddress) {
    try {
      const { getGameSession } = require('./utils/contract');
      const sessionInfo = await getGameSession(sessionId);
      contractReward = {
        totalReward: sessionInfo.totalReward,
        completedLevels: sessionInfo.completedLevels,
        isCompleted: sessionInfo.isCompleted
      };
    } catch (error) {
      console.error('[服务器] 获取合约奖励信息失败:', error);
      // 如果合约未配置，使用计算的奖励
      const report = gameState.getGameReport();
      contractReward = {
        totalReward: report.calculatedRewardETH || '0',
        completedLevels: report.completedLevels || 0,
        isCompleted: false
      };
    }
  }
  
  res.json({
    report: {
      ...gameState.getGameReport(),
      gameMode: metadata.gameMode,
      walletAddress: metadata.walletAddress,
      txHash: metadata.txHash,
      contractReward: contractReward
    }
  });
});

// ============================================
// ⚠️ 配置接口 - 用于运行时设置合约地址
// ============================================

// 设置合约地址（仅用于开发/测试，生产环境应使用环境变量）
app.post('/api/admin/set-contract-address', (req, res) => {
  const { address } = req.body;
  
  if (!address || !address.startsWith('0x')) {
    return res.status(400).json({ error: 'Invalid contract address' });
  }
  
  setContractAddress(address);
  const initialized = initializeContract();
  
  res.json({
    success: initialized,
    contractAddress: address,
    message: initialized ? '合约地址已设置并初始化成功' : '合约地址已设置但初始化失败'
  });
});

// 获取合约信息
app.get('/api/admin/contract-info', async (req, res) => {
  try {
    const { getContractBalance, CONTRACT_ADDRESS } = require('./utils/contract');
    const balance = await getContractBalance();
    
    res.json({
      contractAddress: CONTRACT_ADDRESS,
      balance: balance,
      isInitialized: CONTRACT_ADDRESS !== ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
