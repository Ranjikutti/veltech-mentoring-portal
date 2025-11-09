import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext'; // <-- GONE
import api from 'api';
import { Link } from 'react-router-dom'; // Make sure Link is imported

function MentorDashboard() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const { token } = useAuth(); // <-- GONE

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        // const config = { ... }; // <-- GONE

        // Talk to our backend API!
        // URL is short, 'config' is gone
        const response = await api.get('/students/my-mentees');
        
        setMentees(response.data); // Save the list of mentees
        setLoading(false);

      } catch (err) {
        setError('Failed to fetch mentees.');
        setLoading(false);
      }
    };

    fetchMentees();
  }, []); // Dependency array is now empty

  if (loading) return <div>Loading your mentees...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      {/* --- ADD THIS LINK/BUTTON --- */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/performance" style={{ textDecoration: 'none', padding: '10px 15px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '8px' }}>
          View Performance Report
        </Link>
      </div>
      {/* --- END OF ADDITION --- */}

      <h3>Your Mentees</h3>
      {mentees.length === 0 ? (
        <p>You have no mentees assigned yet.</p>
      ) : (
        <ul>
          {/* --- THIS IS THE UPDATED PART --- */}
          {mentees.map(mentee => (
            <li key={mentee._id}>
              {/* Each mentee is now a link to their details page */}
              <Link to={`/mentee/${mentee._id}`}>
                {mentee.name} ({mentee.registerNumber})
              </Link>
            </li>
          ))}
          {/* --- END OF UPDATE --- */}
        </ul>
      )}
    </div>
  );
}

export default MentorDashboard;