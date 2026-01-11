# FGO老虎机链游

基于以太坊的老虎机游戏项目（当前版本暂未集成区块链功能）

## 项目结构

```
game/
├── client/          # React前端应用
├── server/          # Node.js后端服务器
└── package.json     # 根目录配置
```

## 功能特性

### 已实现功能

1. **游戏核心系统**
   - 轮次和回合管理
   - 量子（QP）和圣晶石系统
   - 动态概率和倍率计算

2. **老虎机系统**
   - 3×5网格老虎机
   - 6种形状检测（横三、竖三、横五、上V、下V、全满）
   - 10种图像（9种加分，1种扣分）
   - 实时奖励计算

3. **从者系统**
   - 33种从者，每种有独特技能
   - 从者商店（每回合刷新3个）
   - 仓库和出战栏管理（最多5个出战从者）
   - 从者技能自动执行（包括一次性从者）
   - 奥博龙特殊效果（选择操作后量子减半）

4. **事件系统**
   - 每轮开始前选择事件
   - 三种事件类型：增加概率权重、增加基础倍率、全满形状奖励
   - 莉莉丝从者可以额外获得一次选择事件的机会

5. **前端界面**
   - 主游戏界面
   - 老虎机页面（独立页面）
   - 从者管理系统
   - 概率和倍率实时显示面板
   - 事件选择界面
   - 游戏结束报表

5. **游戏结束判断**
   - 自动检测量子是否足够继续游戏
   - 退出老虎机时判断
   - 生成详细游戏报表

### 待实现功能

- 区块链集成（以太坊支付和奖励）

## 安装和运行

### 前置要求

- Node.js 14+ 
- npm 或 yarn

### 安装步骤

1. 安装所有依赖：
```bash
npm run install-all
```

或者分别安装：

```bash
# 根目录
npm install

# 后端
cd server
npm install

# 前端
cd ../client
npm install
```

### 运行项目

开发模式（同时启动前后端）：

```bash
npm run dev
```

或者分别启动：

```bash
# 终端1：启动后端服务器（端口3001）
cd server
npm run dev

# 终端2：启动前端应用（端口3000）
cd client
npm start
```

### 访问应用

- 前端：http://localhost:3000
- 后端API：http://localhost:3001

## 游戏规则

### 基础玩法

1. 游戏开始时有10000量子
2. 每轮需要达到目标量子数才能通过
3. 每轮有7个回合（青子从者可以增加回合数）
4. 每回合可以选择：
   - 经济版：3000×轮数 量子 → 3次机会 + 2圣晶石
   - 豪华版：7000×轮数 量子 → 7次机会 + 1圣晶石

### 老虎机规则

- 3行5列，共15个格子
- 检测6种形状组合获得奖励
- 扣分图像（所罗门）会扣除本回合所有奖励
- 王哈桑和亚瑟可以免疫扣分效果

### 从者系统

- 每回合商店刷新3个从者
- 购买从者需要圣晶石
- 从者放入出战栏后立即生效
- 最多同时出战5个从者
- 一次性从者（如太公望、烟雾镜等）使用后自动移除

### 轮次目标

- 第1轮：100,000量子
- 第2轮：500,000量子
- 第3轮：1,500,000量子
- 第4轮：4,000,000量子
- 第5轮：7,500,000量子
- 第6轮及以后：7,500,000 × 1.5^(轮数-5)

## API接口

### 游戏管理

- `POST /api/game/new` - 创建新游戏
- `GET /api/game/:sessionId` - 获取游戏状态
- `POST /api/game/:sessionId/level/start` - 开始新轮
- `POST /api/game/:sessionId/round/start` - 开始新回合
- `POST /api/game/:sessionId/turn/select` - 选择回合操作
- `POST /api/game/:sessionId/level/complete` - 完成轮次

### 老虎机

- `POST /api/game/:sessionId/slot/spin` - 旋转老虎机

### 从者管理

- `POST /api/game/:sessionId/servant/buy` - 购买从者
- `POST /api/game/:sessionId/servant/activate` - 激活从者

### 事件系统

- `POST /api/game/:sessionId/event/select` - 选择事件

### 报表

- `GET /api/game/:sessionId/report` - 获取游戏报表

## 技术栈

### 后端
- Node.js
- Express
- CommonJS模块系统

### 前端
- React 18
- React Router
- Axios
- CSS3

## 开发说明

### 代码结构

**后端 (`server/`)**
- `game/constants.js` - 游戏常量定义
- `game/symbols.js` - 图像定义
- `game/servants.js` - 从者定义
- `game/GameState.js` - 游戏状态管理
- `game/slotMachine.js` - 老虎机逻辑
- `game/events.js` - 事件系统
- `index.js` - Express服务器

**前端 (`client/src/`)**
- `App.js` - 主应用组件
- `components/MainGame.js` - 主游戏界面
- `components/SlotMachinePage.js` - 老虎机页面
- `components/ServantManager.js` - 从者管理
- `components/SymbolProbabilityPanel.js` - 概率显示面板
- `components/EventSelector.js` - 事件选择器
- `components/TurnSelector.js` - 回合选择器
- `components/GameOverPage.js` - 游戏结束页面

## 注意事项

1. 当前版本使用内存存储游戏状态，刷新页面会丢失进度
2. 区块链功能尚未集成（以太坊支付和奖励）
3. 图像资源路径需要根据实际素材位置调整（当前使用占位符）
4. 事件系统已实现，每轮开始时会自动弹出事件选择界面

## 许可证

MIT
