const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GameState } = require('./game/GameState');
const { generateRandomGrid, calculateSpinReward, calculateAutoPatternReward } = require('./game/slotMachine');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// 存储游戏状态（实际应该用数据库或Redis）
const gameSessions = new Map();

// 创建新游戏
app.post('/api/game/new', (req, res) => {
  const gameState = new GameState();
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  gameSessions.set(sessionId, gameState);
  
  res.json({
    sessionId,
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities()
  });
});

// 获取游戏状态
app.get('/api/game/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities()
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

// 完成轮次
app.post('/api/game/:sessionId/level/complete', (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  gameState.completeLevel();
  
  // 如果通过了，completeLevel() 会自动调用 startNewLevel()，所以这里需要返回新轮的状态
  res.json({
    gameState: gameState.getGameState(),
    probabilities: gameState.calculateSymbolProbabilities(),
    isGameOver: gameState.isGameOver,
    isLevelComplete: gameState.isLevelComplete,
    events: gameState.events && gameState.events.length > 0 ? gameState.events : undefined
  });
});

// 获取游戏报表
app.get('/api/game/:sessionId/report', (req, res) => {
  const { sessionId } = req.params;
  const gameState = gameSessions.get(sessionId);
  
  if (!gameState) {
    return res.status(404).json({ error: 'Game session not found' });
  }
  
  res.json({
    report: gameState.getGameReport()
  });
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
