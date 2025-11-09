import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from 'api';

function AddStudentForm({ onStudentAdded }) {
  const { user } = useAuth(); // No 'token' needed, 'user' is kept
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    vmNumber: '',
    batch: '2023-2027',
    mentorMtsNumber: ''
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
      
      // We use the "create student" route we already built!
      const body = { ...formData, department: user.department };
      
      // URL is short, 'config' is gone
      const response = await api.post('/students', body);
      
      setMessage(`Success! Student ${response.data.name} created.`);
      if(onStudentAdded) {
        onStudentAdded(response.data); // We can use this later
      }
      // Clear the form
      setFormData({ name: '', registerNumber: '', vmNumber: '', batch: '2023-2027', mentorMtsNumber: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ background: 'rgba(2, 6, 23, .55)', marginTop: '16px' }}>
      <h4 className="form-title">Add New Student</h4>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label className="label">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
        </div>
        <div className="field">
          <label className="label">Register Number (e.g., 113123UG...)</label>
          <input type="text" name="registerNumber" value={formData.registerNumber} onChange={handleChange} className="input" required />
        </div>
        <div className="field">
          <label className="label">VM Number (e.g., 15894)</label>
          <input type="text" name="vmNumber" value={formData.vmNumber} onChange={handleChange} className="input" required />
        </div>
        <div className="field">
          <label className="label">Batch (e.g., 2023-2027)</label>
          <input type="text" name="batch" value={formData.batch} onChange={handleChange} className="input" required />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="label">Mentor's MTS Number (e.g., mts002)</label>
          <input type="text" name="mentorMtsNumber" value={formData.mentorMtsNumber} onChange={handleChange} className="input" required />
        </div>
      </div>
      <button type="submit" className="form-btn">Add Student</button>
      <div className="msg-wrap">
        {error && <p className="msg-err">{error}</p>}
        {message && <p className="msg-ok">{message}</p>}
      </div>
    </form>
  );
}

export default AddStudentForm;