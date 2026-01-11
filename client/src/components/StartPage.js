import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';

function StartPage({ onStart }) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (onStart) {
      onStart();
    }
    navigate('/');
  };

  return (
    <div className="start-page">
      <div className="start-content">
        <h1 className="game-title">FGO老虎机链游</h1>
        <p className="game-subtitle">体验策略与运气的完美结合</p>
        <button className="btn-start" onClick={handleStart}>
          开始游戏
        </button>
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
