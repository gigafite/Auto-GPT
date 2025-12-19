/**
 * Deal Form Component
 * Form for adding new deals/customers
 */
import React, { useState } from 'react';
import { dealAPI } from '../services/api';

const DealForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    count: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
        count: parseInt(formData.count),
        date: new Date(formData.date).toISOString(),
      };

      await dealAPI.create(data);
      setMessage({ type: 'success', text: 'Deals added successfully!' });

      // Reset form
      setFormData({
        count: '',
        source: '',
        date: new Date().toISOString().split('T')[0],
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to add deals',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-section">
      <h2>Add Deals</h2>
      {message.text && (
        <div className={message.type}>{message.text}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="input-grid">
          <div className="form-group">
            <label>Number of Deals *</label>
            <input
              type="number"
              name="count"
              value={formData.count}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g., Google Ads, Referral, etc."
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
        </div>

        <div style={{ marginTop: '20px' }}>
          <button type="submit" className="btn btn-secondary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Deals'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DealForm;
