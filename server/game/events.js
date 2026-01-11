const { SYMBOL_TYPES } = require('./constants');
const { getAllSymbols } = require('./symbols');

// 事件类型
const EVENT_TYPES = {
  INCREASE_WEIGHT: 'increase_weight',      // 增加图像出现概率权重
  INCREASE_VALUE: 'increase_value',        // 增加图像基础倍率
  FULL_PATTERN_REWARD: 'full_pattern_reward' // 获得全满形状加分
};

// 生成随机事件
function generateRandomEvent() {
  const eventType = Object.values(EVENT_TYPES)[
    Math.floor(Math.random() * Object.values(EVENT_TYPES).length)
  ];
  
  // 随机选择一个图像（不包括扣分图像）
  const symbols = getAllSymbols().filter(s => !s.isNegative);
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  
  switch (eventType) {
    case EVENT_TYPES.INCREASE_WEIGHT:
      return {
        type: EVENT_TYPES.INCREASE_WEIGHT,
        symbolId: randomSymbol.id,
        symbolName: randomSymbol.name,
        description: `增加${randomSymbol.name}的出现概率权重100%`,
        weightIncrease: 1.0  // +100%
      };
    
    case EVENT_TYPES.INCREASE_VALUE:
      return {
        type: EVENT_TYPES.INCREASE_VALUE,
        symbolId: randomSymbol.id,
        symbolName: randomSymbol.name,
        description: `增加${randomSymbol.name}的基础倍率100%`,
        valueIncrease: 1.0  // +100%
      };
    
    case EVENT_TYPES.FULL_PATTERN_REWARD:
      return {
        type: EVENT_TYPES.FULL_PATTERN_REWARD,
        symbolId: randomSymbol.id,
        symbolName: randomSymbol.name,
        description: `获得${randomSymbol.name}的全满形状加分1次`,
        count: 1
      };
    
    default:
      return null;
  }
}

// 生成多个随机事件
function generateRandomEvents(count = 3) {
  const events = [];
  for (let i = 0; i < count; i++) {
    events.push(generateRandomEvent());
  }
  return events;
}

// 应用事件效果
function applyEvent(event, gameState) {
  switch (event.type) {
    case EVENT_TYPES.INCREASE_WEIGHT:
      const weightState = gameState.symbolStates[event.symbolId];
      if (weightState) {
        weightState.currentWeight += weightState.baseWeight * event.weightIncrease;
      }
      break;
    
    case EVENT_TYPES.INCREASE_VALUE:
      const valueState = gameState.symbolStates[event.symbolId];
      if (valueState) {
        valueState.currentValue += valueState.baseValue * event.valueIncrease;
      }
      break;
    
    case EVENT_TYPES.FULL_PATTERN_REWARD:
      if (!gameState.fullPatternRewards[event.symbolId]) {
        gameState.fullPatternRewards[event.symbolId] = 0;
      }
      gameState.fullPatternRewards[event.symbolId] += event.count;
      break;
  }
}

module.exports = {
  EVENT_TYPES,
  generateRandomEvent,
  generateRandomEvents,
  applyEvent
};
