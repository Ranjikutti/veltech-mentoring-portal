import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from 'api';import AssessmentForm from '../components/AssessmentForm'
import InterventionForm from '../components/InterventionForm'
import HodMentorSwitch from '../components/HodMentorSwitch' // Import the switch

function MenteeDetailsPage() {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { studentId } = useParams()
  const { token, user } = useAuth() // Get the logged-in user

  const fetchStudentDetails = useCallback(async () => {
    setLoading(true)
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const response = await api.get(`http://localhost:5000/api/.../api/.../api/students/${studentId}/details`, config)
      setStudent(response.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch student details.')
      setLoading(false)
    }
  }, [token, studentId])

  useEffect(() => {
    fetchStudentDetails()
  }, [fetchStudentDetails])

  if (loading) {
    return (
      <div className="mdp-wrap loading">
        <div className="spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mdp-wrap error">
        <div className="err">{error}</div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="mdp-wrap empty">
        <div className="box">No student data found.</div>
      </div>
    )
  }

  return (
    <div className="mdp">
      <div className="container">
        <Link to="/dashboard" className="back">← Back to Dashboard</Link>

        {/* --- This is the correct place for the HOD Admin box --- */}
        {user && user.role === 'hod' && (
          <div className="section" style={{marginTop: '18px', background: 'rgba(239, 68, 68, .08)', border: '1px solid rgba(239, 68, 68, .4)'}}>
            <HodMentorSwitch 
              studentId={student.profile._id}
              currentMentorId={student.profile.currentMentor}
              onMentorSwitched={fetchStudentDetails}
            />
          </div>
        )}
        {/* --- END OF HOD SECTION --- */}

        <div className="grid">
          <div className="card">
            <div className="card-head">
              <h3 className="card-title">Profile</h3>
            </div>
            <div className="card-body">
              <h2 className="profile-name">{student.profile.name}</h2>
              <p className="meta">Register No: {student.profile.registerNumber}</p>
              <p className="meta">VM No: {student.profile.vmNumber}</p>
              <p className="meta">Department: {student.profile.department}</p>
            </div>
          </div>

          <div className="section">
            <div className="card-head">
              <h3 className="card-title">Assessment Data<span className="chip">Sheet 1</span></h3>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <AssessmentForm studentId={studentId} onAssessmentAdded={fetchStudentDetails} />
              </div>
              {student.assessments.length > 0 ? (
                <div className="two-col">
                  {student.assessments.map(ass => (
                    <div key={ass._id} className="item">
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                        <strong>{ass.academicYear}</strong>
                        <span className="chip">CGPA {ass.cgpa}</span>
                      </div>
                      <div className="muted">Attendance: {ass.attendancePercent}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="muted">No assessment data found.</div>
              )}
            </div>
          </div>

          <div className="section" style={{ gridColumn: '1 / -1' }}>
            <div className="card-head">
              <h3 className="card-title">Intervention Log<span className="chip">Sheet 2</span></h3>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <InterventionForm studentId={studentId} onInterventionAdded={fetchStudentDetails} />
              </div>
              {student.interventions.length > 0 ? (
                <div className="two-col">
                  {student.interventions.map(int => (
                    <div key={int._id} className="item">
                      <strong>{int.monthYear} ({int.category})</strong>
                      <p className="muted" style={{ marginTop:6 }}><span style={{ fontWeight:700, color:'#fff' }}>Action:</span> {int.actionTaken}</p>
                      <p className="muted"><span style={{ fontWeight:700, color:'#fff' }}>Impact:</span> {int.impact}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="muted">No intervention data found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenteeDetailsPage