import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from 'api';
import AssessmentForm from '../components/AssessmentForm'
import InterventionForm from '../components/InterventionForm'
import HodMentorSwitch from '../components/HodMentorSwitch'

function MenteeDetailsPage() {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { studentId } = useParams()
  const { user } = useAuth()
  
  // State for Edit/Delete logic
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);

  const fetchStudentDetails = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get(`/students/${studentId}/details`)
      setStudent(response.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch student details.')
      setLoading(false)
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudentDetails()
  }, [fetchStudentDetails])

  const handleDeleteAssessment = async (assessmentId) => {
    if (window.confirm('Are you sure you want to delete this assessment record?')) {
      try {
        await api.delete(`/assessments/${assessmentId}`);
        fetchStudentDetails(); 
      } catch (err) {
        alert('Failed to delete assessment.');
      }
    }
  }
  
  const handleAddNewClick = () => {
    setEditingAssessment(null); 
    setShowAssessmentForm(true); 
  }

  const handleEditClick = (assessment) => {
    setEditingAssessment(assessment); 
    setShowAssessmentForm(true); 
  }

  const handleFormSave = () => {
    setShowAssessmentForm(false); 
    fetchStudentDetails(); 
  }

  const handleFormCancel = () => {
    setShowAssessmentForm(false); 
  }

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

  // --- THIS IS THE CRASH FIX ---
  // We make the check stronger. We check for student AND student.profile.
  if (!student || !student.profile) {
  // -----------------------------
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

        {user && user.role === 'hod' && (
          <div className="section" style={{marginTop: '18px', background: 'rgba(239, 68, 68, .08)', border: '1px solid rgba(239, 68, 68, .4)'}}>
            <HodMentorSwitch 
              studentId={student.profile._id}
              currentMentorId={student.profile.currentMentor}
              onMentorSwitched={fetchStudentDetails}
            />
          </div>
        )}

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
            <div className="card-head" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Assessment Data<span className="chip">Sheet 1</span></h3>
              {!showAssessmentForm && (
                <button onClick={handleAddNewClick} className="form-btn" style={{ margin: 0, fontSize: 12, padding: '6px 10px', background: '#10b981' }}>
                  Add New
                </button>
              )}
            </div>
            <div className="card-body">
              {showAssessmentForm ? (
                <div style={{ marginBottom: 16 }}>
                  <AssessmentForm 
                    studentId={studentId} 
                    assessmentToEdit={editingAssessment}
                    onAssessmentAdded={handleFormSave}
                    onCancel={handleFormCancel}
                  />
                </div>
              ) : (
                student.assessments.length === 0 && <div className="muted">No assessment data found.</div>
              )}
              
              {!showAssessmentForm && student.assessments.length > 0 && (
                <div className="two-col">
                  {student.assessments.map(ass => (
                    <div key={ass._id} className="item">
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                        <strong>{ass.academicYear}</strong>
                        <span className="chip">CGPA {ass.cgpa}</span>
                      </div>
                      <div className="muted">Attendance: {ass.attendancePercent}%</div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button onClick={() => handleEditClick(ass)} className="form-btn" style={{ margin: 0, fontSize: 12, padding: '4px 8px', background: '#f59e0b' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteAssessment(ass._id)} className="form-btn" style={{ margin: 0, fontSize: 12, padding: '4px 8px', background: '#dc2626' }}>
                          Delete
                        </button>
                      </div>
                      
                    </div>
                  ))}
                </div>
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