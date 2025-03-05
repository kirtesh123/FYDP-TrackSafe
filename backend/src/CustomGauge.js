import React, { lazy, Suspense } from 'react';
import './MainContent.css'; // Ensure this file contains necessary styles

// Dynamically import GaugeComponent with SSR disabled
const GaugeComponent = lazy(() => import('react-gauge-component'));

const CustomGauge = ({ driveScore }) => {
  return (
    <div className="gauge-container">
      <Suspense fallback={<div>Loading...</div>}>
        <GaugeComponent
          value={driveScore}
          type="radial"
          minValue={300}
          maxValue={900}
          labels={{
            tickLabels: {
              type: 'inner',
              ticks: [
                { value: 300 },
                { value: 420 },
                { value: 540 },
                { value: 660 },
                { value: 780 },
                { value: 900 },
              ],
              defaultTickValueConfig: {
                style: { fill: 'black', color: 'black'},
              },
              defaultTickLineConfig: {
                color: 'black',
              }
            },
            valueLabel: {
              formatTextValue: (value) => `${value}`,
              style: { fill: 'black', color: 'black' },
            }
          }}
          arc={{
            colorArray: ['#EA4228', '#F5CD19', '#5BE12C'],
            subArcs: [{ limit: 420 }, { limit: 540 }, { limit: 660 }, { limit: 780 }, { limit: 900 }],
            padding: 0.02,
            width: 0.3,
          }}
          pointer={{
            elastic: true,
            animationDelay: 0,
          }}
        />
        <div className="score-label">{getScoreLabel(driveScore)}</div>
        </Suspense>
    </div>
  );
};

function getScoreLabel(score) {
  if (score < 420) return 'Poor';
  if (score < 540) return 'Fair';
  if (score < 660) return 'Good';
  if (score < 780) return 'Very Good';
  return 'Excellent';
}

export default CustomGauge;
