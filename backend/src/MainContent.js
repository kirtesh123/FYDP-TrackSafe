import React from 'react';
import './MainContent.css';

function MainContent() {
  return (
    <div className="main-content">
      <div className="gauge-container">
        <svg viewBox="0 0 100 50" className="gauge">
          {/* Segments */}
          <path d="M10 50 A40 40 0 0 1 30 10 L50 50 Z" fill="#ff0000" />
          <path d="M30 10 A40 40 0 0 1 50 10 L50 50 Z" fill="#ff7f50" />
          <path d="M50 10 A40 40 0 0 1 70 10 L50 50 Z" fill="#ffd700" />
          <path d="M70 10 A40 40 0 0 1 90 50 L50 50 Z" fill="#adff2f" />
          <path d="M90 50 A40 40 0 0 1 10 50 L50 50 Z" fill="#1e90ff" />
          {/* Inner white semi-circle */}
          <path d="M10 50 A40 40 0 0 1 90 50 L90 50 A30 30 0 0 0 10 50 Z" fill="#fff" />
          {/* Labels */}
          <text x="10" y="48" textAnchor="middle" fontSize="3" fill="#000">Poor</text>
          <text x="10" y="45" textAnchor="middle" fontSize="2" fill="#000">300-559</text>
          <text x="30" y="25" textAnchor="middle" fontSize="3" fill="#000">Fair</text>
          <text x="30" y="28" textAnchor="middle" fontSize="2" fill="#000">560-659</text>
          <text x="50" y="12" textAnchor="middle" fontSize="3" fill="#000">Good</text>
          <text x="50" y="15" textAnchor="middle" fontSize="2" fill="#000">660-724</text>
          <text x="70" y="25" textAnchor="middle" fontSize="3" fill="#000">Very Good</text>
          <text x="70" y="28" textAnchor="middle" fontSize="2" fill="#000">725-759</text>
          <text x="90" y="48" textAnchor="middle" fontSize="3" fill="#000">Excellent</text>
          <text x="90" y="45" textAnchor="middle" fontSize="2" fill="#000">760-900</text>
          {/* Pointer */}
          <line x1="50" y1="50" x2="50" y2="15" stroke="#000" strokeWidth="1" />
          <circle cx="50" cy="50" r="2" fill="#000" />
        </svg>
        <div className="score">
          <div className="score-number">750 - 850</div>
          <div className="score-label">Excellent</div>
        </div>
      </div>
    </div>
  );
}

export default MainContent;
