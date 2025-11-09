import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from 'api';
import { Link } from 'react-router-dom';

import AddMentorForm from './AddMentorForm';
import AddStudentForm from './AddStudentForm';

function HodDashboard() {
  const { user } = useAuth(); // No 'token' needed, 'user' is kept
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  // Function to fetch mentors
  const getMentors = async () => {
    setLoading(true);
    setError('');
    setMentors([]);

    try {
      // const config = { ... }; // <-- GONE
      // URL is short, 'config' is gone
      const response = await api.get('/users/mentors');
      setMentors(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch mentors.');
      setLoading(false);
    }
  };
  
  // Function to delete a mentor
  const handleDeleteMentor = async (mentorId, mentorName) => {
    const confirmDelete = window.prompt(`Type the mentor's name to delete: "${mentorName}"`);
    if (confirmDelete !== mentorName) {
      alert('Name did not match. Deletion cancelled.');
      return;
    }
    try {
      // const config = { ... }; // <-- GONE
      // URL is short, 'config' is gone
      await api.delete(`/users/mentor/${mentorId}`);
      setMentors(mentors.filter(mentor => mentor._id !== mentorId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete mentor.');
    }
  }

  return (
    <div>
      <h3 className="card-title" style={{margin: 0, fontSize: '18px'}}>HOD Dashboard</h3>
      <p className="muted" style={{margin: '4px 0 16px 0'}}>Your Department: {user.department}</p>
      
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, .1)', paddingBottom: '16px' }}>
        <button onClick={getMentors} className="form-btn" style={{ margin: 0, background: '#0ea5e9' }}>
          View All Mentors
        </button>
        <button onClick={() => setShowAddMentor(!showAddMentor)} className="form-btn" style={{ margin: 0, background: '#10b981' }}>
          {showAddMentor ? 'Close Form' : 'Add New Mentor'}
        </button>
        <button onClick={() => setShowAddStudent(!showAddStudent)} className="form-btn" style={{ margin: 0, background: '#8b5cf6' }}>
          {showAddStudent ? 'Close Form' : 'Add New Student'}
        </button>
      </div>
      
      {showAddMentor && <AddMentorForm onMentorAdded={(newMentor) => {
        setMentors([...mentors, newMentor]);
        setShowAddMentor(false);
      }} />}
      
      {showAddStudent && <AddStudentForm onStudentAdded={(newStudent) => {
        setShowAddStudent(false);
      }} />}
      
      {loading && <p>Loading mentors...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div className="mentor-list" style={{marginTop: '16px'}}>
        {mentors.map(mentor => (
          <div key={mentor._id} 
               className="card" 
               style={{ background: 'rgba(2, 6, 23, .45)', padding: '14px', margin: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            {/* Mentor Card Link */}
            <Link to={`/mentor/${mentor._id}`} style={{ textDecoration: 'none', color: 'white', flexGrow: 1 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>{mentor.name}</h4>
                <p className="muted" style={{ margin: '4px 0 0 0', fontSize: '12px' }}>{mentor.designation} ({mentor.mtsNumber})</p>
              </div>
            </Link>
            
            <div style={{display: 'flex', gap: '8px'}}>
              {/* --- NEW: EDIT BUTTON --- */}
              <Link 
                to={`/mentor/${mentor._id}/edit`} 
                className="form-btn"
                style={{ background: '#f59e0b', margin: 0, padding: '8px 12px', fontSize: '12px', textDecoration: 'none' }}
              >
                Edit
              </Link>

              {/* Delete Mentor Button */}
              <button 
                onClick={() => handleDeleteMentor(mentor._id, mentor.name)}
                className="form-btn"
                style={{ background: '#dc2626', margin: 0, padding: '8px 12px', fontSize: '12px' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HodDashboard;