/**
 * Expense Breakdown Chart Component
 * Displays expense breakdown by category using pie chart
 */
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

const COLORS = {
  software: '#2196F3',
  salary: '#4CAF50',
  commission: '#FFC107',
  advertising: '#FF5722',
  agency: '#9C27B0',
  other: '#607D8B',
};

const ExpenseBreakdownChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="chart-container">
        <h2>Expense Breakdown</h2>
        <p style={{ color: '#666', padding: '20px 0' }}>No data available</p>
      </div>
    );
  }

  const chartData = Object.entries(data).map(([category, amount]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: amount,
  }));

  const formatCurrency = (value) => {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="chart-container">
      <h2>Expense Breakdown by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name.toLowerCase()] || COLORS.other}
              />
            ))}
          </Pie>
          <Tooltip formatter={formatCurrency} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseBreakdownChart;
