import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext'; // <-- GONE (not needed)
import api from 'api';

function HodMentorSwitch({ studentId, currentMentorId, onMentorSwitched }) {
  // const { token } = useAuth(); // <-- GONE
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(currentMentorId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 1. Fetch all mentors in the HOD's department
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        // const config = { ... }; // <-- GONE
        
        // URL is short, 'config' is gone
        const response = await api.get('/users/mentors');
        setMentors(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load mentors list.');
        setLoading(false);
      }
    };
    fetchMentors();
  }, []); // Dependency array is now empty

  // 2. Handle the "Re-assign" button click
  const handleSwitch = async () => {
    if (selectedMentor === currentMentorId) {
      setError('This student is already assigned to this mentor.');
      return;
    }
    setError('');
    setMessage('');

    try {
      // const config = { ... }; // <-- GGONE
      const body = { newMentorId: selectedMentor };
      
      // URL is short, 'config' is gone
      await api.put(`/students/${studentId}/assign-mentor`, body);
      
      setMessage('Mentor successfully reassigned!');
      if (onMentorSwitched) {
        onMentorSwitched();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reassign mentor.');
    }
  };

  if (loading) return <p>Loading mentor list...</p>;

  return (
    <div className="form-card" style={{ background: 'rgba(239, 68, 68, .08)', border: '1px solid rgba(239, 68, 68, .4)' }}>
      {/* Styles are now in index.css */}
      <h4 className="form-title" style={{ color: '#f87171' }}>HOD Admin: Re-assign Mentor</h4>
      <div className="field">
        <label className="label">Assign to New Mentor:</label>
        <select 
          value={selectedMentor}
          onChange={(e) => setSelectedMentor(e.target.value)}
          className="input select"
        >
          {mentors.map(mentor => (
            <option key={mentor._id} value={mentor._id}>
              {mentor.name} ({mentor.mtsNumber})
            </option>
          ))}
        </select>
      </div>
      <button 
        onClick={handleSwitch} 
        className="form-btn" 
        style={{ background: '#dc2626', boxShadow: '0 8px 25px rgba(220, 38, 38, .25)' }}
      >
        Re-Assign Mentor
      </button>
      <div className="msg-wrap">
        {error && <p className="msg-err">{error}</p>}
        {message && <p className="msg-ok">{message}</p>}
      </div>
    </div>
  );
}

export default HodMentorSwitch;