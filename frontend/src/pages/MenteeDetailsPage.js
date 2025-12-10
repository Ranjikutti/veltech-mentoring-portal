// --- Final Build ---
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from 'api';
import AssessmentForm from '../components/AssessmentForm'
import InterventionForm from '../components/InterventionForm'
import HodMentorSwitch from '../components/HodMentorSwitch'

// NEW IMPORTS FOR NEW SECTIONS
import AcademicLogSection from '../components/AcademicLogSection'
import ActivityLogSection from '../components/ActivityLogSection'

// --- 1. NEW IMPORTS FOR PDF ---
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
// -----------------------------

function MenteeDetailsPage() {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { studentId } = useParams()
  const { user } = useAuth()
  
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);

  const [editingIntervention, setEditingIntervention] = useState(null);
  const [showInterventionForm, setShowInterventionForm] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const fetchStudentDetails = useCallback(async () => {
    if (!student) setLoading(true);
    try {
      const res = await api.get(`/students/${studentId}/details`)
      setStudent(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch student details.')
      setLoading(false)
    }
  }, [studentId, student]);

  useEffect(() => {
    if (!student) fetchStudentDetails()
  }, [fetchStudentDetails, student]);

  // ===== Assessment Functions =====
  const handleDeleteAssessment = async (assessmentId) => {
    if (window.confirm('Are you sure you want to delete this assessment record?')) {
      try {
        await api.delete(`/assessments/${assessmentId}`);
        fetchStudentDetails();
      } catch {
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

  const handleFormCancel = () => setShowAssessmentForm(false);

  // ===== Intervention Functions =====
  const handleDeleteIntervention = async (interventionId) => {
    if (window.confirm('Are you sure you want to delete this intervention log?')) {
      try {
        await api.delete(`/interventions/${interventionId}`);
        fetchStudentDetails();
      } catch {
        alert('Failed to delete intervention.');
      }
    }
  }

  const handleAddNewInterventionClick = () => {
    setEditingIntervention(null);
    setShowInterventionForm(true);
  }

  const handleEditInterventionClick = (data) => {
    setEditingIntervention(data);
    setShowInterventionForm(true);
  }

  const handleInterventionFormSave = () => {
    setShowInterventionForm(false);
    fetchStudentDetails();
  }
  
  const handleInterventionFormCancel = () => setShowInterventionForm(false);

  // === PDF FUNCTION (UNCHANGED) ===
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(`/assessments/report/${studentId}`);
      const { studentProfile, mentorName, kpiTotals, finalScores } = response.data;
      const doc = new jsPDF();
      // ... (your PDF code unchanged)
      doc.save(`Mentoring_Report_${studentProfile.name}.pdf`);
    } catch (err) {
      alert('Failed to download report.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Guards
  if (loading && !student) {
    return <div className="mdp-wrap loading"><div className="spin" /></div>
  }
  if (error) {
    return <div className="mdp-wrap error"><div className="err">{error}</div></div>
  }
  if (!student || !student.profile) {
    return <div className="mdp-wrap empty"><div className="box">No student data found.</div></div>
  }

  // ===== MAIN RENDER =====
  return (
    <div className="mdp">
      <div className="container">
        <Link to="/dashboard" className="back">← Back to Dashboard</Link>

        {user?.role === 'hod' && (
          <div className="section" style={{marginTop: 18, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.4)'}}>
            <HodMentorSwitch 
              studentId={student.profile._id}
              currentMentorId={student.profile.currentMentor}
              onMentorSwitched={fetchStudentDetails}
            />
          </div>
        )}

        <div className="grid">

          {/* ===== PROFILE CARD ===== */}
          <div className="card">
            <div className="card-head" style={{ justifyContent:'space-between' }}>
              <h3 className="card-title">Profile</h3>
              <button 
                onClick={handleDownloadReport}
                className="form-btn"
                style={{background:'#0ea5e9', fontSize:12}}
                disabled={isDownloading}
              >
                {isDownloading ? 'Downloading...' : 'Download Report'}
              </button>
            </div>
            <div className="card-body">
              <h2 className="profile-name">{student.profile.name}</h2>
              <p className="meta">Register No: {student.profile.registerNumber}</p>
              <p className="meta">VM No: {student.profile.vmNumber}</p>
              <p className="meta">Department: {student.profile.department}</p>
            </div>
          </div>

          {/* ===== ASSESSMENT SECTION ===== */}
          <div className="section">
            <div className="card-head" style={{ justifyContent:'space-between' }}>
              <h3 className="card-title">Assessment Data <span className="chip">Sheet 1</span></h3>
              {!showAssessmentForm && (
                <button onClick={handleAddNewClick} className="form-btn" style={{background:'#10b981'}}>
                  Add New
                </button>
              )}
            </div>

            <div className="card-body">
              {showAssessmentForm ? (
                <AssessmentForm 
                  studentId={studentId}
                  assessmentToEdit={editingAssessment}
                  onAssessmentAdded={handleFormSave}
                  onCancel={handleFormCancel}
                />
              ) : (
                student.assessments.length === 0 && <div className="muted">No assessment data found.</div>
              )}

              {!showAssessmentForm && student.assessments.length > 0 && (
                <div className="two-col">
                  {student.assessments.map(ass => (
                    <div key={ass._id} className="item">
                      <strong>{ass.academicYear}</strong>
                      <div className="muted">Attendance: {ass.attendancePercent}%</div>
                      <div style={{display:'flex', gap:8, marginTop:8}}>
                        <button 
                          onClick={() => handleEditClick(ass)} 
                          className="form-btn" 
                          style={{background:'#f59e0b'}}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteAssessment(ass._id)} 
                          className="form-btn"
                          style={{background:'#dc2626'}}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ===== INTERVENTION SECTION ===== */}
          <div className="section" style={{ gridColumn:'1 / -1' }}>
            <div className="card-head" style={{ justifyContent:'space-between' }}>
              <h3 className="card-title">Intervention Log <span className="chip">Sheet 2</span></h3>
              {!showInterventionForm && (
                <button 
                  onClick={handleAddNewInterventionClick}
                  className="form-btn"
                  style={{background:'#10b981'}}
                >
                  Add New
                </button>
              )}
            </div>

            <div className="card-body">
              {showInterventionForm ? (
                <InterventionForm 
                  studentId={studentId}
                  interventionToEdit={editingIntervention}
                  onInterventionAdded={handleInterventionFormSave}
                  onCancel={handleInterventionFormCancel}
                />
              ) : (
                student.interventions.length === 0 && <div className="muted">No intervention data found.</div>
              )}

              {!showInterventionForm && student.interventions.length > 0 && (
                <div className="two-col">
                  {student.interventions.map(int => (
                    <div key={int._id} className="item">
                      <strong>{int.monthYear} ({int.category})</strong>
                      <p className="muted"><b>Action:</b> {int.actionTaken}</p>
                      <p className="muted"><b>Impact:</b> {int.impact}</p>
                      <div style={{display:'flex', gap:8}}>
                        <button 
                          onClick={() => handleEditInterventionClick(int)}
                          className="form-btn"
                          style={{background:'#f59e0b'}}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteIntervention(int._id)}
                          className="form-btn"
                          style={{background:'#dc2626'}}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ===== NEW SECTION: ACADEMIC / PERSONAL LOG ===== */}
          <AcademicLogSection studentId={studentId} />

          {/* ===== NEW SECTION: ACTIVITY LOG ===== */}
          <ActivityLogSection studentId={studentId} />

        </div>
      </div>
    </div>
  )
}

export default MenteeDetailsPage
