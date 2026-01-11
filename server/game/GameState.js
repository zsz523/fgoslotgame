const { getLevelTarget } = require('./constants');
const { getAllSymbols } = require('./symbols');
const { getAllServants, getRandomServant, getRandomServantByPrice } = require('./servants');
const { generateRandomEvents, applyEvent } = require('./events');

class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    // 基础资源
    this.quantum = 10000;  // 初始量子
    this.saintQuartz = 0;  // 圣晶石
    this.level = 1;        // 当前轮数
    this.round = 0;        // 当前回合（每轮内的回合）
    this.maxRounds = 7;    // 每轮最大回合数
    
    // 游戏状态
    this.isGameOver = false;
    this.isLevelComplete = false;
    this.currentTurn = null;  // 当前回合选择（'cheap' 或 'expensive'）
    this.spinsRemaining = 0;  // 剩余旋转次数
    this.slotResults = null;  // 老虎机结果（3x5数组）
    
    // 从者系统
    this.activeServants = [];  // 出战从者（最多5个）
    this.inventoryServants = []; // 仓库从者
    this.shopServants = [];     // 商店从者（每回合刷新3个）
    this.servantPriceReduction = 0; // 永久价格减免
    
    // 初始化商店
    this.refreshShop();
    
    // 图像状态（动态权重和倍率）
    this.symbolStates = {};
    this.initializeSymbolStates();
    
    // 事件系统
    this.events = [];  // 当前可选事件
    this.eventChoices = []; // 已选择的事件
    this.fullPatternRewards = {};  // 全满形状奖励 {symbolId: count}
    
    // 回合内量子（用于奥博龙等效果）
    this.turnStartQuantum = 0;
    this.turnQuantum = 0;  // 当前回合获得的量子
    
    // 特殊效果标记
    this.hasBB = false;  // BB的量子翻倍
    this.hasKingHassan = false;  // 王哈桑免疫扣分
    this.hasArthur = false;  // 亚瑟禁用扣分
    this.hasOberon = false;  // 奥博龙
    this.oberonApplied = false;  // 奥博龙效果是否已应用
    
    // 自动结算标记（斯卡蒂、卡莲等）
    this.autoPatterns = [];
  }

  initializeSymbolStates() {
    const symbols = getAllSymbols();
    symbols.forEach(symbol => {
      this.symbolStates[symbol.id] = {
        baseValue: symbol.baseValue,
        currentValue: symbol.baseValue,
        baseWeight: symbol.baseWeight,
        currentWeight: symbol.baseWeight,
        isNegative: symbol.isNegative
      };
    });
  }

  // 计算图像概率
  calculateSymbolProbabilities() {
    const totalWeight = Object.values(this.symbolStates).reduce(
      (sum, state) => sum + Math.max(0, state.currentWeight), 0
    );
    
    const probabilities = {};
    Object.entries(this.symbolStates).forEach(([id, state]) => {
      probabilities[id] = {
        probability: totalWeight > 0 ? Math.max(0, state.currentWeight) / totalWeight : 0,
        value: state.currentValue,
        weight: state.currentWeight
      };
    });
    
    return probabilities;
  }

  // 开始新轮
  startNewLevel() {
    // 只有在不是第一次开始第一轮时才增加level
    // 如果level=1且round=0，说明是第一次开始第一轮，不增加level
    // 如果是从completeLevel()自动调用的，说明已经完成了一轮，应该增加level
    const oldLevel = this.level;
    const oldRound = this.round;
    
    // 防止重复调用：如果round已经是0且level没有变化，说明可能重复调用了
    if (this.round === 0 && oldLevel === this.level && oldLevel > 1) {
      console.log(`[开始新轮] 警告：可能重复调用！level=${this.level}, round=${this.round}`);
      console.trace('[开始新轮] 调用堆栈：');
      return;
    }
    
    if (!(this.level === 1 && this.round === 0)) {
      this.level++;
    }
    
    console.log(`[开始新轮] 调用前: level=${oldLevel}, round=${oldRound} → 调用后: level=${this.level}, round=0`);
    
    this.round = 0;
    this.isLevelComplete = false;
    this.maxRounds = 7;
    
    // 检查青子的额外回合
    if (this.hasServant('aozaki')) {
      this.maxRounds += 1;
    }
    
    // 刷新商店
    this.refreshShop();
    
    // 生成事件
    this.generateEvents();
    
    // 重置回合状态
    this.resetTurnState();
    
    console.log(`[开始新轮] 第${this.level}轮开始，目标量子: ${getLevelTarget(this.level).toLocaleString()}`);
  }

  // 刷新商店
  refreshShop() {
    const allServants = getAllServants();
    const available = allServants.filter(s => 
      !this.activeServants.some(as => as.id === s.id) &&
      !this.inventoryServants.some(is => is.id === s.id)
    );
    
    // 随机选择3个
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    this.shopServants = shuffled.slice(0, 3).map(s => ({
      ...s,
      price: this.calculateServantPrice(s)
    }));
  }

  // 计算从者价格（考虑减免）
  calculateServantPrice(servant) {
    let price = servant.basePrice;
    
    // 梅柳齐娜效果：降一档
    if (this.hasServant('melusine')) {
      if (price === 9) price = 6;
      else if (price === 6) price = 3;
      else if (price === 3) price = 0;
    }
    
    // 莱尼斯效果：永久-1
    price = Math.max(0, price - this.servantPriceReduction);
    
    return price;
  }

  // 购买从者
  buyServant(servantId) {
    console.log(`\n[购买从者] 尝试购买: ${servantId}`);
    console.log(`  当前圣晶石: ${this.saintQuartz}`);
    console.log(`  商店从者: ${this.shopServants.map(s => `${s.name}(${s.id})`).join(', ')}`);
    
    const servant = this.shopServants.find(s => s.id === servantId);
    if (!servant) {
      console.log(`  错误: 从者不存在于商店中`);
      return false;
    }
    
    console.log(`  找到从者: ${servant.name}, 价格: ${servant.price}`);
    
    if (this.saintQuartz < servant.price) {
      console.log(`  错误: 圣晶石不足 (需要${servant.price}, 当前${this.saintQuartz})`);
      return false;
    }
    
    const saintQuartzBefore = this.saintQuartz;
    this.saintQuartz -= servant.price;
    console.log(`  圣晶石变化: ${saintQuartzBefore} → ${this.saintQuartz} (-${servant.price})`);
    
    // 清少纳言：购买后立即刷新商店（一次性效果）
    if (servant.effectType === 'refresh_shop' && servant.isOneTime) {
      console.log(`  清少纳言效果: 立即刷新商店`);
      this.refreshShop();
      // 不添加到仓库，直接失效
      this.shopServants = this.shopServants.filter(s => s.id !== servantId);
      console.log(`  购买完成（一次性从者，已刷新商店）\n`);
      return true;
    }
    
    // 添加到仓库
    const servantCopy = { ...servant };
    delete servantCopy.price;
    this.inventoryServants.push(servantCopy);
    console.log(`  已添加到仓库: ${servantCopy.name}`);
    
    // 从商店移除
    this.shopServants = this.shopServants.filter(s => s.id !== servantId);
    
    // 补货：如果商店少于3个从者，补充一个同价格的从者
    if (this.shopServants.length < 3) {
      console.log(`  商店从者不足3个，补货中...`);
      this.restockServant(servant.basePrice);
      console.log(`  补货完成，当前商店从者: ${this.shopServants.map(s => s.name).join(', ')}`);
    }
    
    console.log(`  购买完成\n`);
    return true;
  }

  // 补货从者（购买后补充同价格的从者）
  restockServant(price) {
    const allServants = getAllServants();
    const available = allServants.filter(s => 
      s.basePrice === price &&
      !this.activeServants.some(as => as.id === s.id) &&
      !this.inventoryServants.some(is => is.id === s.id) &&
      !this.shopServants.some(ss => ss.id === s.id)
    );
    
    if (available.length > 0) {
      const randomServant = available[Math.floor(Math.random() * available.length)];
      this.shopServants.push({
        ...randomServant,
        price: this.calculateServantPrice(randomServant)
      });
    }
  }

  // 花费圣晶石刷新商店
  refreshShopWithQuartz() {
    console.log(`\n[刷新商店] 尝试刷新商店`);
    console.log(`  当前圣晶石: ${this.saintQuartz}`);
    
    if (this.saintQuartz < 1) {
      console.log(`  错误: 圣晶石不足 (需要1, 当前${this.saintQuartz})`);
      return false;
    }
    
    const saintQuartzBefore = this.saintQuartz;
    this.saintQuartz -= 1;
    console.log(`  圣晶石变化: ${saintQuartzBefore} → ${this.saintQuartz} (-1)`);
    
    const shopBefore = this.shopServants.map(s => s.name).join(', ');
    this.refreshShop();
    const shopAfter = this.shopServants.map(s => s.name).join(', ');
    console.log(`  商店刷新: [${shopBefore}] → [${shopAfter}]`);
    console.log(`  刷新完成\n`);
    return true;
  }

  // 激活从者（从仓库移到出战栏）
  activateServant(servantId) {
    console.log(`\n[激活从者] 尝试激活: ${servantId}`);
    console.log(`  当前出战从者数: ${this.activeServants.length}/5`);
    console.log(`  仓库从者: ${this.inventoryServants.map(s => `${s.name}(${s.id})`).join(', ') || '无'}`);
    
    if (this.activeServants.length >= 5) {
      console.log(`  错误: 出战栏已满`);
      return false;
    }
    
    const servant = this.inventoryServants.find(s => s.id === servantId);
    if (!servant) {
      console.log(`  错误: 从者不存在于仓库中`);
      return false;
    }
    
    // 记录激活前的状态
    const quantumBefore = this.quantum;
    const saintQuartzBefore = this.saintQuartz;
    const symbolStatesBefore = JSON.parse(JSON.stringify(this.symbolStates));
    
    // 从仓库移除
    this.inventoryServants = this.inventoryServants.filter(s => s.id !== servantId);
    
    // 添加到出战栏
    this.activeServants.push(servant);
    
    console.log(`  找到从者: ${servant.name} (${servant.id})`);
    console.log(`  效果类型: ${servant.effectType}`);
    
    // 执行从者技能
    this.applyServantEffect(servant);
    
    console.log(`  当前出战从者数: ${this.activeServants.length}/5`);
    
    // 记录数值变化
    if (this.quantum !== quantumBefore) {
      console.log(`  量子变化: ${quantumBefore.toLocaleString()} → ${this.quantum.toLocaleString()} (${this.quantum - quantumBefore > 0 ? '+' : ''}${(this.quantum - quantumBefore).toLocaleString()})`);
    }
    if (this.saintQuartz !== saintQuartzBefore) {
      console.log(`  圣晶石变化: ${saintQuartzBefore} → ${this.saintQuartz} (${this.saintQuartz - saintQuartzBefore > 0 ? '+' : ''}${this.saintQuartz - saintQuartzBefore})`);
    }
    
    // 检查图像状态变化
    Object.keys(this.symbolStates).forEach(symbolId => {
      const before = symbolStatesBefore[symbolId];
      const after = this.symbolStates[symbolId];
      if (before && after) {
        if (before.currentValue !== after.currentValue || before.currentWeight !== after.currentWeight) {
          console.log(`  图像 ${symbolId}:`);
          if (before.currentValue !== after.currentValue) {
            console.log(`    倍率: ${before.currentValue.toLocaleString()} → ${after.currentValue.toLocaleString()} (${after.currentValue - before.currentValue > 0 ? '+' : ''}${(after.currentValue - before.currentValue).toLocaleString()})`);
          }
          if (before.currentWeight !== after.currentWeight) {
            console.log(`    权重: ${before.currentWeight.toFixed(2)} → ${after.currentWeight.toFixed(2)} (${after.currentWeight - before.currentWeight > 0 ? '+' : ''}${(after.currentWeight - before.currentWeight).toFixed(2)})`);
          }
        }
      }
    });
    
    // 如果是从者具有自动形状效果，更新autoPatterns
    if (servant.effectType === 'auto_pattern') {
      this.autoPatterns.push({
        patterns: servant.patterns,
        count: servant.count
      });
      console.log(`  自动形状效果: ${servant.patterns.join(', ')} x${servant.count}`);
    }
    
    console.log(`  当前出战从者数: ${this.activeServants.length}/5\n`);
    
    return true;
  }

  // 应用从者效果
  applyServantEffect(servant) {
    switch (servant.effectType) {
      case 'quantum_double':
        this.hasBB = true;
        console.log(`    [技能生效] BB: 所有量子翻倍效果已激活`);
        break;
      case 'symbol_boost':
        if (servant.symbolType) {
          const state = this.symbolStates[servant.symbolType];
          if (state) {
            const valueBefore = state.currentValue;
            const weightBefore = state.currentWeight;
            state.currentValue += state.baseValue * servant.valueMultiplier;
            state.currentWeight += state.baseWeight * servant.weightMultiplier;
            console.log(`    [技能生效] ${servant.name}: ${servant.symbolType}图像提升`);
            console.log(`      倍率: ${valueBefore.toLocaleString()} → ${state.currentValue.toLocaleString()} (+${(state.currentValue - valueBefore).toLocaleString()})`);
            console.log(`      权重: ${weightBefore.toFixed(2)} → ${state.currentWeight.toFixed(2)} (+${(state.currentWeight - weightBefore).toFixed(2)})`);
          }
        }
        break;
      case 'negative_symbol_reduce':
        const solomon = this.symbolStates['solomon'];
        if (solomon) {
          const valueBefore = solomon.currentValue;
          const weightBefore = solomon.currentWeight;
          solomon.currentValue = Math.max(0, solomon.currentValue * (1 + servant.valueMultiplier));
          solomon.currentWeight = Math.max(0, solomon.currentWeight * (1 + servant.weightMultiplier));
          console.log(`    [技能生效] ${servant.name}: 扣分图像削弱`);
          console.log(`      倍率: ${valueBefore.toLocaleString()} → ${solomon.currentValue.toLocaleString()} (${solomon.currentValue - valueBefore > 0 ? '+' : ''}${(solomon.currentValue - valueBefore).toLocaleString()})`);
          console.log(`      权重: ${weightBefore.toFixed(2)} → ${solomon.currentWeight.toFixed(2)} (${solomon.currentWeight - weightBefore > 0 ? '+' : ''}${(solomon.currentWeight - weightBefore).toFixed(2)})`);
        }
        break;
      case 'immune_negative':
        this.hasKingHassan = true;
        console.log(`    [技能生效] 王哈桑: 免疫扣分效果已激活`);
        break;
      case 'disable_negative':
        this.hasArthur = true;
        console.log(`    [技能生效] 亚瑟: 禁用扣分效果已激活`);
        break;
      case 'oberon_effect':
        this.hasOberon = true;
        console.log(`    [技能生效] 奥博龙: 回合开始-50%，回合结束+200%效果已激活`);
        break;
      case 'permanent_price_reduction':
        this.servantPriceReduction += servant.reduction;
        console.log(`    [技能生效] ${servant.name}: 从者价格永久-${servant.reduction}，当前总减免: ${this.servantPriceReduction}`);
        break;
      case 'refresh_shop':
        if (servant.isOneTime) {
          this.refreshShop();
          // 一次性从者，从出战栏移除
          this.activeServants = this.activeServants.filter(s => s.id !== servant.id);
        }
        break;
      case 'random_servant':
        if (servant.isOneTime) {
          const randomServant = getRandomServant();
          if (randomServant) {
            this.inventoryServants.push({ ...randomServant });
          }
          this.activeServants = this.activeServants.filter(s => s.id !== servant.id);
        }
        break;
      case 'random_servant_price':
        if (servant.isOneTime) {
          const randomServant = getRandomServantByPrice(servant.targetPrice);
          if (randomServant) {
            this.inventoryServants.push({ ...randomServant });
          }
          this.activeServants = this.activeServants.filter(s => s.id !== servant.id);
        }
        break;
      case 'random_servants':
        if (servant.isOneTime) {
          for (let i = 0; i < servant.count; i++) {
            const randomServant = getRandomServant();
            if (randomServant) {
              this.inventoryServants.push({ ...randomServant });
            }
          }
          this.activeServants = this.activeServants.filter(s => s.id !== servant.id);
        }
        break;
      // 其他效果在特定时机触发
    }
  }

  // 检查是否有某个从者
  hasServant(servantId) {
    return this.activeServants.some(s => s.id === servantId);
  }

  // 开始新回合
  startNewRound() {
    const oldRound = this.round;
    this.round++;
    console.log(`\n[开始新回合] 第${this.level}轮 第${oldRound}回合 → 第${this.round}回合`);
    this.resetTurnState();
    // 注意：商店不会自动刷新，需要通过购买补货、花费圣晶石刷新或购买清少纳言来刷新
    
    // 重置奥博龙标记
    this.oberonApplied = false;
    
    // 执行回合开始效果
    this.applyRoundStartEffects();
    console.log(`[开始新回合] 第${this.level}轮 第${this.round}回合已开始\n`);
  }

  resetTurnState() {
    this.currentTurn = null;
    this.spinsRemaining = 0;
    this.slotResults = null;
    this.turnQuantum = 0;
    this.autoPatterns = [];
  }

  // 应用回合开始效果
  applyRoundStartEffects() {
    // 自动结算形状（斯卡蒂、卡莲、羽蛇神、罗穆卢斯）
    this.activeServants.forEach(servant => {
      if (servant.effectType === 'auto_pattern') {
        // 这里会在老虎机逻辑中处理
        this.autoPatterns.push({
          patterns: servant.patterns,
          count: servant.count
        });
      }
    });
  }

  // 选择回合操作（3次或7次）
  selectTurnOption(option) {
    if (this.currentTurn !== null) return false;
    
    const cost = option === 'cheap' ? 3000 : 7000;
    const costTotal = cost * this.level;
    
    if (this.quantum < costTotal) return false;
    
    const quantumBefore = this.quantum;
    const saintQuartzBefore = this.saintQuartz;
    
    this.quantum -= costTotal;
    this.currentTurn = option;
    this.spinsRemaining = option === 'cheap' ? 3 : 7;
    this.saintQuartz += option === 'cheap' ? 2 : 1;
    
    console.log(`\n[选择回合操作] ${option === 'cheap' ? '经济版' : '豪华版'}`);
    console.log(`  消耗量子: -${costTotal.toLocaleString()} (${cost.toLocaleString()} × ${this.level})`);
    console.log(`  获得圣晶石: +${option === 'cheap' ? 2 : 1}`);
    console.log(`  获得旋转次数: ${this.spinsRemaining}`);
    
    // 卡斯特效果：圣晶石翻倍
    if (this.hasServant('caster')) {
      const extraQuartz = option === 'cheap' ? 2 : 1;
      this.saintQuartz += extraQuartz;
      console.log(`  卡斯特效果触发: 圣晶石翻倍，额外获得 +${extraQuartz}`);
    }
    
    // 葛饰北斋效果：额外一次机会
    if (this.hasServant('hokusai')) {
      this.spinsRemaining += 1;
      console.log(`  葛饰北斋效果触发: 额外获得 +1 次旋转机会，当前: ${this.spinsRemaining}`);
    }
    
    // 奥博龙效果：量子减半（在选择完操作后执行）
    if (this.hasOberon && !this.oberonApplied) {
      const quantumBeforeOberon = this.quantum;
      this.turnStartQuantum = this.quantum;
      this.quantum = Math.floor(this.quantum * 0.5);
      this.oberonApplied = true;
      console.log(`  奥博龙效果触发: 量子减半`);
      console.log(`    量子变化: ${quantumBeforeOberon.toLocaleString()} → ${this.quantum.toLocaleString()} (-${(quantumBeforeOberon - this.quantum).toLocaleString()})`);
    }
    
    console.log(`  量子变化: ${quantumBefore.toLocaleString()} → ${this.quantum.toLocaleString()} (${this.quantum - quantumBefore > 0 ? '+' : ''}${(this.quantum - quantumBefore).toLocaleString()})`);
    console.log(`  圣晶石变化: ${saintQuartzBefore} → ${this.saintQuartz} (+${this.saintQuartz - saintQuartzBefore})\n`);
    
    // 执行回合开始时的自动形状结算（斯卡蒂、卡莲、羽蛇神、罗穆卢斯）
    this.executeAutoPatterns();
    
    return true;
  }

  // 执行自动形状结算
  executeAutoPatterns() {
    const { calculateAutoPatternReward } = require('./slotMachine');
    
    let autoReward = 0;
    const rewardDetails = [];
    
    this.autoPatterns.forEach(auto => {
      auto.patterns.forEach(patternType => {
        for (let i = 0; i < auto.count; i++) {
          const reward = calculateAutoPatternReward(
            patternType,
            this.symbolStates,
            this.activeServants
          );
          autoReward += reward;
          rewardDetails.push({ patternType, reward });
        }
      });
    });
    
    if (autoReward > 0) {
      const quantumBefore = this.quantum;
      const turnQuantumBefore = this.turnQuantum;
      
      this.quantum += autoReward;
      this.turnQuantum += autoReward;
      
      // BB效果：自动奖励也翻倍
      if (this.hasBB) {
        const extraReward = autoReward;
        this.quantum += extraReward;
        this.turnQuantum += extraReward;
        console.log(`\n[自动形状结算] BB效果触发，奖励翻倍`);
      }
      
      console.log(`\n[自动形状结算] 回合开始自动奖励`);
      rewardDetails.forEach(detail => {
        console.log(`  ${detail.patternType}: +${detail.reward.toLocaleString()} 量子`);
      });
      console.log(`  总奖励: +${autoReward.toLocaleString()} 量子`);
      if (this.hasBB) {
        console.log(`  BB翻倍后总奖励: +${(autoReward * 2).toLocaleString()} 量子`);
      }
      console.log(`  量子变化: ${quantumBefore.toLocaleString()} → ${this.quantum.toLocaleString()} (+${(this.quantum - quantumBefore).toLocaleString()})`);
      console.log(`  回合量子变化: ${turnQuantumBefore.toLocaleString()} → ${this.turnQuantum.toLocaleString()} (+${(this.turnQuantum - turnQuantumBefore).toLocaleString()})\n`);
    }
  }

  // 检查是否可以通过当前轮
  checkLevelComplete() {
    const target = getLevelTarget(this.level);
    
    // 始皇帝效果：目标降低25%
    let adjustedTarget = target;
    if (this.hasServant('qin_shi_huang')) {
      adjustedTarget = target * 0.75;
    }
    
    return this.quantum >= adjustedTarget;
  }

  // 完成轮次
  completeLevel() {
    const quantumBefore = this.quantum;
    
    // 奥博龙效果：回合结束时量子+200%（在检查目标之前应用）
    if (this.hasOberon) {
      const quantumBeforeOberon = this.quantum;
      this.quantum = Math.floor(this.quantum * 3);  // +200% = *3
      console.log(`\n[完成轮次] 奥博龙效果触发: 量子+200%`);
      console.log(`  量子变化: ${quantumBeforeOberon.toLocaleString()} → ${this.quantum.toLocaleString()} (+${(this.quantum - quantumBeforeOberon).toLocaleString()})\n`);
    }
    
    // 检查是否达到目标
    const target = getLevelTarget(this.level);
    let adjustedTarget = target;
    if (this.hasServant('qin_shi_huang')) {
      adjustedTarget = target * 0.75;
      console.log(`\n[完成轮次] 始皇帝效果: 目标降低25%`);
      console.log(`  原始目标: ${target.toLocaleString()}`);
      console.log(`  调整后目标: ${adjustedTarget.toLocaleString()}\n`);
    }
    
    const passed = this.quantum >= adjustedTarget;
    
    console.log(`\n[完成轮次] 第${this.level}轮结算`);
    console.log(`  当前量子: ${this.quantum.toLocaleString()}`);
    console.log(`  目标量子: ${adjustedTarget.toLocaleString()}`);
    console.log(`  结果: ${passed ? '✓ 通过' : '✗ 失败'}\n`);
    
    if (passed) {
      // 达到目标，轮次完成，自动进入下一轮
      this.isLevelComplete = true;
      const currentLevel = this.level;
      console.log(`[自动进入下一轮] 第${currentLevel}轮通过，自动开始第${currentLevel + 1}轮\n`);
      this.startNewLevel();  // 自动开始下一轮
      console.log(`[自动进入下一轮] startNewLevel() 调用完成，当前level=${this.level}\n`);
    } else {
      // 未达到目标，游戏结束
      this.isGameOver = true;
      this.isLevelComplete = false;
    }
  }

  // 生成事件
  generateEvents() {
    let eventCount = 3;
    if (this.hasServant('lilith')) {
      eventCount += 1;  // 莉莉丝效果：额外一次选择事件的机会
    }
    
    // 生成随机事件
    this.events = generateRandomEvents(eventCount);
  }

  // 选择并应用事件
  selectEvent(eventIndex) {
    if (eventIndex < 0 || eventIndex >= this.events.length) {
      return false;
    }
    
    const selectedEvent = this.events[eventIndex];
    
    console.log(`\n[事件选择] 选择了事件: ${selectedEvent.symbolName} - ${selectedEvent.description}`);
    
    // 全满奖励事件：立即给予一次全满形状的奖励
    if (selectedEvent.type === 'full_pattern_reward') {
      const symbolState = this.symbolStates[selectedEvent.symbolId];
      if (symbolState) {
        const { PATTERN_TYPES, PATTERN_MULTIPLIERS } = require('./constants');
        const fullReward = symbolState.currentValue * PATTERN_MULTIPLIERS[PATTERN_TYPES.FULL] * selectedEvent.count;
        
        const quantumBefore = this.quantum;
        
        // 应用奖励
        this.quantum += fullReward;
        
        // BB效果：所有量子翻倍
        if (this.hasBB && fullReward > 0) {
          const extraReward = fullReward;
          this.quantum += extraReward;
          console.log(`  立即获得全满奖励: +${fullReward.toLocaleString()} 量子`);
          console.log(`  BB效果触发: 奖励翻倍，额外 +${extraReward.toLocaleString()} 量子`);
          console.log(`  总奖励: +${(fullReward * 2).toLocaleString()} 量子`);
        } else {
          console.log(`  立即获得全满奖励: +${fullReward.toLocaleString()} 量子`);
        }
        
        console.log(`  量子变化: ${quantumBefore.toLocaleString()} → ${this.quantum.toLocaleString()} (+${(this.quantum - quantumBefore).toLocaleString()})`);
        console.log(`  图像倍率: ${symbolState.currentValue.toLocaleString()}`);
        console.log(`  全满倍率: ${PATTERN_MULTIPLIERS[PATTERN_TYPES.FULL]}x`);
        console.log(`  奖励次数: ${selectedEvent.count}`);
      } else {
        console.log(`  警告: ${selectedEvent.symbolId} 的 symbolState 不存在`);
      }
    } else {
      // 其他事件正常应用
      applyEvent(selectedEvent, this);
    }
    
    // 记录已选择的事件
    this.eventChoices.push(selectedEvent);
    
    // 清空事件列表（已选择）
    this.events = [];
    
    // 如果当前是第0回合（刚选择完事件），自动开始第一回合
    if (this.round === 0) {
      console.log(`[事件选择] 当前是第0回合，自动开始第一回合`);
      this.startNewRound();
      console.log(`[事件选择] 第一回合已开始，当前round=${this.round}`);
    }
    
    return true;
  }

  // 检查游戏是否结束（量子不足）
  checkGameOver() {
    const minCost = 3000 * this.level;  // 最低价格版本
    if (this.quantum < minCost && this.spinsRemaining === 0) {
      this.isGameOver = true;
      return true;
    }
    return false;
  }

  // 获取游戏报表数据
  getGameReport() {
    return {
      level: this.level,
      finalQuantum: this.quantum,
      totalSaintQuartz: this.saintQuartz,
      activeServants: this.activeServants.map(s => s.name),
      inventoryServants: this.inventoryServants.map(s => s.name),
      isGameOver: this.isGameOver,
      isLevelComplete: this.isLevelComplete
    };
  }

  // 获取游戏状态（用于API）
  getGameState() {
    return {
      quantum: this.quantum,
      saintQuartz: this.saintQuartz,
      level: this.level,
      round: this.round,
      maxRounds: this.maxRounds,
      isGameOver: this.isGameOver,
      isLevelComplete: this.isLevelComplete,
      currentTurn: this.currentTurn,
      spinsRemaining: this.spinsRemaining,
      slotResults: this.slotResults,
      activeServants: this.activeServants,
      inventoryServants: this.inventoryServants,
      shopServants: this.shopServants,
      events: this.events,
      turnQuantum: this.turnQuantum
    };
  }
}

module.exports = { GameState };
