// 以太坊配置
export const ETHEREUM_CONFIG = {
  // ⚠️ 配置1: 智能合约地址（部署后从控制台获取）
  // 格式: '0x...'
  // 可以通过环境变量 REACT_APP_CONTRACT_ADDRESS 设置
  CONTRACT_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS || '',
  
  // ⚠️ 配置2: 游戏服务器接收ETH的地址（备用，如果不用合约）
  // TODO: 在生产环境中替换为实际的游戏服务器地址
  GAME_RECIPIENT_ADDRESS: process.env.REACT_APP_GAME_RECIPIENT_ADDRESS || '0x0000000000000000000000000000000000000000',
  
  // 入场费（ETH）
  ENTRY_FEE: '0.05',
  
  // 支持的链ID
  SUPPORTED_CHAIN_IDS: {
    MAINNET: 1,
    SEPOLIA: 11155111,
    LOCALHOST: 1337,
  },
  
  // Etherscan链接（用于显示交易）
  ETHERSCAN_URL: {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
  },
};
