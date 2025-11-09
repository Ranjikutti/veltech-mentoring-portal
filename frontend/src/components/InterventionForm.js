import React, { useState } from 'react'; // <-- This line is now fixed
// import { useAuth } from '../context/AuthContext'; // <-- GONE
import api from 'api';

// This form takes the student's ID as a "prop"
function InterventionForm({ studentId, onInterventionAdded }) {
  // const { token } = useAuth(); // <-- GONE
  const [formData, setFormData] = useState({
    monthYear: 'Nov 2025',
    category: 'Slow learner',
    actionTaken: '',
    impact: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.actionTaken || !formData.impact) {
      setError('Please fill out both Action Taken and Impact.');
      return;
    }

    try {
      // const config = { ... }; // <-- GONE

      // Call our 'POST /api/interventions' route!
      const body = {
        studentId: studentId,
        monthYear: formData.monthYear,
        category: formData.category,
        actionTaken: formData.actionTaken,
        impact: formData.impact
      };

      // URL is short, 'config' is gone
      await api.post('/interventions', body);

      setMessage('Success! Intervention log saved.');
      // Tell the parent page to refresh its data
      onInterventionAdded();
      // Clear the form
      setFormData({
        ...formData,
        actionTaken: '',
        impact: ''
      });

    } catch (err) {
      setError('Failed to save intervention.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '2px solid green', padding: '10px', marginTop: '15px' }}>
      <h4>Add Intervention (Sheet 2)</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div>
        <label>Month/Year: </label>
        <input type="text" name="monthYear" value={formData.monthYear} onChange={handleChange} />
      </div>
      <div>
        <label>Category: </label>
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="Slow learner">Slow learner</option>
          <option value="Fast learner">Fast learner</option>
        </select>
      </div>
      <div>
        <label>Action Taken: </label>
        <textarea name="actionTaken" value={formData.actionTaken} onChange={handleChange} />
      </div>
      <div>
        <label>Impact: </label>
        <textarea name="impact" value={formData.impact} onChange={handleChange} />
      </div>

      <button type="submit">Save Intervention</button>
    </form>
  );
}

export default InterventionForm;