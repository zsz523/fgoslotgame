const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// ============================================
// ⚠️ 配置区域 - 需要设置以下变量
// ============================================

// 1. 智能合约地址（部署后从控制台获取）
// 格式: '0x...'
let CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';

// 2. RPC节点URL（用于连接以太坊网络）
// Sepolia测试网: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
// 主网: https://mainnet.infura.io/v3/YOUR_INFURA_KEY
// 本地: http://localhost:8545
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';

// 3. 服务器私钥（用于签名交易，必须保密！）
// ⚠️ 警告：不要将私钥提交到代码仓库！
// 建议使用环境变量: process.env.SERVER_PRIVATE_KEY
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY || '';

// ============================================
// 合约ABI（从编译后的artifacts读取）
// ============================================

let contractABI = null;

function loadContractABI() {
  try {
    // 尝试从多个可能的位置读取ABI
    const possiblePaths = [
      path.join(__dirname, '../../contracts/artifacts/FGOGame.sol/FGOGame.json'),
      path.join(__dirname, '../contracts/artifacts/FGOGame.sol/FGOGame.json'),
      path.join(__dirname, './FGOGame.json')
    ];
    
    for (const abiPath of possiblePaths) {
      if (fs.existsSync(abiPath)) {
        const contractData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        contractABI = contractData.abi;
        console.log(`[合约工具] 已加载ABI: ${abiPath}`);
        return;
      }
    }
    
    // 如果找不到文件，使用硬编码的ABI（简化版）
    console.warn('[合约工具] 警告：未找到ABI文件，使用简化ABI');
    contractABI = getSimplifiedABI();
  } catch (error) {
    console.error('[合约工具] 加载ABI失败:', error);
    contractABI = getSimplifiedABI();
  }
}

function getSimplifiedABI() {
  // 简化版ABI，包含必要的方法
  return [
    "function startGame(bytes32 sessionId) external payable",
    "function completeLevel(bytes32 sessionId, uint256 level, bool isPostLevel5) external",
    "function completeGame(bytes32 sessionId) external",
    "function failGame(bytes32 sessionId) external",
    "function getGameSession(bytes32 sessionId) external view returns (address, uint256, uint256, uint256, bool, bool)",
    "function getPlayerReward(address player) external view returns (uint256)",
    "function getContractBalance() external view returns (uint256)"
  ];
}

// 初始化时加载ABI
loadContractABI();

// ============================================
// 合约交互函数
// ============================================

let provider = null;
let signer = null;
let contract = null;

/**
 * 初始化合约连接
 */
function initializeContract() {
  if (!CONTRACT_ADDRESS) {
    console.error('[合约工具] 错误：未设置合约地址！请设置 CONTRACT_ADDRESS 环境变量或在代码中配置');
    return false;
  }
  
  if (!SERVER_PRIVATE_KEY) {
    console.error('[合约工具] 错误：未设置服务器私钥！请设置 SERVER_PRIVATE_KEY 环境变量');
    return false;
  }
  
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    signer = new ethers.Wallet(SERVER_PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    
    console.log('[合约工具] 合约连接成功');
    console.log(`  合约地址: ${CONTRACT_ADDRESS}`);
    console.log(`  服务器地址: ${signer.address}`);
    console.log(`  RPC URL: ${RPC_URL}`);
    
    return true;
  } catch (error) {
    console.error('[合约工具] 初始化失败:', error);
    return false;
  }
}

/**
 * 设置合约地址（用于运行时配置）
 */
function setContractAddress(address) {
  CONTRACT_ADDRESS = address;
  console.log(`[合约工具] 合约地址已设置为: ${address}`);
  if (provider && signer) {
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  }
}

/**
 * 开始游戏（玩家支付入场费）
 * 注意：这个函数应该由前端调用，不是服务器调用
 */
async function startGame(sessionId) {
  if (!contract) {
    if (!initializeContract()) {
      throw new Error('合约未初始化');
    }
  }
  
  try {
    const tx = await contract.startGame(sessionId, {
      value: ethers.parseEther('0.05')
    });
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('[合约工具] 开始游戏失败:', error);
    throw error;
  }
}

/**
 * 完成一轮游戏
 * @param {string} sessionId - 游戏会话ID（需要转换为bytes32）
 * @param {number} level - 完成的轮数
 * @param {boolean} isPostLevel5 - 是否超过5轮
 */
async function completeLevel(sessionId, level, isPostLevel5) {
  if (!contract) {
    if (!initializeContract()) {
      throw new Error('合约未初始化');
    }
  }
  
  try {
    // 将sessionId转换为bytes32
    const sessionIdBytes32 = ethers.id(sessionId);
    
    const tx = await contract.completeLevel(sessionIdBytes32, level, isPostLevel5);
    const receipt = await tx.wait();
    
    console.log(`[合约工具] 完成第${level}轮，交易哈希: ${receipt.hash}`);
    return receipt.hash;
  } catch (error) {
    console.error('[合约工具] 完成轮次失败:', error);
    throw error;
  }
}

/**
 * 完成游戏（成功）
 * @param {string} sessionId - 游戏会话ID
 */
async function completeGame(sessionId) {
  if (!contract) {
    if (!initializeContract()) {
      throw new Error('合约未初始化');
    }
  }
  
  try {
    const sessionIdBytes32 = ethers.id(sessionId);
    const tx = await contract.completeGame(sessionIdBytes32);
    const receipt = await tx.wait();
    
    console.log(`[合约工具] 游戏完成，交易哈希: ${receipt.hash}`);
    return receipt.hash;
  } catch (error) {
    console.error('[合约工具] 完成游戏失败:', error);
    throw error;
  }
}

// 记录已处理的 session（避免重复调用）
const processedFailSessions = new Set();

/**
 * 游戏失败
 * @param {string} sessionId - 游戏会话ID
 */
async function failGame(sessionId) {
  if (!contract) {
    if (!initializeContract()) {
      throw new Error('合约未初始化');
    }
  }
  
  // 检查是否已经处理过
  if (processedFailSessions.has(sessionId)) {
    console.log(`[合约工具] Session ${sessionId} 已经处理过失败标记，跳过`);
    return null;
  }
  
  try {
    const sessionIdBytes32 = ethers.id(sessionId);
    
    // 先检查合约状态，避免重复调用
    try {
      const session = await contract.getGameSession(sessionIdBytes32);
      if (!session.isActive) {
        console.log(`[合约工具] Session ${sessionId} 已经失效，跳过`);
        processedFailSessions.add(sessionId);
        return null;
      }
    } catch (checkError) {
      // 如果检查失败，继续尝试调用（可能是 session 不存在）
      console.log(`[合约工具] 检查 session 状态失败，继续尝试标记失败`);
    }
    
    const tx = await contract.failGame(sessionIdBytes32);
    const receipt = await tx.wait();
    
    // 标记为已处理
    processedFailSessions.add(sessionId);
    
    console.log(`[合约工具] 游戏失败，交易哈希: ${receipt.hash}`);
    return receipt.hash;
  } catch (error) {
    // 如果是 "already known" 错误，说明交易已经在处理中，可以忽略
    if (error.error && (error.error.message === 'already known' || error.error.code === -32000)) {
      console.log(`[合约工具] 交易已在处理中（already known），忽略重复提交`);
      processedFailSessions.add(sessionId);
      return null;
    }
    console.error('[合约工具] 标记游戏失败失败:', error);
    throw error;
  }
}

/**
 * 获取游戏会话信息
 * @param {string} sessionId - 游戏会话ID
 */
async function getGameSession(sessionId) {
  if (!contract) {
    if (!initializeContract()) {
      throw new Error('合约未初始化');
    }
  }
  
  try {
    const sessionIdBytes32 = ethers.id(sessionId);
    const result = await contract.getGameSession(sessionIdBytes32);
    
    return {
      player: result[0],
      entryFeePaid: ethers.formatEther(result[1]),
      totalReward: ethers.formatEther(result[2]),
      completedLevels: result[3].toString(),
      isActive: result[4],
      isCompleted: result[5]
    };
  } catch (error) {
    console.error('[合约工具] 获取游戏会话失败:', error);
    throw error;
  }
}

/**
 * 获取玩家总奖励
 * @param {string} playerAddress - 玩家地址
 */
async function getPlayerReward(playerAddress) {
  if (!contract) {
    if (!initializeContract()) {
      throw new Error('合约未初始化');
    }
  }
  
  try {
    const reward = await contract.getPlayerReward(playerAddress);
    return ethers.formatEther(reward);
  } catch (error) {
    console.error('[合约工具] 获取玩家奖励失败:', error);
    throw error;
  }
}

/**
 * 玩家提取奖励（由玩家钱包调用，这里只是查询接口）
 * 注意：实际的 claimReward 应该由前端直接调用合约
 * @param {string} playerAddress - 玩家地址
 */
async function claimReward(playerAddress) {
  // 这个方法实际上应该由前端调用合约，这里只是提供查询功能
  // 返回玩家可提取的奖励金额
  return await getPlayerReward(playerAddress);
}

/**
 * 获取合约余额
 */
async function getContractBalance() {
  if (!contract) {
    if (!initializeContract()) {
      throw new Error('合约未初始化');
    }
  }
  
  try {
    const balance = await contract.getContractBalance();
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('[合约工具] 获取合约余额失败:', error);
    throw error;
  }
}

module.exports = {
  setContractAddress,
  initializeContract,
  startGame,
  completeLevel,
  completeGame,
  failGame,
  getGameSession,
  getPlayerReward,
  claimReward,
  getContractBalance,
  CONTRACT_ADDRESS
};
