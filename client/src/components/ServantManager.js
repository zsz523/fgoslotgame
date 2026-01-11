import React, { useState } from 'react';
import axios from 'axios';
import { getServantImage } from '../utils/imagePaths';
import './ServantManager.css';

const API_BASE_URL = 'http://localhost:3001/api';

function ServantManager({ sessionId, gameState, onUpdate, show, onToggle }) {
  const [activeTab, setActiveTab] = useState('shop'); // 'shop', 'inventory', 'active'

  const handleBuyServant = async (servantId) => {
    try {
      console.log('[前端] 购买从者:', servantId);
      const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/servant/buy`, { servantId });
      console.log('[前端] 购买从者成功:', {
        shopServants: response.data.gameState?.shopServants?.map(s => s.name).join(', '),
        saintQuartz: response.data.gameState?.saintQuartz
      });
      // 更新父组件状态
      if (onUpdate) {
        await onUpdate();
        console.log('[前端] 购买从者后状态已更新');
      } else {
        console.error('[前端] onUpdate 未定义！');
      }
    } catch (error) {
      console.error('购买从者失败:', error);
      if (error.response) {
        console.error('错误响应:', error.response.data);
        // 如果是400错误，说明购买失败（圣晶石不足或从者已售完）
        if (error.response.status === 400) {
          alert('购买失败：圣晶石不足或从者已售完');
        } else {
          alert('购买失败：' + (error.response.data?.error || '未知错误'));
        }
      } else {
        alert('购买失败：网络错误');
      }
    }
  };

  const handleActivateServant = async (servantId) => {
    try {
      console.log('[前端] 激活从者:', servantId);
      console.log('[前端] 当前状态:', {
        activeServants: gameState.activeServants?.map(s => s.name).join(', ') || '无',
        activeCount: gameState.activeServants?.length || 0,
        inventoryServants: gameState.inventoryServants?.map(s => `${s.name}(${s.id})`).join(', ') || '无'
      });
      const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/servant/activate`, { servantId });
      console.log('[前端] 激活从者成功:', {
        activeServants: response.data.gameState?.activeServants?.map(s => s.name).join(', '),
        activeCount: response.data.gameState?.activeServants?.length
      });
      if (onUpdate) {
        await onUpdate();
        console.log('[前端] 激活从者后状态已更新');
      } else {
        console.error('[前端] onUpdate 未定义！');
      }
    } catch (error) {
      console.error('激活从者失败:', error);
      if (error.response) {
        console.error('错误响应:', error.response.data);
        // 如果是400错误，说明激活失败（出战栏已满或从者不存在）
        if (error.response.status === 400) {
          alert('激活失败：出战栏已满或从者不存在');
        } else {
          alert('激活失败：' + (error.response.data?.error || '未知错误'));
        }
      } else {
        alert('激活失败：网络错误');
      }
    }
  };

  const handleRefreshShop = async () => {
    try {
      console.log('[前端] 刷新商店');
      const response = await axios.post(`${API_BASE_URL}/game/${sessionId}/shop/refresh`);
      console.log('[前端] 刷新商店成功:', {
        shopServants: response.data.gameState?.shopServants?.map(s => s.name).join(', '),
        saintQuartz: response.data.gameState?.saintQuartz
      });
      // 更新父组件状态
      if (onUpdate) {
        await onUpdate();
        console.log('[前端] 刷新商店后状态已更新');
      } else {
        console.error('[前端] onUpdate 未定义！');
      }
    } catch (error) {
      console.error('刷新商店失败:', error);
      if (error.response) {
        console.error('错误响应:', error.response.data);
        // 如果是400错误，说明刷新失败（圣晶石不足）
        if (error.response.status === 400) {
          alert('刷新失败：圣晶石不足');
        } else {
          alert('刷新失败：' + (error.response.data?.error || '未知错误'));
        }
      } else {
        alert('刷新失败：网络错误');
      }
    }
  };

  // 移除toggle功能，始终显示

  return (
    <div className="servant-manager">
      <div className="manager-header">
        <h3>从者管理</h3>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          商店
        </button>
        <button
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          仓库 ({gameState.inventoryServants.length})
        </button>
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          出战 ({gameState.activeServants.length}/5)
        </button>
      </div>

      <div className="servant-list">
        {activeTab === 'shop' && (
          <>
            {gameState.shopServants.length === 0 ? (
              <div className="empty-message">商店暂无从者</div>
            ) : (
              <>
                <div className="shop-servants-grid">
                  {gameState.shopServants.map(servant => (
                    <div key={servant.id} className="servant-card">
                      <img 
                        src={getServantImage(servant.id)} 
                        alt={servant.name}
                        className="servant-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const icon = e.target.nextSibling;
                          if (icon) icon.style.display = 'flex';
                        }}
                      />
                      <div className="servant-icon" style={{ display: 'none' }}>
                        {servant.name.charAt(0)}
                      </div>
                      <div className="servant-name">{servant.name}</div>
                      <div className="servant-price">
                        价格: {servant.price} 圣晶石
                      </div>
                      <div className="servant-effect">{servant.description || servant.effectType}</div>
                      <button
                        className="btn-buy"
                        onClick={() => handleBuyServant(servant.id)}
                        disabled={gameState.saintQuartz < servant.price}
                      >
                        购买
                      </button>
                    </div>
                  ))}
                </div>
                <div className="shop-footer">
                  <button
                    className="btn-refresh"
                    onClick={handleRefreshShop}
                    disabled={gameState.saintQuartz < 1}
                    title="花费1颗圣晶石刷新商店"
                  >
                    刷新商店 (1圣晶石)
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'inventory' && (
          <>
            {gameState.inventoryServants.length === 0 ? (
              <div className="empty-message">仓库为空</div>
            ) : (
              gameState.inventoryServants.map(servant => (
                <div key={servant.id} className="servant-card">
                  <img 
                    src={getServantImage(servant.id)} 
                    alt={servant.name}
                    className="servant-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const icon = e.target.nextSibling;
                      if (icon) icon.style.display = 'flex';
                    }}
                  />
                  <div className="servant-icon" style={{ display: 'none' }}>
                    {servant.name.charAt(0)}
                  </div>
                  <div className="servant-name">{servant.name}</div>
                  <div className="servant-effect">{servant.description || servant.effectType}</div>
                  <button
                    className="btn-activate"
                    onClick={() => handleActivateServant(servant.id)}
                    disabled={gameState.activeServants.length >= 5}
                  >
                    {gameState.activeServants.length >= 5 ? '出战栏已满' : '出战'}
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'active' && (
          <>
            {gameState.activeServants.length === 0 ? (
              <div className="empty-message">暂无出战从者</div>
            ) : (
              gameState.activeServants.map(servant => (
                <div key={servant.id} className="servant-card active">
                  <img 
                    src={getServantImage(servant.id)} 
                    alt={servant.name}
                    className="servant-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const icon = e.target.nextSibling;
                      if (icon) icon.style.display = 'flex';
                    }}
                  />
                  <div className="servant-icon" style={{ display: 'none' }}>
                    {servant.name.charAt(0)}
                  </div>
                  <div className="servant-name">{servant.name}</div>
                  <div className="servant-effect">{servant.description || servant.effectType}</div>
                  <div className="active-badge">已出战</div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ServantManager;
