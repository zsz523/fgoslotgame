const { SYMBOL_TYPES, BASE_SYMBOL_VALUE } = require('./constants.js');

// 图像定义
const SYMBOLS = [
  {
    id: SYMBOL_TYPES.ARTORIA,
    name: '阿尔托莉雅',
    baseValue: BASE_SYMBOL_VALUE,
    baseWeight: 1,
    isNegative: false,
    imagePath: '愚人节_卡面_FFJ_002.png'
  },
  {
    id: SYMBOL_TYPES.GILGAMESH,
    name: '吉尔伽美什',
    baseValue: BASE_SYMBOL_VALUE,
    baseWeight: 1,
    isNegative: false,
    imagePath: '愚人节_卡面_FFJ_012.png'
  },
  {
    id: SYMBOL_TYPES.NOBUNAGA,
    name: '织田信长',
    baseValue: BASE_SYMBOL_VALUE,
    baseWeight: 1,
    isNegative: false,
    imagePath: '愚人节_卡面_FFJ_069.png'
  },
  {
    id: SYMBOL_TYPES.JEANNE_ALTER,
    name: '贞德alter',
    baseValue: BASE_SYMBOL_VALUE,
    baseWeight: 1,
    isNegative: false,
    imagePath: '愚人节_卡面_FFJ_106.png'
  },
  {
    id: SYMBOL_TYPES.ISHTAR,
    name: '伊什塔尔',
    baseValue: BASE_SYMBOL_VALUE,
    baseWeight: 1,
    isNegative: false,
    imagePath: '愚人节_卡面_FFJ_142.png'
  },
  {
    id: SYMBOL_TYPES.NERO,
    name: '尼禄',
    baseValue: BASE_SYMBOL_VALUE,
    baseWeight: 1,
    isNegative: false,
    imagePath: '愚人节_卡面_FFJ_175.png'
  },
  {
    id: SYMBOL_TYPES.MURAMASA,
    name: '千子村正',
    baseValue: BASE_SYMBOL_VALUE,
    baseWeight: 1,
    isNegative: false,
    imagePath: '愚人节_卡面_FFJ_302.png'
  },
  {
    id: SYMBOL_TYPES.PHANTASMOON,
    name: 'phantasmoon',
    baseValue: BASE_SYMBOL_VALUE,
    baseWeight: 1,
    isNegative: false,
    imagePath: '愚人节_卡面_FFJ_431.png'
  },
  {
    id: SYMBOL_TYPES.MELT,
    name: '梅尔特莉莉丝',
    baseValue: BASE_SYMBOL_VALUE,
    baseWeight: 1,
    isNegative: false,
    imagePath: '愚人节_卡面_FFJ_163.png'
  },
  {
    id: SYMBOL_TYPES.SOLOMON,
    name: '所罗门',
    baseValue: BASE_SYMBOL_VALUE,
    baseWeight: 1,
    isNegative: true,
    imagePath: '愚人节_卡面_FFJ_083.png'
  }
];

// 获取图像配置
function getSymbol(id) {
  return SYMBOLS.find(s => s.id === id);
}

// 获取所有图像
function getAllSymbols() {
  return SYMBOLS;
}

module.exports = {
  SYMBOLS,
  getSymbol,
  getAllSymbols
};
