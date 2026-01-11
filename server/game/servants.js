const { SERVANT_IDS, SYMBOL_TYPES } = require('./constants.js');

// 从者定义
const SERVANTS = [
  {
    id: SERVANT_IDS.BB,
    name: 'BB',
    basePrice: 6,
    imagePath: 'BB迪拜_status_1.png',
    effectType: 'quantum_double',
    description: '所有来源获得的量子翻倍'
  },
  {
    id: SERVANT_IDS.ENKIDU,
    name: '恩奇都',
    basePrice: 3,
    imagePath: 'Servant143正面2.png',
    effectType: 'symbol_boost',
    symbolType: SYMBOL_TYPES.GILGAMESH,
    valueMultiplier: 1.0,  // +100%
    weightMultiplier: 1.0,  // +100%
    description: '吉尔伽美什类型的图像基础倍率提升100%，出现概率权重提升100%'
  },
  {
    id: SERVANT_IDS.HOKUSAI,
    name: '葛饰北斋',
    basePrice: 6,
    imagePath: 'Servant198正面2.png',
    effectType: 'extra_spin',
    extraSpins: 1,
    description: '每回合额外获得一次老虎机机会'
  },
  {
    id: SERVANT_IDS.SCATHACH,
    name: '斯卡蒂',
    basePrice: 9,
    imagePath: 'Servant215正面1.png',
    effectType: 'auto_pattern',
    patterns: ['top_v', 'bottom_v'],
    count: 1,
    description: '每回合开始时自动结算一次上v和下v形状的，当前倍率最高的图像的点数'
  },
  {
    id: SERVANT_IDS.BARVAN,
    name: '巴万希',
    basePrice: 3,
    imagePath: 'バーヴァン・シー_status_1.png',
    effectType: 'negative_symbol_reduce',
    valueMultiplier: -0.5,  // 减半
    weightMultiplier: -0.5,  // 减半
    description: '扣分图像的基础倍率减半，扣分图像的权重减半'
  },
  {
    id: SERVANT_IDS.MORGAN,
    name: '摩根',
    basePrice: 3,
    imagePath: 'モルガン_status_1.png',
    effectType: 'symbol_boost',
    symbolType: SYMBOL_TYPES.ARTORIA,
    valueMultiplier: 1.0,
    weightMultiplier: 1.0,
    description: '阿尔托莉雅类型的图像基础倍率提升100%，出现概率权重提升100%'
  },
  {
    id: SERVANT_IDS.CASTER,
    name: '卡斯特',
    basePrice: 9,
    imagePath: '阿尔托莉雅·卡斯特_status_2.png',
    effectType: 'saint_quartz_double',
    multiplier: 1.0,  // +100%
    description: '获得的圣晶石提升100%'
  },
  {
    id: SERVANT_IDS.KAREN,
    name: '卡莲',
    basePrice: 6,
    imagePath: '阿摩耳〔卡莲〕_status_2.png',
    effectType: 'auto_pattern',
    patterns: ['horizontal_3', 'vertical_3'],
    count: 2,
    description: '每回合开始时自动结算两次横三和竖三形状的，当前倍率最高的图像的点数'
  },
  {
    id: SERVANT_IDS.ERE,
    name: '艾蕾',
    basePrice: 6,
    imagePath: '埃列什基伽勒(Beast)_status_1.png',
    effectType: 'pattern_boost',
    patterns: ['top_v', 'bottom_v'],
    multiplier: 1.0,  // +100%
    description: '通过上v和下v获得的量子数量提升100%'
  },
  {
    id: SERVANT_IDS.OBERON,
    name: '奥博龙',
    basePrice: 6,
    imagePath: '奥伯龙_status_1.png',
    effectType: 'oberon_effect',
    startMultiplier: -0.5,  // -50%
    endMultiplier: 2.0,      // +200%
    description: '回合开始时，手中所持量子-50%，回合结束时，手中所持量子+200%'
  },
  {
    id: SERVANT_IDS.AOZAKI,
    name: '青子',
    basePrice: 6,
    imagePath: '超级青子_status.png',
    effectType: 'extra_round',
    extraRounds: 1,
    description: '每轮多一回合'
  },
  {
    id: SERVANT_IDS.EMIYA,
    name: '卫宫',
    basePrice: 3,
    imagePath: 'Servant011正面1.png',
    effectType: 'symbol_boost',
    symbolType: SYMBOL_TYPES.MURAMASA,
    valueMultiplier: 1.0,
    weightMultiplier: 1.0,
    description: '千子村正类型的图像基础倍率提升100%，出现概率权重提升100%'
  },
  {
    id: SERVANT_IDS.BRIDE_NERO,
    name: '花嫁尼禄',
    basePrice: 3,
    imagePath: '花嫁头像2.png',
    effectType: 'symbol_boost',
    symbolType: SYMBOL_TYPES.NERO,
    valueMultiplier: 1.0,
    weightMultiplier: 1.0,
    description: '尼禄类型的图像基础倍率提升100%，出现概率权重提升100%'
  },
  {
    id: SERVANT_IDS.QUETZALCOATL,
    name: '羽蛇神',
    basePrice: 6,
    imagePath: '魁札尔·科亚特尔头像3.png',
    effectType: 'auto_pattern',
    patterns: ['horizontal_5'],
    count: 3,
    description: '每回合开始时自动结算三次横五形状的，当前倍率最高的图像的点数'
  },
  {
    id: SERVANT_IDS.LILITH,
    name: '莉莉丝',
    basePrice: 9,
    imagePath: '莉莉丝_status_1.png',
    effectType: 'extra_event',
    extraEvents: 1,
    description: '每轮多获得一次选择事件的机会'
  },
  {
    id: SERVANT_IDS.DOUMAN,
    name: '卢屋道满',
    basePrice: 3,
    imagePath: '芦屋道满_status_1.png',
    effectType: 'symbol_boost',
    symbolType: SYMBOL_TYPES.SOLOMON,
    valueMultiplier: 1.0,
    weightMultiplier: 1.0,
    description: '扣分类型的图像基础倍率提升100%，出现概率权重提升100%'
  },
  {
    id: SERVANT_IDS.ROMULUS,
    name: '罗穆卢斯',
    basePrice: 9,
    imagePath: '罗穆路斯·奎里努斯_status_2.png',
    effectType: 'auto_pattern',
    patterns: ['full'],
    count: 1,
    description: '每回合开始时自动结算一次全满形状的，当前倍率最高的图像的点数'
  },
  {
    id: SERVANT_IDS.MELUSINE,
    name: '梅柳齐娜',
    basePrice: 9,
    imagePath: '梅柳齐娜(Ruler)_status_1.png',
    effectType: 'price_reduction',
    reduction: 1,  // 降一档
    description: '所有从者价格下降一档：9个变6个，6个变3个，3个变免费'
  },
  {
    id: SERVANT_IDS.CIEL,
    name: '西耶尔',
    basePrice: 3,
    imagePath: '谜之代行者C.I.E.L_status_2.png',
    effectType: 'symbol_boost',
    symbolType: SYMBOL_TYPES.PHANTASMOON,
    valueMultiplier: 1.0,
    weightMultiplier: 1.0,
    description: 'phantasmoon类型的图像基础倍率提升100%，出现概率权重提升100%'
  },
  {
    id: SERVANT_IDS.DEMON_KING_NOBUNAGA,
    name: '魔王信长',
    basePrice: 3,
    imagePath: '魔王信长_status_1.png',
    effectType: 'symbol_boost',
    symbolType: SYMBOL_TYPES.NOBUNAGA,
    valueMultiplier: 1.0,
    weightMultiplier: 1.0,
    description: '织田信长类型的图像基础倍率提升100%，出现概率权重提升100%'
  },
  {
    id: SERVANT_IDS.QIN_SHI_HUANG,
    name: '始皇帝',
    basePrice: 9,
    imagePath: '秦始皇_正面1.png',
    effectType: 'target_reduction',
    reduction: 0.25,  // -25%
    description: '每轮需要达到的目标下降25%'
  },
  {
    id: SERVANT_IDS.SEI_SHONAGON,
    name: '青少纳言',
    basePrice: 0,
    imagePath: '清少纳言_status_1.png',
    effectType: 'refresh_shop',
    isOneTime: true,
    description: '更新一次从者商店，然后失效（一次性）'
  },
  {
    id: SERVANT_IDS.REINES,
    name: '莱尼斯',
    basePrice: 3,
    imagePath: '司马懿_status_1.png',
    effectType: 'permanent_price_reduction',
    reduction: 1,
    description: '购买从者的价格永久-1'
  },
  {
    id: SERVANT_IDS.TAI_GONG_WANG,
    name: '太公望',
    basePrice: 3,
    imagePath: '太公望_status_1.png',
    effectType: 'random_servant',
    isOneTime: true,
    description: '变成随机一个从者，然后失效（一次性）'
  },
  {
    id: SERVANT_IDS.SPACE_ISHTAR,
    name: '太空伊什塔尔',
    basePrice: 3,
    imagePath: '太空伊什塔尔_status_2.png',
    effectType: 'symbol_boost',
    symbolType: SYMBOL_TYPES.ISHTAR,
    valueMultiplier: 1.0,
    weightMultiplier: 1.0,
    description: '伊什塔尔类型的图像基础倍率提升100%，出现概率权重提升100%'
  },
  {
    id: SERVANT_IDS.TEZCATLIPOCA,
    name: '烟雾镜',
    basePrice: 6,
    imagePath: '特斯卡特利波卡_status_1.png',
    effectType: 'random_servant_price',
    targetPrice: 9,
    isOneTime: true,
    description: '变成随机一个9圣晶石的从者，然后失效（一次性）'
  },
  {
    id: SERVANT_IDS.KING_HASSAN,
    name: '王哈桑',
    basePrice: 3,
    imagePath: '王哈头像3.png',
    effectType: 'immune_negative',
    description: '免疫扣分图像的扣除量子效果'
  },
  {
    id: SERVANT_IDS.MUSASHI,
    name: '武藏',
    basePrice: 0,
    imagePath: '武藏头像3.png',
    effectType: 'random_servant_price',
    targetPrice: 3,
    isOneTime: true,
    description: '变成随机一个3圣晶石的从者，然后失效（一次性）'
  },
  {
    id: SERVANT_IDS.OSAKABEHIME,
    name: '刑部姬',
    basePrice: 3,
    imagePath: '刑部姬头像2.png',
    effectType: 'symbol_boost',
    symbolType: SYMBOL_TYPES.MELT,
    valueMultiplier: 1.0,
    weightMultiplier: 1.0,
    description: '梅尔特莉莉丝类型的图像基础倍率提升100%，出现概率权重提升100%'
  },
  {
    id: SERVANT_IDS.ARTHUR,
    name: '亚瑟',
    basePrice: 6,
    imagePath: '亚瑟·潘德拉贡-头像-2.png',
    effectType: 'disable_negative',
    description: '扣分图像不在扣分，且不在触发连携时将累计分数扣完'
  },
  {
    id: SERVANT_IDS.EDMOND,
    name: '伯爵',
    basePrice: 3,
    imagePath: '岩窟王_基督山_status_3.png',
    effectType: 'symbol_boost',
    symbolType: SYMBOL_TYPES.JEANNE_ALTER,
    valueMultiplier: 1.0,
    weightMultiplier: 1.0,
    description: '贞德alter类型的图像基础倍率提升100%，出现概率权重提升100%'
  },
  {
    id: SERVANT_IDS.YANG_GUIFEI,
    name: '杨贵妃',
    basePrice: 3,
    imagePath: '杨贵妃_status_2.png',
    effectType: 'random_servant_price',
    targetPrice: 6,
    isOneTime: true,
    description: '变成随机一个6圣晶石的从者，然后失效（一次性）'
  },
  {
    id: SERVANT_IDS.ELIZABETH,
    name: '龙娘',
    basePrice: 9,
    imagePath: '伊丽莎白·巴托里(SSR)_status_1.png',
    effectType: 'random_servants',
    count: 2,
    isOneTime: true,
    description: '变成随机两个从者，然后失效（一次性）'
  }
];

// 获取从者配置
function getServant(id) {
  return SERVANTS.find(s => s.id === id);
}

// 获取所有从者
function getAllServants() {
  return SERVANTS;
}

// 获取随机从者
function getRandomServant() {
  return SERVANTS[Math.floor(Math.random() * SERVANTS.length)];
}

// 根据价格获取随机从者
function getRandomServantByPrice(price) {
  const servants = SERVANTS.filter(s => s.basePrice === price);
  if (servants.length === 0) return null;
  return servants[Math.floor(Math.random() * servants.length)];
}

module.exports = {
  SERVANTS,
  getServant,
  getAllServants,
  getRandomServant,
  getRandomServantByPrice
};
