import React, { useState, useEffect } from 'react';
import { connectWallet, getCurrentAccount, payEntryFeeViaContract, payEntryFee, checkWalletInstalled, onAccountsChanged, onChainChanged, formatEther, getEntryFee } from '../utils/wallet';
import { ETHEREUM_CONFIG } from '../config/ethereum';
import './WalletConnect.css';

function WalletConnect({ onConnected, recipientAddress, sessionId }) {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    // 检查是否已连接
    checkConnection();
    
    // 监听账户变化
    const unsubscribeAccounts = onAccountsChanged(handleAccountsChanged);
    const unsubscribeChain = onChainChanged(handleChainChanged);
    
    return () => {
      if (unsubscribeAccounts) unsubscribeAccounts();
      if (unsubscribeChain) unsubscribeChain();
    };
  }, []);

  const checkConnection = async () => {
    if (!checkWalletInstalled()) {
      setError('请安装MetaMask或其他Web3钱包');
      return;
    }

    const currentAccount = await getCurrentAccount();
    if (currentAccount) {
      // 检查网络是否为 Sepolia
      if (currentAccount.network.chainId !== BigInt(ETHEREUM_CONFIG.SUPPORTED_CHAIN_IDS.SEPOLIA)) {
        setError('请切换到 Sepolia 测试网络');
        return;
      }
      setAccount(currentAccount);
      // 传入 provider，确保余额能正确加载
      await updateBalance(currentAccount.address, currentAccount.provider);
    }
  };

  const updateBalance = async (address, provider) => {
    // 如果没有传入 provider，尝试使用 account.provider
    const balanceProvider = provider || (account && account.provider);
    if (!balanceProvider) {
      console.warn('无法获取余额：provider 未设置');
      return;
    }
    
    try {
      const bal = await balanceProvider.getBalance(address);
      setBalance(bal);
    } catch (error) {
      console.error('获取余额失败:', error);
      setBalance(null);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setBalance(null);
    } else {
      checkConnection();
    }
  };

  const handleChainChanged = () => {
    checkConnection();
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const walletInfo = await connectWallet();
      
      // 检查网络是否为 Sepolia
      if (walletInfo.network.chainId !== BigInt(ETHEREUM_CONFIG.SUPPORTED_CHAIN_IDS.SEPOLIA)) {
        setError('请切换到 Sepolia 测试网络');
        setIsConnecting(false);
        return;
      }
      
      setAccount(walletInfo);
      // 传入 provider，确保余额能正确加载
      await updateBalance(walletInfo.address, walletInfo.provider);
    } catch (error) {
      setError(error.message || '连接钱包失败');
      console.error('连接钱包失败:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePay = async () => {
    if (!account) {
      setError('请先连接钱包');
      return;
    }

    setIsPaying(true);
    setError(null);
    setTxHash(null);

    try {
      const entryFee = getEntryFee();
      const balance = await account.provider.getBalance(account.address);
      
      if (balance < entryFee) {
        const currency = account.network.chainId === BigInt(ETHEREUM_CONFIG.SUPPORTED_CHAIN_IDS.SEPOLIA) ? 'SepETH' : 'ETH';
        throw new Error(`余额不足，需要至少 ${formatEther(entryFee)} ${currency}`);
      }

      // 优先使用智能合约支付
      let result;
      if (ETHEREUM_CONFIG.CONTRACT_ADDRESS) {
        // 使用传入的sessionId或生成新的
        const gameSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        result = await payEntryFeeViaContract(account.signer, ETHEREUM_CONFIG.CONTRACT_ADDRESS, gameSessionId);
      } else if (recipientAddress && recipientAddress !== '0x0000000000000000000000000000000000000000') {
        // 备用：直接转账
        result = await payEntryFee(account.signer, recipientAddress);
      } else {
        throw new Error('未配置合约地址或接收地址，请联系管理员');
      }
      
      if (result.success) {
        setTxHash(result.txHash);
        // 支付成功后通知父组件
        if (onConnected) {
          onConnected({
            address: account.address,
            txHash: result.txHash,
            blockNumber: result.blockNumber,
          });
        }
      } else {
        throw new Error('交易失败');
      }
    } catch (error) {
      setError(error.message || '支付失败');
      console.error('支付失败:', error);
    } finally {
      setIsPaying(false);
    }
  };

  if (!checkWalletInstalled()) {
    return (
      <div className="wallet-connect">
        <div className="wallet-error">
          <div className="error-icon">⚠️</div>
          <h3>未检测到Web3钱包</h3>
          <p>请安装MetaMask或其他Web3钱包以使用以太坊模式</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="install-link"
          >
            下载MetaMask
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      {!account ? (
        <div className="wallet-not-connected">
          <div className="wallet-icon">🔗</div>
          <h3>连接钱包</h3>
          <p>请连接您的以太坊钱包以继续</p>
          <button 
            className="btn-connect" 
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? '连接中...' : '连接钱包'}
          </button>
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-info">
            <div className="wallet-icon-success">✓</div>
            <h3>钱包已连接</h3>
            <div className="wallet-address">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </div>
            <div className="wallet-network">
              网络: {account.network.chainId === BigInt(ETHEREUM_CONFIG.SUPPORTED_CHAIN_IDS.SEPOLIA) ? 'Sepolia 测试网' : '未知网络'}
            </div>
            {balance !== null && (
              <div className="wallet-balance">
                余额: {formatEther(balance)} {account.network.chainId === BigInt(ETHEREUM_CONFIG.SUPPORTED_CHAIN_IDS.SEPOLIA) ? 'SepETH' : 'ETH'}
              </div>
            )}
          </div>

          {!txHash ? (
            <div className="payment-section">
              <div className="entry-fee-info">
                <div className="fee-label">入场费</div>
                <div className="fee-amount">{formatEther(getEntryFee())} {account.network.chainId === BigInt(ETHEREUM_CONFIG.SUPPORTED_CHAIN_IDS.SEPOLIA) ? 'SepETH' : 'ETH'}</div>
              </div>
              <button 
                className="btn-pay" 
                onClick={handlePay}
                disabled={isPaying || !balance || balance < getEntryFee()}
              >
                {isPaying ? '支付中...' : '支付入场费'}
              </button>
              {balance !== null && balance < getEntryFee() && (
                <div className="insufficient-balance">
                  余额不足，需要至少 {formatEther(getEntryFee())} {account.network.chainId === BigInt(ETHEREUM_CONFIG.SUPPORTED_CHAIN_IDS.SEPOLIA) ? 'SepETH' : 'ETH'}
                </div>
              )}
              {balance === null && (
                <div className="insufficient-balance">
                  正在加载余额...
                </div>
              )}
            </div>
          ) : (
            <div className="payment-success">
              <div className="success-icon">✓</div>
              <h3>支付成功！</h3>
              <div className="tx-info">
                <div className="tx-label">交易哈希:</div>
                <a 
                  href={`${ETHEREUM_CONFIG.ETHERSCAN_URL[account?.network?.chainId] || ETHEREUM_CONFIG.ETHERSCAN_URL[1]}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="wallet-error-message">
          <div className="error-icon-small">⚠️</div>
          {error}
        </div>
      )}
    </div>
  );
}

export default WalletConnect;
