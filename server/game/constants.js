// 图像类型枚举
const SYMBOL_TYPES = {
  ARTORIA: 'artoria',           // 阿尔托莉雅
  GILGAMESH: 'gilgamesh',       // 吉尔伽美什
  NOBUNAGA: 'nobunaga',         // 织田信长
  JEANNE_ALTER: 'jeanne_alter', // 贞德alter
  ISHTAR: 'ishtar',             // 伊什塔尔
  NERO: 'nero',                 // 尼禄
  MURAMASA: 'muramasa',         // 千子村正
  PHANTASMOON: 'phantasmoon',   // phantasmoon
  MELT: 'melt',                 // 梅尔特莉莉丝
  SOLOMON: 'solomon'            // 所罗门（扣分图像）
};

// 从者ID枚举
const SERVANT_IDS = {
  BB: 'bb',
  ENKIDU: 'enkidu',
  HOKUSAI: 'hokusai',
  SCATHACH: 'scathach',
  BARVAN: 'barvan',
  MORGAN: 'morgan',
  CASTER: 'caster',
  KAREN: 'karen',
  ERE: 'ere',
  OBERON: 'oberon',
  AOZAKI: 'aozaki',
  EMIYA: 'emiya',
  BRIDE_NERO: 'bride_nero',
  QUETZALCOATL: 'quetzalcoatl',
  LILITH: 'lilith',
  DOUMAN: 'douman',
  ROMULUS: 'romulus',
  MELUSINE: 'melusine',
  CIEL: 'ciel',
  DEMON_KING_NOBUNAGA: 'demon_king_nobunaga',
  QIN_SHI_HUANG: 'qin_shi_huang',
  SEI_SHONAGON: 'sei_shonagon',
  REINES: 'reines',
  TAI_GONG_WANG: 'tai_gong_wang',
  SPACE_ISHTAR: 'space_ishtar',
  TEZCATLIPOCA: 'tezcatlipoca',
  KING_HASSAN: 'king_hassan',
  MUSASHI: 'musashi',
  OSAKABEHIME: 'osakabehime',
  ARTHUR: 'arthur',
  EDMOND: 'edmond',
  YANG_GUIFEI: 'yang_guifei',
  ELIZABETH: 'elizabeth'
};

// 形状类型
const PATTERN_TYPES = {
  HORIZONTAL_3: 'horizontal_3',  // 横三
  VERTICAL_3: 'vertical_3',      // 竖三
  HORIZONTAL_5: 'horizontal_5',  // 横五
  TOP_V: 'top_v',                // 上v
  BOTTOM_V: 'bottom_v',          // 下v
  FULL: 'full'                    // 全满
};

// 形状倍率
const PATTERN_MULTIPLIERS = {
  [PATTERN_TYPES.HORIZONTAL_3]: 9,      // 每格3倍，共9倍
  [PATTERN_TYPES.VERTICAL_3]: 9,        // 每格3倍，共9倍
  [PATTERN_TYPES.HORIZONTAL_5]: 25,     // 每格5倍，共25倍
  [PATTERN_TYPES.TOP_V]: 35,            // 35倍
  [PATTERN_TYPES.BOTTOM_V]: 35,         // 35倍
  [PATTERN_TYPES.FULL]: 225             // 225倍
};

// 基础图像倍率（量子）
const BASE_SYMBOL_VALUE = 1000;

// 基础回合数
const BASE_ROUNDS_PER_LEVEL = 7;

// 每轮目标量子数
const LEVEL_TARGETS = {
  1: 100000,
  2: 500000,
  3: 1500000,
  4: 4000000,
  5: 7500000
};

// 计算后续轮数的目标（使用递增函数）
function getLevelTarget(level) {
  if (level <= 5) {
    return LEVEL_TARGETS[level];
  }
  // 第6轮开始：7500000 * 1.5^(level-5)
  return Math.floor(LEVEL_TARGETS[5] * Math.pow(1.5, level - 5));
}

// 初始入场费（量子）
const INITIAL_ENTRY_FEE = 0.05; // ETH（暂时不实现）
const INITIAL_QUANTUM = 10000;

// 回合选择价格倍数
const TURN_COST_MULTIPLIER = {
  CHEAP: 3000,   // 3次机会 + 2圣晶石
  EXPENSIVE: 7000 // 7次机会 + 1圣晶石
};

module.exports = {
  SYMBOL_TYPES,
  SERVANT_IDS,
  PATTERN_TYPES,
  PATTERN_MULTIPLIERS,
  BASE_SYMBOL_VALUE,
  BASE_ROUNDS_PER_LEVEL,
  LEVEL_TARGETS,
  getLevelTarget,
  INITIAL_ENTRY_FEE,
  INITIAL_QUANTUM,
  TURN_COST_MULTIPLIER
};
