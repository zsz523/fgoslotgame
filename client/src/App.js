import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import StartPage from './components/StartPage';
import MainGame from './components/MainGame';
import SlotMachinePage from './components/SlotMachinePage';
import GameOverPage from './components/GameOverPage';
import WalletConnect from './components/WalletConnect';
import { ETHEREUM_CONFIG } from './config/ethereum';
import './App.css';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [probabilities, setProbabilities] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStartPage, setShowStartPage] = useState(true);
  const [gameMode, setGameMode] = useState(null); // 'guest' 或 'ethereum'
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [pendingSessionId, setPendingSessionId] = useState(null); // 用于支付时的sessionId

  useEffect(() => {
    // 不自动初始化，等待用户点击开始
  }, []);

  const initializeGame = async (mode) => {
    setGameMode(mode);
    
    // 如果是游客模式，直接初始化游戏
    if (mode === 'guest') {
      try {
        setIsLoading(true);
        const response = await axios.post(`${API_BASE_URL}/game/new`, {
          gameMode: 'guest'
        });
        setSessionId(response.data.sessionId);
        setGameState(response.data.gameState);
        setProbabilities(response.data.probabilities || {});
        setIsLoading(false);
        setShowStartPage(false);
      } catch (error) {
        console.error('初始化游戏失败:', error);
        setIsLoading(false);
      }
    } else {
      // 以太坊模式：生成sessionId用于合约调用
      const gameSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setPendingSessionId(gameSessionId);
      // WalletConnect组件会处理连接和支付，完成后调用handleWalletConnected
    }
  };

  const handleWalletConnected = async (info) => {
    setWalletInfo(info);
    setWalletConnected(true);
    
    // 使用pendingSessionId（在支付时已生成）
    const gameSessionId = pendingSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 支付成功后初始化游戏
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/game/new`, {
        gameMode: 'ethereum',
        walletAddress: info.address,
        txHash: info.txHash,
        blockNumber: info.blockNumber,
        sessionId: gameSessionId // 传递sessionId给后端
      });
      setSessionId(response.data.sessionId);
      setGameState(response.data.gameState);
      setProbabilities(response.data.probabilities || {});
      setIsLoading(false);
      setShowStartPage(false);
      setPendingSessionId(null); // 清除pendingSessionId
    } catch (error) {
      console.error('初始化游戏失败:', error);
      setIsLoading(false);
      alert('初始化游戏失败，请重试');
    }
  };

  const updateGameState = async () => {
    if (!sessionId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/game/${sessionId}`);
      setGameState(response.data.gameState);
      setProbabilities(response.data.probabilities || {});
    } catch (error) {
      console.error('更新游戏状态失败:', error);
    }
  };

  // 重置游戏状态，返回模式选择界面
  const resetToStartPage = () => {
    setSessionId(null);
    setGameState(null);
    setProbabilities(null);
    setGameMode(null);
    setWalletConnected(false);
    setWalletInfo(null);
    setPendingSessionId(null);
    setShowStartPage(true);
    setIsLoading(false);
  };

  if (showStartPage) {
    // 如果选择了以太坊模式但还未连接钱包，显示钱包连接界面
    if (gameMode === 'ethereum' && !walletConnected) {
      return (
        <Router>
          <div className="App">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="start-page">
                    <div className="start-content">
                      <h1 className="game-title">FGO老虎机链游</h1>
                      <p className="game-subtitle">以太坊模式 - 连接钱包并支付入场费</p>
                      <WalletConnect 
                        onConnected={handleWalletConnected}
                        recipientAddress={ETHEREUM_CONFIG.GAME_RECIPIENT_ADDRESS}
                        sessionId={pendingSessionId}
                      />
                      <button 
                        className="btn-secondary" 
                        onClick={() => {
                          setGameMode(null);
                          setWalletConnected(false);
                          setWalletInfo(null);
                        }}
                        style={{ marginTop: '30px' }}
                      >
                        返回选择模式
                      </button>
                    </div>
                  </div>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      );
    }

    return (
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={<StartPage onStart={initializeGame} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    );
  }

  if (isLoading) {
    return <div className="loading">加载中...</div>;
  }

  if (!sessionId || !gameState) {
    return <div className="error">游戏初始化失败</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <MainGame
                sessionId={sessionId}
                gameState={gameState}
                probabilities={probabilities}
                onUpdate={updateGameState}
                gameMode={gameMode}
                walletInfo={walletInfo}
              />
            }
          />
          <Route
            path="/slot"
            element={
              <SlotMachinePage
                sessionId={sessionId}
                gameState={gameState}
                probabilities={probabilities}
                onUpdate={updateGameState}
              />
            }
          />
          <Route
            path="/gameover"
            element={
              <GameOverPage
                sessionId={sessionId}
                gameState={gameState}
                gameMode={gameMode}
                onRestart={resetToStartPage}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
