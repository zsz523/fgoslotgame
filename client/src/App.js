import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import StartPage from './components/StartPage';
import MainGame from './components/MainGame';
import SlotMachinePage from './components/SlotMachinePage';
import GameOverPage from './components/GameOverPage';
import './App.css';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [probabilities, setProbabilities] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStartPage, setShowStartPage] = useState(true);

  useEffect(() => {
    // 不自动初始化，等待用户点击开始
  }, []);

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/game/new`);
      setSessionId(response.data.sessionId);
      setGameState(response.data.gameState);
      setProbabilities(response.data.probabilities || {});
      setIsLoading(false);
      setShowStartPage(false);
    } catch (error) {
      console.error('初始化游戏失败:', error);
      setIsLoading(false);
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

  if (showStartPage) {
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
                onRestart={initializeGame}
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
