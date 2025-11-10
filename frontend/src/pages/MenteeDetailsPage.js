// --- Final Build ---
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from 'api';
import AssessmentForm from '../components/AssessmentForm'
import InterventionForm from '../components/InterventionForm'
import HodMentorSwitch from '../components/HodMentorSwitch'

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
  
  // --- 2. NEW STATE FOR PDF BUTTON ---
  const [isDownloading, setIsDownloading] = useState(false);

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

  // --- (All handle functions are unchanged) ---
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
    setEditingAssessment(null); _
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

  // --- (Loading/Error/Guard Clause are unchanged) ---
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

  if (!student || !student.profile) {
    return (
      <div className="mdp-wrap empty">
        <div className="box">No student data found.</div>
      </div>
    )
  }

  
  // --- 3. 🚀 NEW: PDF DOWNLOAD FUNCTION 🚀 ---
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      // 1. Call our new backend route
      const response = await api.get(`/assessments/report/${studentId}`);
      const { studentProfile, mentorName, kpiTotals, finalScores } = response.data;

      // 2. Create the PDF document
      const doc = new jsPDF();

      // 3. Add Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Vel Tech Multi Tech Dr.Rangarajan Dr.Sakunthala Engineering College', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('(Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai)', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('STUDENT MENTORING ASSESSMENT SHEET', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

      // 4. Add Student Info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Department: ${studentProfile.department}`, 14, 40);
      doc.text(`Mentor Name: ${mentorName}`, 14, 45);
      doc.text(`Mentee Name: ${studentProfile.name}`, 14, 50);
      doc.text(`Mentee VM No: ${studentProfile.vmNumber}`, 14, 55);
      doc.text(`Batch: ${studentProfile.batch}`, 100, 55);

      // 5. Build the table data
      const tableBody = [
        ['1', 'CGPA', studentProfile.latestCgpa, '', '', finalScores.cgpaScore],
        ['2', '% Attendance', `${finalScores.attendanceScore.toFixed(2)}%`, '', '', finalScores.attendanceScore],
        ['3', 'Workshop', kpiTotals.workshop.participated, '', '', ''],
        ['4', 'Seminar', kpiTotals.seminar.participated, '', '', ''],
        ['5', 'Conference', `${kpiTotals.conference.participated} (P) / ${kpiTotals.conference.presented} (Pr) / ${kpiTotals.conference.prizesWon} (W)`, '', '', ''],
        ['6', 'Symposium', `${kpiTotals.symposium.participated} (P) / ${kpiTotals.symposium.presented} (Pr) / ${kpiTotals.symposium.prizesWon} (W)`, '', '', ''],
        ['7', 'Professional Body activities', `${kpiTotals.profBodyActivities.participated} (P) / ${kpiTotals.profBodyActivities.presented} (Pr) / ${kpiTotals.profBodyActivities.prizesWon} (W)`, '', '', ''],
        ['', '', '', '', 'Score', finalScores.coCurricularScore], // Co-curricular Sub-total
        ['8', 'Talks/Lectures', kpiTotals.talksLectures.participated, '', '', ''],
        ['9', 'Project Expo', `${kpiTotals.projectExpo.presented} (Pr) / ${kpiTotals.projectExpo.prizesWon} (W)`, '', '', ''],
        ['10', 'NPTEL/SWAYAM', `${kpiTotals.nptelSwayam.completed} (C) / ${kpiTotals.nptelSwayam.miniprojects} (MP)`, '', '', ''],
        ['11', 'Certification Courses', `${kpiTotals.otherCertifications.completed} (C) / ${kpiTotals.otherCertifications.miniprojects} (MP)`, '', '', ''],
        ['', '', '', '', 'Score', finalScores.certificationScore], // Certification Sub-total
        ['12', 'Culturals', `${kpiTotals.culturals.participated} (P) / ${kpiTotals.culturals.prizesWon} (W)`, '', '', ''],
        ['13', 'Sports', `${kpiTotals.sports.participated} (P) / ${kpiTotals.sports.prizesWon} (W)`, '', '', ''],
        ['14', 'NCC', `${kpiTotals.ncc.participated} (P) / ${kpiTotals.ncc.prizesWon} (W)`, '', '', ''],
        ['15', 'NSS', `${kpiTotals.nss.participated} (P) / ${kpiTotals.nss.prizesWon} (W)`, '', '', ''],
        ['', '', '', '', 'Score', finalScores.extraCurricularScore], // Extra-curricular Sub-total
      ];

      // 6. Add the table
      autoTable(doc, {
        startY: 60,
        head: [['Sl. No', 'KPI', 'Earned / No. of events attended over the years', 'Remarks', 'Average Score', 'Score']],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5, halign: 'center' },
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: {
          1: { halign: 'left' },
          2: { halign: 'left' },
        },
        didParseCell: function (data) {
          if (data.cell.raw === 'Score') {
            data.cell.colSpan = 2;
            data.cell.halign = 'right';
            data.cell.fontStyle = 'bold';
          }
        }
      });

      // 7. Add Final Score
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      const finalY = doc.autoTable.previous.finalY; // Removed (doc as any)
      
      doc.text('Overall Score (out of 50)', 140, finalY + 10);
      doc.text(finalScores.totalScore.toString(), 190, finalY + 10, { align: 'center' });

      // 8. Add Signatures
      doc.setFont('helvetica', 'normal');
      doc.text('Mentor', 30, finalY + 30);
      doc.text('Head of the Department', 160, finalY + 30);

      // 9. Save the file
      doc.save(`Mentoring_Report_${studentProfile.name}.pdf`);

    } catch (err) {
      console.error(err);
      // --- THIS IS THE FIX ---
      // This will show the REAL error message from the backend (like "404 - Not Found")
      const errorMsg = err.response?.data?.message || 'Failed to download report.';
      alert(`Error: ${errorMsg}`);
      // -----------------------
    } finally {
      setIsDownloading(false);
    }
  };
  // --- END OF PDF FUNCTION ---


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
            <div className="card-head" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Profile</h3>
              <button 
                onClick={handleDownloadReport} 
                className="form-btn" 
                style={{ margin: 0, fontSize: 12, padding: '6px 10px', background: '#0ea5e9' }}
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