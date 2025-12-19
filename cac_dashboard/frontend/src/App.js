/**
 * Main App Component
 * CAC Dashboard Application
 */
import React, { useState, useEffect } from 'react';
import MetricCard from './components/MetricCard';
import ExpenseForm from './components/ExpenseForm';
import DealForm from './components/DealForm';
import CACTrendChart from './components/CACTrendChart';
import ExpenseBreakdownChart from './components/ExpenseBreakdownChart';
import { analyticsAPI } from './services/api';
import './styles/App.css';

function App() {
  const [periodType, setPeriodType] = useState('monthly');
  const [dashboardData, setDashboardData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardRes, trendRes, breakdownRes] = await Promise.all([
        analyticsAPI.getDashboardSummary(periodType),
        analyticsAPI.getTrends(periodType, 12),
        analyticsAPI.getExpenseBreakdown(periodType),
      ]);

      setDashboardData(dashboardRes.data);
      setTrendData(trendRes.data);
      setExpenseBreakdown(breakdownRes.data.breakdown);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [periodType]);

  const handleDataUpdate = () => {
    fetchDashboardData();
  };

  if (loading && !dashboardData) {
    return <div className="App"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="App">
      <div className="header">
        <h1>CAC Dashboard</h1>
        <p>Track your Customer Acquisition Cost and marketing performance</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="period-selector">
        {periods.map(period => (
          <button
            key={period.value}
            className={periodType === period.value ? 'active' : ''}
            onClick={() => setPeriodType(period.value)}
          >
            {period.label}
          </button>
        ))}
      </div>

      {dashboardData && (
        <>
          <div className="dashboard-grid">
            <MetricCard
              title="Current CAC"
              value={dashboardData.current_period_cac}
              change={dashboardData.cac_change_percentage}
              prefix="$"
            />
            <MetricCard
              title="Total Expenses"
              value={dashboardData.total_expenses_current_period}
              prefix="$"
            />
            <MetricCard
              title="Total Deals"
              value={dashboardData.total_deals_current_period}
            />
            <MetricCard
              title="Previous CAC"
              value={dashboardData.previous_period_cac}
              prefix="$"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            <CACTrendChart data={trendData} />
            <ExpenseBreakdownChart data={expenseBreakdown} />
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <ExpenseForm onSuccess={handleDataUpdate} />
        <DealForm onSuccess={handleDataUpdate} />
      </div>
    </div>
  );
}

export default App;
