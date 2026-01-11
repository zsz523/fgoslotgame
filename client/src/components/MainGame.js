import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SymbolProbabilityPanel from './SymbolProbabilityPanel';
import ServantManager from './ServantManager';
import TurnSelector from './TurnSelector';
import { getCurrencyImage } from '../utils/imagePaths';
import './MainGame.css';

const API_BASE_URL = 'http://localhost:3001/api';

function MainGame({ sessionId, gameState, probabilities, onUpdate }) {
  const navigate = useNavigate();
  const [localGameState, setLocalGameState] = useState(gameState);
  const [localProbabilities, setLocalProbabilities] = useState(probabilities);
  const [isCompletingLevel, setIsCompletingLevel] = useState(false);
  const [showServantManager, setShowServantManager] = useState(true); // 默认显示从者管理
  const [pendingEvents, setPendingEvents] = useState(null);
  const [autoStartTriggered, setAutoStartTriggered] = useState(false);
  const [autoRoundStartTriggered, setAutoRoundStartTriggered] = useState(false);

  useEffect(() => {
    // 同步父组件传入的状态到本地状态
    if (gameState) {
      // 如果本地状态不存在，或者父组件状态更新了，则更新
      // 检查多个关键字段的变化：level, round, quantum, saintQuartz, shopServants, inventoryServants, activeServants
      const shopIdsChanged = JSON.stringify(gameState.shopServants?.map(s => s.id).sort() || []) !== JSON.stringify(localGameState.shopServants?.map(s => s.id).sort() || []);
      const inventoryIdsChanged = JSON.stringify(gameState.inventoryServants?.map(s => s.id).sort() || []) !== JSON.stringify(localGameState.inventoryServants?.map(s => s.id).sort() || []);
      const activeIdsChanged = JSON.stringify(gameState.activeServants?.map(s => s.id).sort() || []) !== JSON.stringify(localGameState.activeServants?.map(s => s.id).sort() || []);
      
      const shouldUpdate = !localGameState || 
          gameState.level !== localGameState.level || 
          gameState.round !== localGameState.round ||
          Math.abs((gameState.quantum || 0) - (localGameState.quantum || 0)) > 0.01 ||
          gameState.saintQuartz !== localGameState.saintQuartz ||
          shopIdsChanged ||
          inventoryIdsChanged ||
          activeIdsChanged;
      
      if (shouldUpdate) {
        console.log('[前端] useEffect更新状态:', {
          isCompletingLevel,
          oldLevel: localGameState?.level,
          newLevel: gameState.level,
          oldRound: localGameState?.round,
          newRound: gameState.round,
          oldSaintQuartz: localGameState?.saintQuartz,
          newSaintQuartz: gameState.saintQuartz,
          oldShopCount: localGameState?.shopServants?.length,
          newShopCount: gameState.shopServants?.length,
          oldInventoryCount: localGameState?.inventoryServants?.length,
          newInventoryCount: gameState.inventoryServants?.length,
          oldActiveCount: localGameState?.activeServants?.length,
          newActiveCount: gameState.activeServants?.length
        });
        setLocalGameState(gameState);
        setLocalProbabilities(probabilities);
        // 如果游戏状态中有事件，也设置待处理事件
        if (gameState.events && gameState.events.length > 0) {
          setPendingEvents(gameState.events);
        } else {
          setPendingEvents(null);
        }
        // 重置自动开始标记
        setAutoStartTriggered(false);
        setAutoRoundStartTriggered(false);
      }
    }
  }, [gameState, probabilities, isCompletingLevel]);

  // 自动开始新轮（如果round为0且没有待处理事件，且未触发过）
  // 注意：completeLevel() 已经自动调用了 startNewLevel()，所以这里不应该再调用
  // 这个 useEffect 应该只在游戏初始化时使用
  useEffect(() => {
    // 如果正在完成轮次，跳过自动开始（completeLevel 已经处理了）
    if (isCompletingLevel) {
      return;
    }
    
    if (localGameState && localGameState.round === 0 && !pendingEvents && !autoStartTriggered && sessionId) {
      setAutoStartTriggered(true);
      const autoStart = async () => {
        try {
          console.log('[前端] 自动开始新轮（round=0且无事件）');
          const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/level/start`);
          setLocalGameState(response.data.gameState);
          setLocalProbabilities(response.data.probabilities);
          
          // 如果有事件需要选择，显示事件选择区域
          if (response.data.events && response.data.events.length > 0) {
            setPendingEvents(response.data.events);
          } else {
            // 没有事件，自动开始第一回合
            const roundResponse = await axios.post(`${API_BASE_URL}/game/${sessionId}/round/start`);
            setLocalGameState(roundResponse.data.gameState);
            setLocalProbabilities(roundResponse.data.probabilities);
            if (onUpdate) {
              await onUpdate();
            }
          }
        } catch (error) {
          console.error('自动开始新轮失败:', error);
          setAutoStartTriggered(false);
        }
      };
      autoStart();
    }
  }, [localGameState?.round, pendingEvents, autoStartTriggered, sessionId, onUpdate, isCompletingLevel]);

  // 监听游戏状态变化，如果回合结束且没有旋转次数，自动开始下一回合
  // 注意：这个 useEffect 不应该在 round=1 时触发，因为 selectEvent 已经自动开始了第一回合
  useEffect(() => {
    if (localGameState && 
        localGameState.round > 0 && 
        localGameState.round < localGameState.maxRounds &&
        localGameState.currentTurn !== null && 
        localGameState.spinsRemaining === 0 &&
        !autoRoundStartTriggered &&
        sessionId) {
      setAutoRoundStartTriggered(true);
      // 自动开始下一回合
      const autoStartNextRound = async () => {
        try {
          console.log('[前端] 自动开始下一回合:', {
            currentRound: localGameState.round,
            maxRounds: localGameState.maxRounds
          });
          const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/round/start`);
          console.log('[前端] 自动开始下一回合成功:', {
            newRound: response.data.gameState?.round
          });
          setLocalGameState(response.data.gameState);
          setLocalProbabilities(response.data.probabilities);
          if (onUpdate) {
            await onUpdate();
          }
          setAutoRoundStartTriggered(false);
        } catch (error) {
          console.error('自动开始下一回合失败:', error);
          setAutoRoundStartTriggered(false);
        }
      };
      autoStartNextRound();
    }
  }, [localGameState?.round, localGameState?.spinsRemaining, localGameState?.currentTurn, localGameState?.maxRounds, autoRoundStartTriggered, sessionId, onUpdate]);

  const handleStartNewLevel = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/level/start`);
      setLocalGameState(response.data.gameState);
      setLocalProbabilities(response.data.probabilities);
      
      // 如果有事件需要选择，显示事件选择区域
      if (response.data.events && response.data.events.length > 0) {
        setPendingEvents(response.data.events);
      } else {
        // 没有事件，自动开始第一回合
        await onUpdate();
        const roundResponse = await axios.post(`${API_BASE_URL}/game/${sessionId}/round/start`);
        setLocalGameState(roundResponse.data.gameState);
        setLocalProbabilities(roundResponse.data.probabilities);
        onUpdate();
      }
    } catch (error) {
      console.error('开始新轮失败:', error);
    }
  };

  const handleSelectEvent = async (eventIndex) => {
    try {
      console.log('[前端] 选择事件:', eventIndex);
      const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/event/select`, {
        eventIndex
      });
      console.log('[前端] 选择事件成功:', {
        level: response.data.gameState?.level,
        round: response.data.gameState?.round
      });
      setLocalGameState(response.data.gameState);
      setLocalProbabilities(response.data.probabilities);
      setPendingEvents(null);
      
      // 选择事件后，后端会自动开始第一回合（selectEvent中会调用startNewRound）
      // 所以这里不需要再调用round/start，只需要更新父组件状态
      if (onUpdate) {
        await onUpdate();
        console.log('[前端] 选择事件后状态已更新');
      }
    } catch (error) {
      console.error('选择事件失败:', error);
      alert('选择事件失败');
    }
  };

  const handleStartNewRound = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/round/start`);
      setLocalGameState(response.data.gameState);
      setLocalProbabilities(response.data.probabilities);
      await onUpdate();
    } catch (error) {
      console.error('开始新回合失败:', error);
    }
  };

  const handleTurnSelect = async (option) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/turn/select`, { option });
      setLocalGameState(response.data.gameState);
      setLocalProbabilities(response.data.probabilities);
      await onUpdate();
      
      // 选择完操作后，立即进入老虎机页面
      navigate('/slot');
    } catch (error) {
      console.error('选择回合操作失败:', error);
      alert('量子不足或操作无效');
    }
  };

  const handleCompleteLevel = async () => {
    try {
      setIsCompletingLevel(true);
      const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/level/complete`);
      
      console.log('[前端] 完成轮次响应:', {
        level: response.data.gameState?.level,
        round: response.data.gameState?.round,
        quantum: response.data.gameState?.quantum,
        events: response.data.events || response.data.gameState?.events
      });
      
      // 检查游戏是否结束
      if (response.data.isGameOver) {
        setIsCompletingLevel(false);
        navigate('/gameover');
        return;
      }
      
      // 轮次完成，后端已自动开始下一轮
      // 直接使用API返回的最新状态（已经是新轮的状态）
      const newGameState = response.data.gameState;
      console.log('[前端] 设置新轮状态:', {
        level: newGameState.level,
        round: newGameState.round,
        quantum: newGameState.quantum
      });
      
      // 强制更新本地状态
      setLocalGameState(newGameState);
      setLocalProbabilities(response.data.probabilities);
      
      // 如果有事件，显示事件选择
      if (response.data.events && response.data.events.length > 0) {
        setPendingEvents(response.data.events);
      } else if (newGameState && newGameState.events && newGameState.events.length > 0) {
        setPendingEvents(newGameState.events);
      } else {
        setPendingEvents(null);
      }
      
      // 更新父组件状态，确保同步
      // 注意：await确保父组件状态更新完成后再继续
      if (onUpdate) {
        await onUpdate();
        console.log('[前端] 父组件状态已更新');
      }
      
      // 在父组件状态更新完成后再重置标志
      // 使用setTimeout确保useEffect有机会检测到状态变化
      setTimeout(() => {
        setIsCompletingLevel(false);
      }, 200);
    } catch (error) {
      console.error('完成轮次失败:', error);
      alert('完成轮次失败');
      setIsCompletingLevel(false);
    }
  };

  const checkGameOver = () => {
    if (!localGameState) return false;
    const minCost = 3000 * localGameState.level;
    return localGameState.quantum < minCost && localGameState.spinsRemaining === 0;
  };

  useEffect(() => {
    if (checkGameOver() && localGameState && localGameState.spinsRemaining === 0) {
      navigate('/gameover');
    }
  }, [localGameState, navigate]);

  if (!localGameState) {
    return <div>加载中...</div>;
  }

  return (
    <div className="main-game">
      <div className="game-header">
        <h1>FGO老虎机链游</h1>
        <div className="stats">
          <div className="stat-item">
            <img src={getCurrencyImage('quantum')} alt="量子" className="currency-icon" />
            <span className="stat-label">量子:</span>
            <span className="stat-value">{localGameState.quantum.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <img src={getCurrencyImage('saintQuartz')} alt="圣晶石" className="currency-icon" />
            <span className="stat-label">圣晶石:</span>
            <span className="stat-value">{localGameState.saintQuartz}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">轮数:</span>
            <span className="stat-value">{localGameState.level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">回合:</span>
            <span className="stat-value">{localGameState.round}/{localGameState.maxRounds}</span>
          </div>
        </div>
      </div>

      {/* 选择区域（事件选择 + 回合操作选择）- 放在顶部醒目位置 */}
      <div className="selection-area">
        {/* 事件选择区域（如果有待处理事件） */}
        {pendingEvents && pendingEvents.length > 0 && (
          <div className="event-section-prominent">
            <h2>选择事件</h2>
            <div className="events-list-inline">
              {pendingEvents.map((event, index) => (
                <div
                  key={index}
                  className="event-card-inline"
                  onClick={() => handleSelectEvent(index)}
                >
                  <div className="event-type-badge">
                    {event.type === 'increase_weight' && '📈 概率提升'}
                    {event.type === 'increase_value' && '💰 倍率提升'}
                    {event.type === 'full_pattern_reward' && '🎯 全满奖励'}
                  </div>
                  <div className="event-symbol">{event.symbolName}</div>
                  <div className="event-description">{event.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 回合操作选择区域 */}
        {localGameState.round > 0 && localGameState.currentTurn === null && (
          <div className="turn-selector-section-prominent">
            <TurnSelector
              level={localGameState.level}
              quantum={localGameState.quantum}
              onSelect={handleTurnSelect}
            />
          </div>
        )}

        {/* 已选择回合操作，显示进入老虎机按钮 */}
        {localGameState.currentTurn !== null && localGameState.spinsRemaining > 0 && (
          <div className="turn-info-prominent">
            <p>已选择: {localGameState.currentTurn === 'cheap' ? '3次机会' : '7次机会'}</p>
            <p>剩余旋转次数: {localGameState.spinsRemaining}</p>
            <button className="btn-primary btn-large" onClick={() => navigate('/slot')}>
              进入老虎机
            </button>
          </div>
        )}
      </div>

      <div className="game-content-vertical">
        {/* 概率显示区域 */}
        <div className="probability-section">
          <SymbolProbabilityPanel probabilities={localProbabilities} />
        </div>

        {/* 从者商店区域 */}
        <div className="servant-section">
          <ServantManager
            sessionId={sessionId}
            gameState={localGameState}
            onUpdate={onUpdate}
            show={true}
            onToggle={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

export default MainGame;
