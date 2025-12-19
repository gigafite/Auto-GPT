/**
 * Metric Card Component
 * Displays a single metric with value and change percentage
 */
import React from 'react';

const MetricCard = ({ title, value, change, prefix = '', suffix = '' }) => {
  const getChangeClass = () => {
    if (!change) return 'neutral';
    return change > 0 ? 'positive' : 'negative';
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'number') {
      return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return val;
  };

  const formatChange = (val) => {
    if (val === null || val === undefined) return '';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}% from last period`;
  };

  return (
    <div className="metric-card">
      <h3>{title}</h3>
      <div className="metric-value">
        {prefix}{formatValue(value)}{suffix}
      </div>
      {change !== null && change !== undefined && (
        <div className={`metric-change ${getChangeClass()}`}>
          {formatChange(change)}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
