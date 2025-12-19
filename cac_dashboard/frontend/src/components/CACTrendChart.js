/**
 * CAC Trend Chart Component
 * Displays historical CAC trends using line chart
 */
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const CACTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h2>CAC Trend</h2>
        <p style={{ color: '#666', padding: '20px 0' }}>No data available</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    date: format(new Date(item.period_start), 'MMM dd, yyyy'),
    CAC: item.cac || 0,
    Expenses: item.total_expenses,
    Deals: item.total_deals,
  }));

  return (
    <div className="chart-container">
      <h2>CAC Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="CAC"
            stroke="#4CAF50"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Deals"
            stroke="#2196F3"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CACTrendChart;
