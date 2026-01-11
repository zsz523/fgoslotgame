// 图像路径映射
export const SYMBOL_IMAGES = {
  artoria: '/images/symbols/愚人节_卡面_FFJ_002.png',
  gilgamesh: '/images/symbols/愚人节_卡面_FFJ_012.png',
  nobunaga: '/images/symbols/愚人节_卡面_FFJ_069.png',
  jeanne_alter: '/images/symbols/愚人节_卡面_FFJ_106.png',
  ishtar: '/images/symbols/愚人节_卡面_FFJ_142.png',
  nero: '/images/symbols/愚人节_卡面_FFJ_175.png',
  muramasa: '/images/symbols/愚人节_卡面_FFJ_302.png',
  phantasmoon: '/images/symbols/愚人节_卡面_FFJ_431.png',
  melt: '/images/symbols/愚人节_卡面_FFJ_163.png',
  solomon: '/images/symbols/愚人节_卡面_FFJ_083.png'
};

// 从者图片映射（根据servants.js中的imagePath）
export const SERVANT_IMAGES = {
  bb: '/images/servants/BB迪拜_status_1.png',
  enkidu: '/images/servants/Servant143正面2.png',
  hokusai: '/images/servants/Servant198正面2.png',
  scathach: '/images/servants/Servant215正面1.png',
  barvan: '/images/servants/バーヴァン・シー_status_1.png',
  morgan: '/images/servants/モルガン_status_1.png',
  caster: '/images/servants/阿尔托莉雅·卡斯特_status_2.png',
  karen: '/images/servants/阿摩耳〔卡莲〕_status_2.png',
  ere: '/images/servants/埃列什基伽勒(Beast)_status_1.png',
  oberon: '/images/servants/奥伯龙_status_1.png',
  aozaki: '/images/servants/超级青子_status.png',
  emiya: '/images/servants/Servant011正面1.png',
  bride_nero: '/images/servants/花嫁头像2.png',
  quetzalcoatl: '/images/servants/魁札尔·科亚特尔头像3.png',
  lilith: '/images/servants/莉莉丝_status_1.png',
  douman: '/images/servants/芦屋道满_status_1.png',
  romulus: '/images/servants/罗穆路斯·奎里努斯_status_2.png',
  melusine: '/images/servants/梅柳齐娜(Ruler)_status_1.png',
  ciel: '/images/servants/谜之代行者C.I.E.L_status_2.png',
  demon_king_nobunaga: '/images/servants/魔王信长_status_1.png',
  qin_shi_huang: '/images/servants/秦始皇_正面1.png',
  sei_shonagon: '/images/servants/清少纳言_status_1.png',
  reines: '/images/servants/司马懿_status_1.png',
  tai_gong_wang: '/images/servants/太公望_status_1.png',
  space_ishtar: '/images/servants/太空伊什塔尔_status_2.png',
  tezcatlipoca: '/images/servants/特斯卡特利波卡_status_1.png',
  king_hassan: '/images/servants/王哈头像3.png',
  musashi: '/images/servants/武藏头像3.png',
  osakabehime: '/images/servants/刑部姬头像2.png',
  arthur: '/images/servants/亚瑟·潘德拉贡-头像-2.png',
  edmond: '/images/servants/岩窟王_基督山_status_3.png',
  yang_guifei: '/images/servants/杨贵妃_status_2.png',
  elizabeth: '/images/servants/伊丽莎白·巴托里(SSR)_status_1.png'
};

export const CURRENCY_IMAGES = {
  saintQuartz: '/images/currency/圣晶石.png',
  quantum: '/images/currency/QP.png'
};

// 获取图像路径（带错误处理）
export function getSymbolImage(symbolId) {
  return SYMBOL_IMAGES[symbolId] || '/images/placeholder.png';
}

export function getServantImage(servantId) {
  return SERVANT_IMAGES[servantId] || '/images/placeholder.png';
}

export function getCurrencyImage(type) {
  return CURRENCY_IMAGES[type] || '/images/placeholder.png';
}
