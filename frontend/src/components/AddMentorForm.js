import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext'; // <-- GONE (not needed)
import api from 'api';

function AddMentorForm({ onMentorAdded }) {
  // const { token } = useAuth(); // <-- GONE
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mtsNumber: '',
    designation: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      // const config = { ... }; // <-- GONE
      
      // Call our new "create-mentor" route
      // URL is short, 'config' is gone.
      const response = await api.post('/users/create-mentor', formData);
      
      setMessage(`Success! Mentor ${response.data.name} created.`);
      onMentorAdded(response.data); // Send the new mentor up to the dashboard
      // Clear the form
      setFormData({ name: '', email: '', mtsNumber: '', designation: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create mentor.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ background: 'rgba(2, 6, 23, .55)', marginTop: '16px' }}>
      <h4 className="form-title">Add New Mentor</h4>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label className="label">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
        </div>
        <div className="field">
          <label className="label">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required />
        </div>
        <div className="field">
          <label className="label">MTS Number (e.g., mts003)</label>
          <input type="text" name="mtsNumber" value={formData.mtsNumber} onChange={handleChange} className="input" required />
        </div>
        <div className="field">
          <label className="label">Designation</label>
          <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="input" required />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="label">Initial Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="input" required />
        </div>
      </div>
      <button type="submit" className="form-btn">Add Mentor</button>
      <div className="msg-wrap">
        {error && <p className="msg-err">{error}</p>}
        {message && <p className="msg-ok">{message}</p>}
      </div>
    </form>
  );
}

export default AddMentorForm;