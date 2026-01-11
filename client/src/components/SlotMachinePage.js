import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getSymbolImage, getCurrencyImage } from '../utils/imagePaths';
import './SlotMachinePage.css';

const API_BASE_URL = 'http://localhost:3001/api';

const SYMBOL_NAMES = {
  artoria: '阿尔托莉雅',
  gilgamesh: '吉尔伽美什',
  nobunaga: '织田信长',
  jeanne_alter: '贞德alter',
  ishtar: '伊什塔尔',
  nero: '尼禄',
  muramasa: '千子村正',
  phantasmoon: 'phantasmoon',
  melt: '梅尔特莉莉丝',
  solomon: '所罗门'
};

function SlotMachinePage({ sessionId, gameState, probabilities, onUpdate }) {
  const navigate = useNavigate();
  const [localGameState, setLocalGameState] = useState(gameState);
  const [localProbabilities, setLocalProbabilities] = useState(probabilities);
  const [slotGrid, setSlotGrid] = useState(null);
  const [lastReward, setLastReward] = useState(0);
  const [lastPatterns, setLastPatterns] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedCells, setHighlightedCells] = useState(new Set());
  const [negativeHighlightedCells, setNegativeHighlightedCells] = useState(new Set());

  useEffect(() => {
    setLocalGameState(gameState);
    setLocalProbabilities(probabilities);
    if (gameState.slotResults) {
      setSlotGrid(gameState.slotResults);
    }
  }, [gameState, probabilities]);

  const handleSpin = async () => {
    if (isSpinning || !localGameState || localGameState.spinsRemaining <= 0) return;

    setIsSpinning(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/slot/spin`);
      setLocalGameState(response.data.gameState);
      setLocalProbabilities(response.data.probabilities);
      setSlotGrid(response.data.spinResult.grid);
      setLastReward(response.data.spinResult.reward);
      const patterns = response.data.spinResult.patterns || [];
      setLastPatterns(patterns);
      
      // 高亮所有形状的位置（每个形状的所有位置都要高亮）
      const highlighted = new Set();
      const negativeHighlighted = new Set();
      
      patterns.forEach(pattern => {
        if (pattern.positions && Array.isArray(pattern.positions)) {
          const isNegative = pattern.symbolId === 'solomon';
          pattern.positions.forEach(pos => {
            // 处理位置数组 [row, col]
            const [row, col] = Array.isArray(pos) ? pos : [pos.row, pos.col];
            if (row !== undefined && col !== undefined) {
              const key = `${row}-${col}`;
              highlighted.add(key);
              if (isNegative) {
                negativeHighlighted.add(key);
              }
            }
          });
        }
      });
      
      setHighlightedCells(highlighted);
      setNegativeHighlightedCells(negativeHighlighted);
      
      // 闪烁动画后清除高亮（2.5秒后）
      setTimeout(() => {
        setHighlightedCells(new Set());
        setNegativeHighlightedCells(new Set());
      }, 2500);
      
      if (response.data.isGameOver) {
        navigate('/gameover');
        return;
      }

      // 检查是否还能继续玩
      const minCost = 3000 * response.data.gameState.level;
      if (response.data.gameState.quantum < minCost && response.data.gameState.spinsRemaining === 0) {
        navigate('/gameover');
        return;
      }

      await onUpdate();
    } catch (error) {
      console.error('旋转失败:', error);
      alert('旋转失败');
    } finally {
      setIsSpinning(false);
    }
  };

  const handleExit = async () => {
    // 先更新游戏状态
    if (onUpdate) {
      await onUpdate();
    }
    
    // 检查是否还能继续玩
    if (localGameState) {
      const minCost = 3000 * localGameState.level;
      if (localGameState.quantum < minCost && localGameState.spinsRemaining === 0) {
        navigate('/gameover');
        return;
      }
      
      // 没有旋转次数了，自动处理下一回合或完成本轮
      if (localGameState.spinsRemaining === 0) {
        if (localGameState.round >= localGameState.maxRounds) {
          // 需要完成本轮，自动完成
          try {
            const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/level/complete`);
            console.log('[前端-SlotMachine] 完成轮次响应:', {
              level: response.data.gameState?.level,
              round: response.data.gameState?.round,
              isGameOver: response.data.isGameOver
            });
            if (response.data.isGameOver) {
              navigate('/gameover');
            } else {
              // 轮次完成，自动开始下一轮
              // 更新父组件状态
              if (onUpdate) {
                await onUpdate();
              }
              // 返回主界面
              navigate('/');
            }
          } catch (error) {
            console.error('[前端-SlotMachine] 完成轮次失败:', error);
            navigate('/');
          }
        } else {
          // 自动开始下一回合
          try {
            await axios.post(`${API_BASE_URL}/game/${sessionId}/round/start`);
            // 开始下一回合后，更新状态并返回主界面，TurnSelector会自动显示
            if (onUpdate) {
              await onUpdate();
            }
            navigate('/');
          } catch (error) {
            console.error('[前端-SlotMachine] 开始新回合失败:', error);
            navigate('/');
          }
        }
      } else {
        // 还有旋转次数，返回主界面
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const renderSlotCell = (symbolId, row, col) => {
    if (!symbolId) return null;
    const symbolName = SYMBOL_NAMES[symbolId] || symbolId;
    const isNegative = symbolId === 'solomon';
    const cellKey = `${row}-${col}`;
    const isHighlighted = highlightedCells.has(cellKey);
    const isNegativePattern = negativeHighlightedCells.has(cellKey);
    
    return (
      <div
        key={cellKey}
        className={`slot-cell ${isNegative ? 'negative' : ''} ${isHighlighted ? (isNegativePattern ? 'highlighted-negative' : 'highlighted') : ''}`}
      >
        <img 
          src={getSymbolImage(symbolId)} 
          alt={symbolName}
          className="slot-symbol-image"
          onError={(e) => {
            e.target.style.display = 'none';
            const icon = e.target.nextSibling;
            if (icon) icon.style.display = 'flex';
          }}
        />
        <div className="symbol-icon" style={{ display: 'none' }}>
          {symbolId.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  };

  return (
    <div className="slot-machine-page">
      <div className="slot-header">
        <h2>老虎机</h2>
        <div className="slot-stats">
          <div className="stat">剩余次数: {localGameState?.spinsRemaining || 0}</div>
          <div className="stat">
            <img src={getCurrencyImage('quantum')} alt="量子" className="stat-currency-icon" />
            量子: {localGameState?.quantum?.toLocaleString() || 0}
          </div>
          {lastReward !== 0 && (
            <div className={`stat reward ${lastReward < 0 ? 'negative' : 'positive'}`}>
              {lastReward > 0 ? '获得' : '失去'}量子: {lastReward > 0 ? '+' : ''}{lastReward.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="slot-machine">
        {slotGrid && slotGrid.length > 0 ? (
          <div className="slot-grid">
            {slotGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="slot-row">
                {row && row.map((symbolId, colIndex) =>
                  renderSlotCell(symbolId, rowIndex, colIndex)
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="slot-placeholder">点击旋转开始</div>
        )}

      </div>

      <div className="slot-actions">
        <button
          className="btn-spin"
          onClick={handleSpin}
          disabled={isSpinning || !localGameState || localGameState.spinsRemaining <= 0}
        >
          {isSpinning ? '旋转中...' : `旋转 (剩余 ${localGameState?.spinsRemaining || 0} 次)`}
        </button>
        <button className="btn-exit" onClick={handleExit}>
          退出老虎机
        </button>
      </div>
    </div>
  );
}

export default SlotMachinePage;
