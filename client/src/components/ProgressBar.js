import React from 'react';
import './ProgressBar.css';

function ProgressBar({ current, target, label = '进度' }) {
  // 计算进度百分比（确保不超过100%）
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  
  // 格式化数字显示
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toLocaleString();
  };

  // 计算剩余数量
  const remaining = Math.max(0, target - current);
  
  // 根据进度百分比确定颜色
  const getProgressColor = () => {
    if (percentage >= 100) return '#22c55e'; // 绿色 - 已完成
    if (percentage >= 75) return '#3b82f6';  // 蓝色 - 接近完成
    if (percentage >= 50) return '#f59e0b'; // 橙色 - 过半
    if (percentage >= 25) return '#ef4444'; // 红色 - 刚开始
    return '#6b7280'; // 灰色 - 刚开始
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-header">
        <div className="progress-label">{label}</div>
        <div className="progress-percentage">{percentage.toFixed(1)}%</div>
      </div>
      
      <div className="progress-bar-wrapper">
        <div 
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: getProgressColor(),
            boxShadow: percentage >= 100 
              ? '0 0 20px rgba(34, 197, 94, 0.6)' 
              : `0 0 15px ${getProgressColor()}40`
          }}
        >
          {percentage > 10 && (
            <div className="progress-bar-shine"></div>
          )}
        </div>
        {percentage < 100 && (
          <div className="progress-bar-remaining" style={{ left: `${percentage}%` }}>
            <div className="progress-bar-marker"></div>
          </div>
        )}
      </div>
      
      <div className="progress-bar-stats">
        <div className="progress-stat">
          <span className="stat-label">当前:</span>
          <span className="stat-value current-value">{formatNumber(current)}</span>
        </div>
        <div className="progress-stat">
          <span className="stat-label">目标:</span>
          <span className="stat-value target-value">{formatNumber(target)}</span>
        </div>
        <div className="progress-stat">
          <span className="stat-label">剩余:</span>
          <span className="stat-value remaining-value">{formatNumber(remaining)}</span>
        </div>
      </div>
      
      {percentage >= 100 && (
        <div className="progress-complete-badge">
          <span className="complete-icon">✓</span>
          <span>目标已达成！</span>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
