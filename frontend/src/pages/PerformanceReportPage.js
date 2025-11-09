import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from 'api';import { Link } from 'react-router-dom';

function PerformanceReportPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        // Call the API we just tested!
        const response = await api.get('http://localhost:5000/api/.../api/.../api/assessments/mentor/performance', config);
        setReportData(response.data); // Save the ranked list
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch performance report.');
        setLoading(false);
      }
    };
    fetchReport();
  }, [token]);

  if (loading) {
    return (
      <div className="prp-wrap loading">
        {/* All styles have been moved to index.css */}
        <div className="spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="prp error">
        {/* All styles have been moved to index.css */}
        <div className="err">{error}</div>
      </div>
    );
  }

  return (
    <div className="prp">
      {/* All styles have been moved to index.css */}
      <div className="container">
        <Link to="/dashboard" className="back">← Back to Dashboard</Link>

        <div className="header">
          <h3 className="title">Mentees Performance Report</h3>
          <p className="subtitle">Students are ranked by total score from their latest assessment.</p>
        </div>

        {error && <div className="err">{error}</div>}

        {reportData.length === 0 && !error ? (
          <div className="empty">No performance data found for any mentees.</div>
        ) : (
          <ol className="list">
            {reportData.map((student, index) => (
              <li key={student.studentId} className="item" style={{ animationDelay: `${index * 0.03}s` }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="item-rank">#{index + 1}</span>
                  <div>
                    <p className="item-name">{student.name}</p>
                    <p className="item-sub">Reg No: {student.registerNumber} | Latest: {student.academicYear}</p>
                  </div>
                </div>
                <div className="item-score-wrap">
                  <div className="item-score-val">{student.totalScore}</div>
                  <div className="item-score-label">Total Score</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default PerformanceReportPage;