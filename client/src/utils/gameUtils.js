// 游戏工具函数

// 每轮目标量子数
const LEVEL_TARGETS = {
  1: 100000,
  2: 500000,
  3: 1500000,
  4: 4000000,
  5: 7500000
};

// 计算后续轮数的目标（使用递增函数）
export function getLevelTarget(level) {
  if (level <= 5) {
    return LEVEL_TARGETS[level];
  }
  // 第6轮开始：7500000 * 1.5^(level-5)
  return Math.floor(LEVEL_TARGETS[5] * Math.pow(1.5, level - 5));
}

// 计算调整后的目标（考虑始皇帝效果）
export function getAdjustedTarget(level, hasQinShiHuang) {
  const baseTarget = getLevelTarget(level);
  if (hasQinShiHuang) {
    return baseTarget * 0.75;
  }
  return baseTarget;
}
