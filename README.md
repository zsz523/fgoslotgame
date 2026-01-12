# FGO老虎机链游

基于以太坊的FGO主题老虎机游戏，支持游客模式和以太坊模式（Sepolia测试网）。

## 🎮 功能特性

### 游戏核心系统
- **轮次和回合管理**：多轮次挑战，每轮7个回合
- **资源系统**：量子（QP）和圣晶石管理
- **动态概率和倍率**：根据游戏进度动态调整

### 老虎机系统
- **3×5网格老虎机**：15个格子的经典布局
- **6种形状检测**：横三、竖三、横五、上V、下V、全满
- **10种图像**：9种加分，1种扣分（所罗门）
- **实时奖励计算**：即时显示奖励结果

### 从者系统
- **33种从者**：每种有独特技能和效果
- **从者商店**：每回合刷新3个从者供购买
- **仓库和出战栏**：最多5个出战从者，支持从者下场替换
- **技能自动执行**：包括一次性从者和持续效果
- **特殊效果**：奥博龙（量子翻三倍）、BB（免疫扣分）等

### 事件系统
- **每轮开始前选择事件**：增加概率权重、增加基础倍率、全满形状奖励
- **莉莉丝特殊效果**：可以额外获得一次选择事件的机会

### 区块链集成（以太坊模式）
- **智能合约奖励机制**：基于以太坊的奖励系统
- **入场费支付**：0.05 ETH 入场费
- **自动奖励分配**：
  - 前5轮：每轮完成获得 0.01 ETH
  - 第5轮后：每轮完成获得 0.05 ETH
- **MetaMask集成**：支持钱包连接和交易确认
- **Sepolia测试网支持**：完整的测试网部署和测试流程

## 🚀 快速开始

### 前置要求

- Node.js 14+
- npm 或 yarn
- MetaMask（以太坊模式需要）

### 安装依赖

```bash
# 安装所有依赖
npm run install-all

# 或分别安装
npm install
cd server && npm install
cd ../client && npm install
cd ../contracts && npm install
```

### 运行项目

**开发模式（同时启动前后端）：**

```bash
npm run dev
```

**或分别启动：**

```bash
# 终端1：启动后端服务器（端口3001）
cd server
npm start

# 终端2：启动前端应用（端口3000）
cd client
npm start
```

### 访问应用

- 前端：http://localhost:3000
- 后端API：http://localhost:3001

## 🎯 游戏模式

### 游客模式

无需配置，直接开始游戏：
1. 选择"游客游玩"
2. 开始游戏，不涉及区块链

### 以太坊模式（Sepolia测试网）

需要配置智能合约和钱包：

#### 1. 配置合约部署

创建 `contracts/.env`：
```bash
PRIVATE_KEY=0x你的部署者私钥
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

#### 2. 部署合约

```bash
cd contracts
npm run compile
npm run deploy:sepolia
```

**重要**：复制部署输出的合约地址！

#### 3. 配置后端

创建 `server/.env`：
```bash
CONTRACT_ADDRESS=0x你的合约地址
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SERVER_PRIVATE_KEY=0x你的服务器私钥  # 必须是部署者地址的私钥
```

#### 4. 配置前端

创建 `client/.env`：
```bash
REACT_APP_CONTRACT_ADDRESS=0x你的合约地址
```

#### 5. 配置 MetaMask

1. 添加 Sepolia 网络：
   - 网络名称：Sepolia
   - RPC URL：`https://sepolia.infura.io/v3/YOUR_KEY`
   - 链 ID：11155111
   - 货币符号：ETH
   - 区块浏览器：https://sepolia.etherscan.io

2. 切换到 Sepolia 网络
3. 确保有测试币（从水龙头获取）

#### 6. 开始游戏

1. 访问 http://localhost:3000
2. 选择"以太坊游玩"
3. 连接钱包
4. 支付入场费（0.05 ETH）
5. 开始游戏！

## 📋 游戏规则

### 基础玩法

1. **初始资源**：游戏开始时有10,000量子
2. **轮次目标**：每轮需要达到目标量子数才能通过
3. **回合数**：每轮有7个回合（青子从者可以增加回合数）
4. **回合选择**：
   - 经济版：3000×轮数 量子 → 3次机会 + 2圣晶石
   - 豪华版：7000×轮数 量子 → 7次机会 + 1圣晶石

### 轮次目标

- 第1轮：100,000量子
- 第2轮：500,000量子
- 第3轮：1,500,000量子
- 第4轮：4,000,000量子
- 第5轮：7,500,000量子
- 第6轮及以后：7,500,000 × 1.5^(轮数-5)

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
- 支持从者下场替换
- 一次性从者（如太公望、烟雾镜等）使用后自动移除

## 🔧 配置说明

### 环境变量文件

项目需要三个 `.env` 文件（已添加到 `.gitignore`）：

1. **`contracts/.env`** - 合约部署配置
   ```bash
   PRIVATE_KEY=0x你的部署者私钥
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   ```

2. **`server/.env`** - 后端服务器配置
   ```bash
   CONTRACT_ADDRESS=0x你的合约地址
   RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   SERVER_PRIVATE_KEY=0x你的服务器私钥  # 必须是部署者地址的私钥
   ```

3. **`client/.env`** - 前端客户端配置
   ```bash
   REACT_APP_CONTRACT_ADDRESS=0x你的合约地址
   ```

### 安全注意事项

⚠️ **重要**：
- 永远不要将私钥提交到代码仓库
- 确保 `.env` 文件在 `.gitignore` 中
- 生产环境使用密钥管理服务
- `SERVER_PRIVATE_KEY` 必须是部署者地址的私钥

## 📡 API接口

### 游戏管理

- `POST /api/game/new` - 创建新游戏
- `GET /api/game/:sessionId` - 获取游戏状态
- `POST /api/game/:sessionId/level/start` - 开始新轮
- `POST /api/game/:sessionId/round/start` - 开始新回合
- `POST /api/game/:sessionId/turn/select` - 选择回合操作
- `POST /api/game/:sessionId/level/complete` - 完成轮次
- `POST /api/game/:sessionId/game/complete` - 完成游戏
- `POST /api/game/:sessionId/game/fail` - 游戏失败

### 老虎机

- `POST /api/game/:sessionId/slot/spin` - 旋转老虎机

### 从者管理

- `POST /api/game/:sessionId/servant/buy` - 购买从者
- `POST /api/game/:sessionId/servant/activate` - 激活从者
- `POST /api/game/:sessionId/servant/deactivate` - 从者下场

### 事件系统

- `POST /api/game/:sessionId/event/select` - 选择事件

### 报表

- `GET /api/game/:sessionId/report` - 获取游戏报表

## 🛠️ 技术栈

### 后端
- Node.js
- Express
- Ethers.js（智能合约交互）
- CommonJS模块系统

### 前端
- React 18
- React Router
- Axios
- Ethers.js（钱包连接）
- CSS3

### 智能合约
- Solidity
- Hardhat（开发环境）
- OpenZeppelin（安全库）

## 🐛 故障排除

### 问题1: 合约未初始化

**错误**：`合约未初始化`

**解决**：
- 检查 `server/.env` 中的 `CONTRACT_ADDRESS`、`RPC_URL`、`SERVER_PRIVATE_KEY` 是否正确配置
- 重启后端服务器

### 问题2: 交易失败 - "Only owner can call"

**错误**：`execution reverted: "Only owner can call"`

**解决**：
- 确保 `SERVER_PRIVATE_KEY` 对应的地址是合约owner（部署者地址）
- 检查 `server/.env` 中的 `SERVER_PRIVATE_KEY` 是否与 `contracts/.env` 中的 `PRIVATE_KEY` 对应同一地址

### 问题3: 前端无法连接合约

**错误**：`未配置合约地址`

**解决**：
- 检查 `client/.env` 中的 `REACT_APP_CONTRACT_ADDRESS` 是否正确
- 确保与 `server/.env` 中的 `CONTRACT_ADDRESS` 相同
- 重启前端开发服务器

### 问题4: MetaMask 提示网络错误

**错误**：MetaMask 无法连接到 Sepolia

**解决**：
- 确保 MetaMask 连接到 Sepolia 网络（链 ID: 11155111）
- 检查 RPC URL 是否正确
- 确保有足够的测试币支付 gas 费

### 问题5: 奖励未支付

**错误**：游戏完成但奖励为0

**解决**：
- 检查合约余额是否足够
- 检查服务器地址是否有 gas 费
- 查看后端日志确认合约调用是否成功
- 确保每轮完成时后端正确调用了 `completeLevel`

## 📁 项目结构

```
fgoslotgame/
├── client/              # React前端应用
│   ├── src/
│   │   ├── components/  # React组件
│   │   ├── config/      # 配置文件
│   │   └── utils/       # 工具函数
│   └── public/          # 静态资源
├── server/              # Node.js后端服务器
│   ├── game/            # 游戏逻辑
│   └── utils/           # 工具函数（合约交互）
├── contracts/           # 智能合约
│   ├── contracts/       # Solidity合约文件
│   └── scripts/         # 部署脚本
└── README.md            # 项目文档
```

## 🔗 有用的链接

- Sepolia 水龙头：https://sepoliafaucet.com/
- Sepolia 区块浏览器：https://sepolia.etherscan.io
- Infura：https://infura.io/
- Alchemy：https://www.alchemy.com/
- MetaMask：https://metamask.io/

## 📝 开发说明

### 代码结构

**后端 (`server/`)**
- `game/constants.js` - 游戏常量定义
- `game/symbols.js` - 图像定义
- `game/servants.js` - 从者定义
- `game/GameState.js` - 游戏状态管理
- `game/slotMachine.js` - 老虎机逻辑
- `game/events.js` - 事件系统
- `utils/contract.js` - 智能合约交互
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
- `components/WalletConnect.js` - 钱包连接组件
- `config/ethereum.js` - 以太坊配置
- `utils/wallet.js` - 钱包工具函数

**智能合约 (`contracts/`)**
- `contracts/FGOGame.sol` - 主游戏合约
- `scripts/deploy.js` - 部署脚本

## ⚠️ 注意事项

1. 当前版本使用内存存储游戏状态，刷新页面会丢失进度
2. 以太坊模式需要配置智能合约和钱包
3. 图像资源路径需要根据实际素材位置调整
4. 事件系统已实现，每轮开始时会自动弹出事件选择界面
5. 从者支持下场功能，可以替换出战从者
6. 游戏支持主动完成并提取奖励，避免失败时丢失奖励

## 📄 许可证

MIT
