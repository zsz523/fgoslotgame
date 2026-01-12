import React, { useState } from 'react';
import './StartPage.css';

function StartPage({ onStart }) {
  const [gameMode, setGameMode] = useState(null); // 'guest' 或 'ethereum'

  const handleModeSelect = (mode) => {
    setGameMode(mode);
  };

  const handleStart = () => {
    if (onStart) {
      onStart(gameMode);
    }
    // 不需要 navigate，App.js 会根据 gameMode 自动切换界面
  };

  return (
    <div className="start-page">
      <div className="start-content">
        <h1 className="game-title">FGO老虎机链游</h1>
        <p className="game-subtitle">体验策略与运气的完美结合</p>
        
        {!gameMode ? (
          <div className="mode-selection">
            <h2 className="mode-title">选择游戏模式</h2>
            <div className="mode-buttons">
              <button 
                className="mode-btn guest-mode" 
                onClick={() => handleModeSelect('guest')}
              >
                <div className="mode-icon">👤</div>
                <div className="mode-name">游客游玩</div>
                <div className="mode-desc">免费体验，无需支付</div>
              </button>
              <button 
                className="mode-btn ethereum-mode" 
                onClick={() => handleModeSelect('ethereum')}
              >
                <div className="mode-icon">🔗</div>
                <div className="mode-name">以太坊游玩</div>
                <div className="mode-desc">支付0.05 ETH入场费，获得真实奖励</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="mode-confirmed">
            <div className="selected-mode">
              {gameMode === 'guest' ? (
                <>
                  <div className="mode-icon-large">👤</div>
                  <h2>游客模式</h2>
                  <p>您将免费体验游戏，无需支付任何费用</p>
                </>
              ) : (
                <>
                  <div className="mode-icon-large">🔗</div>
                  <h2>以太坊模式</h2>
                  <p>需要连接钱包并支付0.05 ETH入场费</p>
                </>
              )}
            </div>
            <div className="action-buttons">
              <button className="btn-secondary" onClick={() => setGameMode(null)}>
                返回选择
              </button>
              <button className="btn-start" onClick={handleStart}>
                {gameMode === 'guest' ? '开始游戏' : '连接钱包并开始'}
              </button>
            </div>
          </div>
        )}

        <div className="game-features">
          <div className="feature-item">
            <h3>🎰 老虎机系统</h3>
            <p>3x5网格，多种形状组合</p>
          </div>
          <div className="feature-item">
            <h3>⚔️ 从者系统</h3>
            <p>33种从者，各具特色技能</p>
          </div>
          <div className="feature-item">
            <h3>🎯 事件系统</h3>
            <p>每轮选择事件增强实力</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
