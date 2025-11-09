import React, { useState, useEffect, useCallback } from 'react' // Import useCallback
import { useParams, Link } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext' // <-- GONE (not needed)
import api from 'api';

function MenteeListPage() {
  const [mentees, setMentees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { mentorId } = useParams()
  // const { token } = useAuth() // <-- GONE

  // --- FIX 1: Wrap fetchMentees in useCallback ---
  // This tells React this function only needs to change if 'mentorId' changes.
  const fetchMentees = useCallback(async () => {
      setLoading(true);
      try {
        // const config = { ... }; // <-- GONE
        // URL is short, 'config' is gone
        const response = await api.get(`/students/mentor/${mentorId}`)
        setMentees(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch mentees for this mentor.')
        setLoading(false)
      }
    }, [mentorId]); // <-- The dependency for useCallback

  // --- FIX 2: Update useEffect ---
  // Now it correctly depends on 'fetchMentees'.
  // It will only run when fetchMentees is (re)created.
  useEffect(() => {
    fetchMentees()
  }, [fetchMentees]); 

  // --- NEW: Handle Delete Function (Also cleaned up) ---
  const handleDelete = async (studentId, studentName) => {
    const confirmDelete = window.prompt(`Type the student's name to delete: "${studentName}"`);
    if (confirmDelete !== studentName) {
      alert('Name did not match. Deletion cancelled.');
      return;
    }

    try {
      // const config = { ... }; // <-- GONE
      
      // URL is short, 'config' is gone
      await api.delete(`/students/${studentId}`);
      
      // Update the UI by removing the deleted mentee from the list
      setMentees(mentees.filter(mentee => mentee._id !== studentId));

    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student.');
    }
  }
  // --- END OF NEW FUNCTION ---


  if (loading) {
    return (
      <div className="mlp loading">
        {/* All styles are in index.css */}
        <div className="spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mlp error">
        {/* All styles are in index.css */}
        <div className="err">{error}</div>
      </div>
    )
  }

  return (
    <div className="mlp">
      {/* All styles are in index.css */}
      <div className="container">
        <Link to="/dashboard" className="back">← Back to Dashboard</Link>

        <div className="header">
          <h3 className="title">Mentees for this Mentor</h3>
          <span className="meta">Mentor ID: {mentorId}</span>
        </div>

        <div className="panel">
          <div className="panel-body">
            {mentees.length === 0 ? (
              <div className="empty">This mentor has no mentees assigned.</div>
            ) : (
              <ul className="grid" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {mentees.map((mentee, i) => (
                  <li key={mentee._id} 
                      className="card" 
                      style={{ animationDelay: `${i * 0.03}s`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    {/* Mentee name is now a Link */}
                    <Link to={`/mentee/${mentee._id}`} style={{ textDecoration: 'none', flexGrow: 1 }}>
                      <div>
                        <p className="name">{mentee.name}</p>
                        <p className="sub">{mentee.registerNumber}</p>
                      </div>
                    </Link>
                    
                    {/* --- NEW: Delete Button --- */}
                    <button 
                      onClick={() => handleDelete(mentee._id, mentee.name)}
                      className="form-btn"
                      style={{ background: '#dc2626', width: '100%', marginTop: '10px', padding: '8px 12px', fontSize: '12px' }}
                    >
                      Delete Mentee
                    </button>
                    {/* --- END OF NEW BUTTON --- */}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenteeListPage