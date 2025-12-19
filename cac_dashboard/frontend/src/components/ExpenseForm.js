/**
 * Expense Form Component
 * Form for adding new expenses
 */
import React, { useState } from 'react';
import { expenseAPI } from '../services/api';

const ExpenseForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    category: 'advertising',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    { value: 'software', label: 'Software' },
    { value: 'salary', label: 'Salary' },
    { value: 'commission', label: 'Commission' },
    { value: 'advertising', label: 'Advertising' },
    { value: 'agency', label: 'Agency' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
      };

      await expenseAPI.create(data);
      setMessage({ type: 'success', text: 'Expense added successfully!' });

      // Reset form
      setFormData({
        category: 'advertising',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to add expense',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-section">
      <h2>Add Expense</h2>
      {message.text && (
        <div className={message.type}>{message.text}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="input-grid">
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount ($) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description"
            />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
