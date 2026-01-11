import React from 'react';
import { getSymbolImage } from '../utils/imagePaths';
import './SymbolProbabilityPanel.css';

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
  solomon: '所罗门（扣分）'
};

function SymbolProbabilityPanel({ probabilities }) {
  if (!probabilities || Object.keys(probabilities).length === 0) {
    return <div className="probability-panel">加载中...</div>;
  }

  return (
    <div className="probability-panel">
      <h3>图像概率与倍率</h3>
      <div className="symbol-list">
        {Object.entries(probabilities).map(([symbolId, data]) => (
          <div key={symbolId} className={`symbol-item ${data.isNegative ? 'negative' : ''}`}>
            <div className="symbol-header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src={getSymbolImage(symbolId)} 
                  alt={SYMBOL_NAMES[symbolId] || symbolId}
                  className="symbol-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="symbol-icon" style={{ display: 'none' }}>
                  {symbolId.charAt(0).toUpperCase()}
                </div>
                <span className="symbol-name">{SYMBOL_NAMES[symbolId] || symbolId}</span>
              </div>
              {data.isNegative && <span className="negative-badge">扣分</span>}
            </div>
            <div className="symbol-stats">
              <div className="stat-row">
                <span className="stat-label">概率:</span>
                <span className="stat-value">{(data.probability * 100).toFixed(2)}%</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">倍率:</span>
                <span className="stat-value">{data.value.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">权重:</span>
                <span className="stat-value">{data.weight.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SymbolProbabilityPanel;
