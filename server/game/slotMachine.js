const { PATTERN_TYPES, PATTERN_MULTIPLIERS } = require('./constants');

// 3x5 网格位置
const GRID_ROWS = 3;
const GRID_COLS = 5;

// 检测所有形状
function detectPatterns(grid, symbolStates, activeServants) {
  const patterns = [];
  const symbolIds = Object.keys(symbolStates);
  
  // 检测每种图像的所有形状（包括扣分图像）
  symbolIds.forEach(symbolId => {
    // 扣分图像也可以形成形状，用于触发清零效果
    
    // 横三
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col <= GRID_COLS - 3; col++) {
        if (grid[row][col] === symbolId &&
            grid[row][col + 1] === symbolId &&
            grid[row][col + 2] === symbolId) {
          patterns.push({
            type: PATTERN_TYPES.HORIZONTAL_3,
            symbolId,
            positions: [[row, col], [row, col + 1], [row, col + 2]]
          });
        }
      }
    }
    
    // 竖三
    for (let row = 0; row <= GRID_ROWS - 3; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (grid[row][col] === symbolId &&
            grid[row + 1][col] === symbolId &&
            grid[row + 2][col] === symbolId) {
          patterns.push({
            type: PATTERN_TYPES.VERTICAL_3,
            symbolId,
            positions: [[row, col], [row + 1, col], [row + 2, col]]
          });
        }
      }
    }
    
    // 横五
    for (let row = 0; row < GRID_ROWS; row++) {
      if (grid[row][0] === symbolId &&
          grid[row][1] === symbolId &&
          grid[row][2] === symbolId &&
          grid[row][3] === symbolId &&
          grid[row][4] === symbolId) {
        patterns.push({
          type: PATTERN_TYPES.HORIZONTAL_5,
          symbolId,
          positions: [[row, 0], [row, 1], [row, 2], [row, 3], [row, 4]]
        });
      }
    }
    
    // 上V: (0,0), (0,4), (1,1), (1,3), (2,2)
    if (grid[0][0] === symbolId &&
        grid[0][4] === symbolId &&
        grid[1][1] === symbolId &&
        grid[1][3] === symbolId &&
        grid[2][2] === symbolId) {
      patterns.push({
        type: PATTERN_TYPES.TOP_V,
        symbolId,
        positions: [[0, 0], [0, 4], [1, 1], [1, 3], [2, 2]]
      });
    }
    
    // 下V: (2,0), (2,4), (1,1), (1,3), (0,2)
    if (grid[2][0] === symbolId &&
        grid[2][4] === symbolId &&
        grid[1][1] === symbolId &&
        grid[1][3] === symbolId &&
        grid[0][2] === symbolId) {
      patterns.push({
        type: PATTERN_TYPES.BOTTOM_V,
        symbolId,
        positions: [[2, 0], [2, 4], [1, 1], [1, 3], [0, 2]]
      });
    }
    
    // 全满：所有15个格子都是同一图像
    let isFull = true;
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (grid[row][col] !== symbolId) {
          isFull = false;
          break;
        }
      }
      if (!isFull) break;
    }
    
    if (isFull) {
      patterns.push({
        type: PATTERN_TYPES.FULL,
        symbolId,
        positions: Array.from({ length: 15 }, (_, i) => [Math.floor(i / 5), i % 5])
      });
    }
  });
  
  return patterns;
}

// 计算形状奖励
function calculatePatternReward(pattern, symbolStates, activeServants) {
  const symbolState = symbolStates[pattern.symbolId];
  if (!symbolState) return 0;
  
  let baseValue = symbolState.currentValue;
  let multiplier = PATTERN_MULTIPLIERS[pattern.type];
  
  // 艾蕾效果：上V和下V倍率提升100%
  if ((pattern.type === PATTERN_TYPES.TOP_V || pattern.type === PATTERN_TYPES.BOTTOM_V)) {
    const hasEre = activeServants.some(s => s.id === 'ere');
    if (hasEre) {
      multiplier *= 2;
    }
  }
  
  return baseValue * multiplier;
}

// 生成随机网格（根据概率）
function generateRandomGrid(probabilities) {
  const grid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
  
  // 创建权重数组
  const symbols = Object.keys(probabilities);
  const weights = symbols.map(id => {
    const prob = probabilities[id];
    return prob && prob.weight ? Math.max(0, prob.weight) : 0;
  });
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  if (totalWeight === 0) {
    // 如果总权重为0，随机分配
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        grid[row][col] = symbols[Math.floor(Math.random() * symbols.length)] || symbols[0];
      }
    }
  } else {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const random = Math.random() * totalWeight;
        let cumulative = 0;
        
        for (let i = 0; i < symbols.length; i++) {
          cumulative += weights[i];
          if (random <= cumulative) {
            grid[row][col] = symbols[i];
            break;
          }
        }
      }
    }
  }
  
  return grid;
}

// 计算单次旋转的奖励
function calculateSpinReward(grid, symbolStates, activeServants, fullPatternRewards = {}, turnQuantum = 0) {
  let totalReward = 0;
  let hasNegativePattern = false;
  
  // 检测所有形状（包括扣分图像的形状）
  const patterns = detectPatterns(grid, symbolStates, activeServants);
  
  // 检查是否有扣分图像形成形状
  patterns.forEach(pattern => {
    const symbolState = symbolStates[pattern.symbolId];
    if (symbolState && symbolState.isNegative) {
      hasNegativePattern = true;
    }
  });
  
  // 王哈桑或亚瑟效果：免疫扣分
  const hasKingHassan = activeServants.some(s => s.id === 'king_hassan');
  const hasArthur = activeServants.some(s => s.id === 'arthur');
  
  // 如果扣分图像形成形状，且没有免疫效果，则清零本回合累计的量子
  // 但需要返回所有形状信息（包括扣分图像和其他形状），以便前端高亮显示
  if (hasNegativePattern && !hasKingHassan && !hasArthur) {
    // 扣掉本回合到现在位置的所有点数，但返回所有形状信息用于高亮
    // 这样前端可以同时高亮扣分图像的形状和其他形状
    return { reward: -turnQuantum, hasNegative: true, patterns: patterns };
  }
  
  // 计算每个形状的奖励（只计算非扣分图像的形状）
  patterns.forEach(pattern => {
    const symbolState = symbolStates[pattern.symbolId];
    // 只计算非扣分图像的奖励
    if (!symbolState || !symbolState.isNegative) {
      const reward = calculatePatternReward(pattern, symbolStates, activeServants);
      totalReward += reward;
    }
  });
  
  // 全满形状奖励（事件）
  // 注意：这里需要修改fullPatternRewards对象来减少计数，但为了不修改传入的对象，我们在返回时标记
  const triggeredFullRewards = {};
  
  // 调试：检查全满奖励配置
  const fullRewardsKeys = Object.keys(fullPatternRewards || {});
  if (fullRewardsKeys.length > 0) {
    console.log(`\n[全满奖励检查] 待触发的全满奖励:`, JSON.stringify(fullPatternRewards));
  }
  
  // 检查网格内容（调试用）
  const gridSymbols = new Set();
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      gridSymbols.add(grid[row][col]);
    }
  }
  console.log(`[全满奖励检查] 当前网格中的图像:`, Array.from(gridSymbols));
  console.log(`[全满奖励检查] 网格内容:`, JSON.stringify(grid));
  
  // 使用与detectPatterns相同的逻辑检查全满
  Object.entries(fullPatternRewards || {}).forEach(([symbolId, count]) => {
    if (count > 0) {
      // 使用与detectPatterns相同的全满检测逻辑
      let isFull = true;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          if (grid[row][col] !== symbolId) {
            isFull = false;
            break;
          }
        }
        if (!isFull) break;
      }
      
      console.log(`[全满奖励检查] ${symbolId}: 计数=${count}, 是否全满=${isFull}`);
      
      if (isFull) {
        const symbolState = symbolStates[symbolId];
        if (symbolState) {
          const fullReward = symbolState.currentValue * PATTERN_MULTIPLIERS[PATTERN_TYPES.FULL] * count;
          totalReward += fullReward;
          triggeredFullRewards[symbolId] = count;
          console.log(`\n[全满形状奖励] ${symbolId} 全满形状触发！`);
          console.log(`  图像倍率: ${symbolState.currentValue.toLocaleString()}`);
          console.log(`  全满倍率: ${PATTERN_MULTIPLIERS[PATTERN_TYPES.FULL]}x`);
          console.log(`  奖励次数: ${count}`);
          console.log(`  总奖励: +${fullReward.toLocaleString()} 量子`);
        } else {
          console.log(`[全满奖励检查] 警告: ${symbolId} 的 symbolState 不存在`);
        }
      }
    }
  });
  
  // BB效果：所有量子翻倍（最后结算）
  const hasBB = activeServants.some(s => s.id === 'bb');
  if (hasBB && totalReward > 0) {
    totalReward *= 2;
  }
  
  // 返回所有形状信息（包括扣分图像的形状，即使它们不计算奖励）
  return {
    reward: totalReward,
    hasNegative: hasNegativePattern && !hasKingHassan && !hasArthur,
    patterns: patterns,  // 返回所有检测到的形状，确保前端能高亮所有形状
    triggeredFullRewards: triggeredFullRewards  // 返回触发的全满奖励，用于减少计数
  };
}

// 自动结算形状（斯卡蒂、卡莲等效果）
function calculateAutoPatternReward(patternType, symbolStates, activeServants, count = 1) {
  // 找到当前倍率最高的图像
  let maxValueSymbol = null;
  let maxValue = 0;
  
  Object.entries(symbolStates).forEach(([id, state]) => {
    if (!state.isNegative && state.currentValue > maxValue) {
      maxValue = state.currentValue;
      maxValueSymbol = id;
    }
  });
  
  if (!maxValueSymbol) return 0;
  
  const pattern = {
    type: patternType,
    symbolId: maxValueSymbol
  };
  
  const rewardPerPattern = calculatePatternReward(pattern, symbolStates, activeServants);
  return rewardPerPattern * count;
}

module.exports = {
  detectPatterns,
  calculatePatternReward,
  generateRandomGrid,
  calculateSpinReward,
  calculateAutoPatternReward
};
