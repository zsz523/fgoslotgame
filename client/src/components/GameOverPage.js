import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { claimReward, checkWalletInstalled, getCurrentAccount } from '../utils/wallet';
import { ETHEREUM_CONFIG } from '../config/ethereum';
import './GameOverPage.css';

const API_BASE_URL = 'http://localhost:3001/api';

function GameOverPage({ sessionId, gameState, gameMode, onRestart }) {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/game/${sessionId}/report`);
      setReport(response.data.report);
      
      // 如果是以太坊模式且游戏成功，调用完成游戏接口支付奖励
      if (response.data.report.gameMode === 'ethereum' && 
          !response.data.report.isGameOver && 
          response.data.report.contractReward &&
          !response.data.report.contractReward.isCompleted) {
        try {
          await axios.post(`${API_BASE_URL}/game/${sessionId}/game/complete`);
          // 重新获取报表以更新奖励状态
          const updatedResponse = await axios.get(`${API_BASE_URL}/game/${sessionId}/report`);
          setReport(updatedResponse.data.report);
        } catch (error) {
          console.error('完成游戏失败:', error);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('获取报表失败:', error);
      setLoading(false);
    }
  };

  const handleClaimReward = async () => {
    if (!checkWalletInstalled()) {
      setClaimError('请安装MetaMask或其他Web3钱包');
      return;
    }

    if (!ETHEREUM_CONFIG.CONTRACT_ADDRESS) {
      setClaimError('合约地址未配置');
      return;
    }

    setIsClaiming(true);
    setClaimError(null);
    setClaimSuccess(false);

    try {
      // 获取当前账户
      const account = await getCurrentAccount();
      if (!account) {
        throw new Error('请先连接钱包');
      }

      // 检查网络
      if (account.network.chainId !== BigInt(ETHEREUM_CONFIG.SUPPORTED_CHAIN_IDS.SEPOLIA)) {
        throw new Error('请切换到 Sepolia 测试网络');
      }

      // 调用合约提取奖励
      const result = await claimReward(account.signer, ETHEREUM_CONFIG.CONTRACT_ADDRESS);
      
      if (result.success) {
        setClaimSuccess(true);
        // 重新获取报表以更新状态
        await fetchReport();
      } else {
        throw new Error('提取失败');
      }
    } catch (error) {
      setClaimError(error.message || '提取奖励失败');
      console.error('提取奖励失败:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (loading) {
    return <div className="game-over-page">加载中...</div>;
  }

  if (!report) {
    return <div className="game-over-page">无法加载游戏报表</div>;
  }

  return (
    <div className="game-over-page">
      {/* 提取奖励加载遮罩 */}
      {isClaiming && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>正在提取奖励...</p>
            <p className="loading-hint">请确认 MetaMask 交易，不要关闭页面</p>
          </div>
        </div>
      )}
      <div className="game-over-content">
        <h1 className="game-over-title">游戏结束</h1>
        
        <div className="report-section">
          <h2>游戏统计</h2>
          <div className="report-grid">
            <div className="report-item">
              <div className="report-label">最终轮数</div>
              <div className="report-value">{report.level}</div>
            </div>
            <div className="report-item">
              <div className="report-label">最终量子</div>
              <div className="report-value">{report.finalQuantum.toLocaleString()}</div>
            </div>
            <div className="report-item">
              <div className="report-label">总圣晶石</div>
              <div className="report-value">{report.totalSaintQuartz}</div>
            </div>
            <div className="report-item">
              <div className="report-label">游戏状态</div>
              <div className="report-value">
                {report.isGameOver ? '失败' : report.isLevelComplete ? '完成' : '进行中'}
              </div>
            </div>
          </div>
        </div>

        {/* 以太坊奖励信息 */}
        {report.gameMode === 'ethereum' && (
          <div className="report-section reward-section">
            <h2>以太坊奖励</h2>
            {report.contractReward ? (
              <div className="reward-info">
                <div className="reward-item">
                  <div className="reward-label">完成轮数</div>
                  <div className="reward-value">{report.contractReward.completedLevels}</div>
                </div>
                <div className="reward-item">
                  <div className="reward-label">累计奖励</div>
                  <div className="reward-value highlight">{report.contractReward.totalReward} ETH</div>
                </div>
                <div className="reward-item">
                  <div className="reward-label">支付状态</div>
                  <div className="reward-value">
                    {report.contractReward.isCompleted ? '✅ 已支付' : '⏳ 待支付'}
                  </div>
                </div>
                {report.walletAddress && (
                  <div className="wallet-info">
                    <div className="wallet-label">钱包地址</div>
                    <div className="wallet-address">{report.walletAddress}</div>
                  </div>
                )}
                {/* 提款按钮 */}
                {report.contractReward && 
                 parseFloat(report.contractReward.totalReward) > 0 && 
                 !report.contractReward.isCompleted && (
                  <div className="claim-section">
                    <button
                      className="btn-claim"
                      onClick={handleClaimReward}
                      disabled={isClaiming || claimSuccess}
                    >
                      {isClaiming ? '提取中...' : claimSuccess ? '✅ 已提取' : '提取奖励'}
                    </button>
                    {claimError && (
                      <div className="claim-error">{claimError}</div>
                    )}
                    {claimSuccess && (
                      <div className="claim-success">奖励已成功提取到您的钱包</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="reward-info">
                <div className="reward-item">
                  <div className="reward-label">完成轮数</div>
                  <div className="reward-value">{report.completedLevels || 0}</div>
                </div>
                <div className="reward-item">
                  <div className="reward-label">预计奖励</div>
                  <div className="reward-value highlight">{report.calculatedRewardETH || 0} ETH</div>
                </div>
                <div className="reward-note">
                  ⚠️ 合约未连接，奖励信息可能不准确
                </div>
              </div>
            )}
          </div>
        )}

        <div className="report-section">
          <h2>出战从者</h2>
          {report.activeServants.length > 0 ? (
            <div className="servant-list">
              {report.activeServants.map((name, index) => (
                <div key={index} className="servant-tag">{name}</div>
              ))}
            </div>
          ) : (
            <div className="empty-message">无出战从者</div>
          )}
        </div>

        <div className="report-section">
          <h2>仓库从者</h2>
          {report.inventoryServants.length > 0 ? (
            <div className="servant-list">
              {report.inventoryServants.map((name, index) => (
                <div key={index} className="servant-tag">{name}</div>
              ))}
            </div>
          ) : (
            <div className="empty-message">仓库为空</div>
          )}
        </div>

        <div className="report-actions">
          <button
            className="btn-restart"
            onClick={() => {
              if (onRestart) {
                onRestart();
              }
              navigate('/');
            }}
          >
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOverPage;
