import React from 'react';
import './EventSelector.css';

function EventSelector({ events, onSelect }) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="event-selector-overlay">
      <div className="event-selector-modal">
        <h2>选择事件</h2>
        <p className="event-hint">每轮开始前，选择一个事件来增强你的游戏体验</p>
        <div className="events-list">
          {events.map((event, index) => (
            <div
              key={index}
              className="event-card"
              onClick={() => onSelect(index)}
            >
              <div className="event-type-badge">
                {event.type === 'increase_weight' && '📈 概率提升'}
                {event.type === 'increase_value' && '💰 倍率提升'}
                {event.type === 'full_pattern_reward' && '🎯 全满奖励'}
              </div>
              <div className="event-symbol">{event.symbolName}</div>
              <div className="event-description">{event.description}</div>
              <button className="btn-select-event">选择此事件</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventSelector;
