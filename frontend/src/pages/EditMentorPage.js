import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from 'api';import { useParams, useNavigate, Link } from 'react-router-dom';

function EditMentorPage() {
  const { token } = useAuth();
  const { mentorId } = useParams(); // Get mentor ID from URL
  const navigate = useNavigate();
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mtsNumber: '',
    designation: ''
  });

  // 1. Fetch the mentor's current details when page loads
  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Call our new GET /api/users/mentor/:mentorId route
        const response = await api.get(`http://localhost:5000/api/.../api/.../api/users/mentor/${mentorId}`, config);
        setFormData(response.data); // Fill the form with current data
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch mentor details.');
        setLoading(false);
      }
    };
    fetchMentor();
  }, [token, mentorId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Handle the update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Call our new PUT /api/users/mentor/:mentorId route
      const response = await api.put(`http://localhost:5000/api/.../api/.../api/users/mentor/${mentorId}`, formData, config);
      
      setMessage(`Success! Mentor ${response.data.name} updated.`);
      setTimeout(() => navigate('/dashboard'), 1500); // Go back after 1.5s
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update mentor.');
    }
  };

  if (loading) {
    return (
      <div className="mlp loading">
        <div className="spin" />
      </div>
    )
  }

  return (
    <div className="mlp">
      <div className="container" style={{maxWidth: '700px'}}>
        <Link to="/dashboard" className="back">← Back to Dashboard</Link>
        <div className="panel" style={{marginTop: '16px'}}>
          <div className="panel-body">
            <form onSubmit={handleSubmit} className="form-card" style={{ background: 'transparent', padding: 0 }}>
              <h4 className="form-title">Edit Mentor Details</h4>
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
                  <label className="label">MTS Number</label>
                  <input type="text" name="mtsNumber" value={formData.mtsNumber} onChange={handleChange} className="input" required />
                </div>
                <div className="field">
                  <label className="label">Designation</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="input" required />
                </div>
              </div>
              <button type="submit" className="form-btn">Update Mentor</button>
              <div className="msg-wrap">
                {error && <p className="msg-err">{error}</p>}
                {message && <p className="msg-ok">{message}</p>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditMentorPage;