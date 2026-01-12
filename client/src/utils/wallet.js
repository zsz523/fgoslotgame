import { ethers } from 'ethers';

// 以太坊网络配置
const NETWORK_CONFIG = {
  // 主网
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
  },
  // Sepolia测试网
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  },
  // 本地开发网络（如Ganache）
  localhost: {
    chainId: 1337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
  },
};

// 入场费（ETH）
const ENTRY_FEE = ethers.parseEther('0.05'); // 0.05 ETH

// 游戏合约地址（暂时为空，后续可以部署智能合约）
const GAME_CONTRACT_ADDRESS = null; // 暂时不使用智能合约

/**
 * 检查是否安装了MetaMask或其他Web3钱包
 */
export const checkWalletInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * 切换到 Sepolia 测试网
 */
export const switchToSepolia = async () => {
  if (!checkWalletInstalled()) {
    throw new Error('请安装MetaMask或其他Web3钱包');
  }

  const sepoliaChainId = '0x' + NETWORK_CONFIG.sepolia.chainId.toString(16); // 0xaa36a7

  try {
    // 尝试切换到 Sepolia
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: sepoliaChainId }],
    });
  } catch (switchError) {
    // 如果网络不存在，添加网络
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: sepoliaChainId,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/ba15bfee4339449687dbe06d876bcc5c'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } catch (addError) {
        throw new Error('无法添加 Sepolia 网络，请手动在 MetaMask 中添加');
      }
    } else {
      throw switchError;
    }
  }
};

/**
 * 连接钱包并确保在 Sepolia 网络
 */
export const connectWallet = async () => {
  if (!checkWalletInstalled()) {
    throw new Error('请安装MetaMask或其他Web3钱包');
  }

  try {
    // 先切换到 Sepolia 网络
    await switchToSepolia();
    
    // 请求连接账户
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    
    if (accounts.length === 0) {
      throw new Error('未找到账户，请确保钱包已解锁');
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    // 检查是否在 Sepolia 网络
    if (network.chainId !== BigInt(NETWORK_CONFIG.sepolia.chainId)) {
      throw new Error('请切换到 Sepolia 测试网络');
    }

    return {
      provider,
      signer,
      address,
      network,
    };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('用户拒绝了连接请求');
    }
    throw error;
  }
};

/**
 * 获取当前连接的账户
 */
export const getCurrentAccount = async () => {
  if (!checkWalletInstalled()) {
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_accounts', []);
    
    if (accounts.length === 0) {
      return null;
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    return {
      provider,
      signer,
      address,
      network,
    };
  } catch (error) {
    console.error('获取账户失败:', error);
    return null;
  }
};

/**
 * 支付入场费（使用智能合约）
 * @param {ethers.Signer} signer - 签名者对象
 * @param {string} contractAddress - 智能合约地址
 * @param {string} sessionId - 游戏会话ID
 */
export const payEntryFeeViaContract = async (signer, contractAddress, sessionId) => {
  try {
    // 检查余额
    const balance = await signer.provider.getBalance(await signer.getAddress());
    if (balance < ENTRY_FEE) {
      throw new Error(`余额不足，需要至少 ${ethers.formatEther(ENTRY_FEE)} ETH`);
    }

    // 合约ABI（简化版，只包含startGame方法）
    const contractABI = [
      "function startGame(bytes32 sessionId) external payable"
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // 将sessionId转换为bytes32
    const sessionIdBytes32 = ethers.id(sessionId);
    
    // 调用合约的startGame方法
    const tx = await contract.startGame(sessionIdBytes32, {
      value: ENTRY_FEE
    });

    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      success: receipt.status === 1,
    };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('用户拒绝了交易');
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('余额不足');
    }
    throw error;
  }
};

/**
 * 支付入场费（直接转账，备用方法）
 * @param {ethers.Signer} signer - 签名者对象
 * @param {string} recipientAddress - 接收地址（游戏服务器地址）
 */
export const payEntryFee = async (signer, recipientAddress) => {
  try {
    // 检查余额
    const balance = await signer.provider.getBalance(await signer.getAddress());
    if (balance < ENTRY_FEE) {
      throw new Error(`余额不足，需要至少 ${ethers.formatEther(ENTRY_FEE)} ETH`);
    }

    // 发送交易
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ENTRY_FEE,
    });

    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      success: receipt.status === 1,
    };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('用户拒绝了交易');
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('余额不足');
    }
    throw error;
  }
};

/**
 * 格式化ETH金额
 */
export const formatEther = (value) => {
  return ethers.formatEther(value);
};

/**
 * 解析ETH金额
 */
export const parseEther = (value) => {
  return ethers.parseEther(value);
};

/**
 * 获取入场费
 */
export const getEntryFee = () => {
  return ENTRY_FEE;
};

/**
 * 提取奖励（调用合约的 claimReward 方法）
 * @param {ethers.Signer} signer - 签名者对象
 * @param {string} contractAddress - 智能合约地址
 */
export const claimReward = async (signer, contractAddress) => {
  try {
    // 合约ABI（简化版，只包含claimReward方法）
    const contractABI = [
      "function claimReward() external",
      "function getPlayerReward(address player) external view returns (uint256)"
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // 先查询可提取的奖励
    const playerAddress = await signer.getAddress();
    const reward = await contract.getPlayerReward(playerAddress);
    
    if (reward === BigInt(0)) {
      throw new Error('没有可提取的奖励');
    }
    
    // 调用合约的claimReward方法
    const tx = await contract.claimReward();
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      success: receipt.status === 1,
      rewardAmount: ethers.formatEther(reward)
    };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('用户拒绝了交易');
    }
    if (error.message && error.message.includes('No reward')) {
      throw new Error('没有可提取的奖励');
    }
    throw error;
  }
};

/**
 * 监听账户变化
 */
export const onAccountsChanged = (callback) => {
  if (!checkWalletInstalled()) {
    return null;
  }

  window.ethereum.on('accountsChanged', callback);
  
  return () => {
    window.ethereum.removeListener('accountsChanged', callback);
  };
};

/**
 * 监听网络变化
 */
export const onChainChanged = (callback) => {
  if (!checkWalletInstalled()) {
    return null;
  }

  window.ethereum.on('chainChanged', callback);
  
  return () => {
    window.ethereum.removeListener('chainChanged', callback);
  };
};
