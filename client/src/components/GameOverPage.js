import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GameOverPage.css';

const API_BASE_URL = 'http://localhost:3001/api';

function GameOverPage({ sessionId, gameState, onRestart }) {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/game/${sessionId}/report`);
      setReport(response.data.report);
      setLoading(false);
    } catch (error) {
      console.error('获取报表失败:', error);
      setLoading(false);
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
            onClick={async () => {
              if (onRestart) {
                await onRestart();
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
