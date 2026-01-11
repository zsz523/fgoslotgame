import React from 'react';
import './TurnSelector.css';

function TurnSelector({ level, quantum, onSelect }) {
  const cheapCost = 3000 * level;
  const expensiveCost = 7000 * level;
  const canAffordCheap = quantum >= cheapCost;
  const canAffordExpensive = quantum >= expensiveCost;

  return (
    <div className="turn-selector">
      <h3>选择回合操作</h3>
      <div className="options">
        <div className={`option ${!canAffordCheap ? 'disabled' : ''}`}>
          <div className="option-header">
            <h4>经济版</h4>
            <div className="cost">成本: {cheapCost.toLocaleString()} 量子</div>
          </div>
          <div className="option-rewards">
            <div className="reward-item">3次老虎机机会</div>
            <div className="reward-item">2颗圣晶石</div>
          </div>
          <button
            className="btn-select"
            onClick={() => onSelect('cheap')}
            disabled={!canAffordCheap}
          >
            {canAffordCheap ? '选择' : '量子不足'}
          </button>
        </div>

        <div className={`option ${!canAffordExpensive ? 'disabled' : ''}`}>
          <div className="option-header">
            <h4>豪华版</h4>
            <div className="cost">成本: {expensiveCost.toLocaleString()} 量子</div>
          </div>
          <div className="option-rewards">
            <div className="reward-item">7次老虎机机会</div>
            <div className="reward-item">1颗圣晶石</div>
          </div>
          <button
            className="btn-select"
            onClick={() => onSelect('expensive')}
            disabled={!canAffordExpensive}
          >
            {canAffordExpensive ? '选择' : '量子不足'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TurnSelector;
