import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from 'api'
import AssessmentForm from '../components/AssessmentForm'
import InterventionForm from '../components/InterventionForm'
import HodMentorSwitch from '../components/HodMentorSwitch'
import AcademicLogSection from '../components/AcademicLogSection'
import ActivityLogSection from '../components/ActivityLogSection'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-toastify'

function MenteeDetailsPage() {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { studentId } = useParams()
  const { user } = useAuth()

  const [editingAssessment, setEditingAssessment] = useState(null)
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)

  const [editingIntervention, setEditingIntervention] = useState(null)
  const [showInterventionForm, setShowInterventionForm] = useState(false)

  const [isDownloading, setIsDownloading] = useState(false)

  const fetchStudentDetails = useCallback(async () => {
    if (!student) setLoading(true)
    try {
      const res = await api.get(`/students/${studentId}/details`)
      setStudent(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch student details.')
      setLoading(false)
    }
  }, [studentId, student])

  useEffect(() => {
    if (!student) fetchStudentDetails()
  }, [fetchStudentDetails, student])

  const handleDeleteAssessment = async assessmentId => {
    const ok = window.confirm('Are you sure you want to delete this assessment record?')
    if (!ok) return
    try {
      await api.delete(`/assessments/${assessmentId}`)
      toast.success('Assessment deleted successfully')
      fetchStudentDetails()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete assessment.'
      toast.error(msg)
    }
  }

  const handleAddNewClick = () => {
    setEditingAssessment(null)
    setShowAssessmentForm(true)
  }

  const handleEditClick = assessment => {
    setEditingAssessment(assessment)
    setShowAssessmentForm(true)
  }

  const handleFormSave = () => {
    setShowAssessmentForm(false)
    fetchStudentDetails()
    toast.success('Assessment saved successfully')
  }

  const handleFormCancel = () => setShowAssessmentForm(false)

  const handleDeleteIntervention = async interventionId => {
    const ok = window.confirm('Are you sure you want to delete this intervention log?')
    if (!ok) return
    try {
      await api.delete(`/interventions/${interventionId}`)
      toast.success('Intervention deleted successfully')
      fetchStudentDetails()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete intervention.'
      toast.error(msg)
    }
  }

  const handleAddNewInterventionClick = () => {
    setEditingIntervention(null)
    setShowInterventionForm(true)
  }

  const handleEditInterventionClick = data => {
    setEditingIntervention(data)
    setShowInterventionForm(true)
  }

  const handleInterventionFormSave = () => {
    setShowInterventionForm(false)
    fetchStudentDetails()
    toast.success('Intervention saved successfully')
  }

  const handleInterventionFormCancel = () => setShowInterventionForm(false)

  const handleDownloadReport = async () => {
    setIsDownloading(true)
    try {
      const response = await api.get(`/assessments/report/${studentId}`)
      const { studentProfile, mentorName, kpiTotals, finalScores } = response.data
      const doc = new jsPDF()

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(
        'Vel Tech Multi Tech Dr.Rangarajan Dr.Sakunthala Engineering College',
        doc.internal.pageSize.getWidth() / 2,
        15,
        { align: 'center' }
      )
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(
        '(Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai)',
        doc.internal.pageSize.getWidth() / 2,
        20,
        { align: 'center' }
      )
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(
        'STUDENT MENTORING ASSESSMENT SHEET',
        doc.internal.pageSize.getWidth() / 2,
        30,
        { align: 'center' }
      )

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Department: ${studentProfile.department}`, 14, 40)
      doc.text(`Mentor Name: ${mentorName}`, 14, 45)
      doc.text(`Mentee Name: ${studentProfile.name}`, 14, 50)
      doc.text(`Mentee VM No: ${studentProfile.vmNumber}`, 14, 55)
      doc.text(`Batch: ${studentProfile.batch}`, 100, 55)

      const tableBody = [
        ['1', 'CGPA', studentProfile.latestCgpa, '', '', finalScores.cgpaScore],
        ['2', '% Attendance', `${finalScores.attendanceScore.toFixed(2)}%`, '', '', finalScores.attendanceScore],
        ['3', 'Workshop', kpiTotals.workshop.participated, '', '', ''],
        ['4', 'Seminar', kpiTotals.seminar.participated, '', '', ''],
        [
          '5',
          'Conference',
          `${kpiTotals.conference.participated} (P) / ${kpiTotals.conference.presented} (Pr) / ${kpiTotals.conference.prizesWon} (W)`,
          '',
          '',
          ''
        ],
        [
          '6',
          'Symposium',
          `${kpiTotals.symposium.participated} (P) / ${kpiTotals.symposium.presented} (Pr) / ${kpiTotals.symposium.prizesWon} (W)`,
          '',
          '',
          ''
        ],
        [
          '7',
          'Professional Body activities',
          `${kpiTotals.profBodyActivities.participated} (P) / ${kpiTotals.profBodyActivities.presented} (Pr) / ${kpiTotals.profBodyActivities.prizesWon} (W)`,
          '',
          '',
          ''
        ],
        ['', '', '', '', 'Score', finalScores.coCurricularScore],
        ['8', 'Talks/Lectures', kpiTotals.talksLectures.participated, '', '', ''],
        [
          '9',
          'Project Expo',
          `${kpiTotals.projectExpo.presented} (Pr) / ${kpiTotals.projectExpo.prizesWon} (W)`,
          '',
          '',
          ''
        ],
        [
          '10',
          'NPTEL/SWAYAM',
          `${kpiTotals.nptelSwayam.completed} (C) / ${kpiTotals.nptelSwayam.miniprojects} (MP)`,
          '',
          '',
          ''
        ],
        [
          '11',
          'Certification Courses',
          `${kpiTotals.otherCertifications.completed} (C) / ${kpiTotals.otherCertifications.miniprojects} (MP)`,
          '',
          '',
          ''
        ],
        ['', '', '', '', 'Score', finalScores.certificationScore],
        [
          '12',
          'Culturals',
          `${kpiTotals.culturals.participated} (P) / ${kpiTotals.culturals.prizesWon} (W)`,
          '',
          '',
          ''
        ],
        [
          '13',
          'Sports',
          `${kpiTotals.sports.participated} (P) / ${kpiTotals.sports.prizesWon} (W)`,
          '',
          '',
          ''
        ],
        ['14', 'NCC', `${kpiTotals.ncc.participated} (P) / ${kpiTotals.ncc.prizesWon} (W)`, '', '', ''],
        ['15', 'NSS', `${kpiTotals.nss.participated} (P) / ${kpiTotals.nss.prizesWon} (W)`, '', '', ''],
        ['', '', '', '', 'Score', finalScores.extraCurricularScore]
      ]

      autoTable(doc, {
        startY: 60,
        head: [['Sl. No', 'KPI', 'Earned / No. of events attended over the years', 'Remarks', 'Average Score', 'Score']],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5, halign: 'center' },
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: {
          1: { halign: 'left' },
          2: { halign: 'left' }
        },
        didParseCell: data => {
          if (data.cell.raw === 'Score') {
            data.cell.colSpan = 2
            data.cell.halign = 'right'
            data.cell.fontStyle = 'bold'
          }
        }
      })

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      const finalY = doc.lastAutoTable.finalY
      doc.text('Overall Score (out of 50)', 140, finalY + 10)
      doc.text(finalScores.totalScore.toString(), 190, finalY + 10, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.text('Mentor', 30, finalY + 30)
      doc.text('Head of the Department', 160, finalY + 30)

      doc.save(`Mentoring_Report_${studentProfile.name}.pdf`)
      toast.success('Report downloaded')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to download report.'
      toast.error(msg)
    } finally {
      setIsDownloading(false)
    }
  }

  if (loading && !student) {
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

  return (
    <div className="mdp">
      <div className="container">
        <Link to="/dashboard" className="back">
          ← Back to Dashboard
        </Link>

        {user?.role === 'hod' && (
          <div
            className="section"
            style={{
              marginTop: 18,
              background: 'rgba(239,68,68,.08)',
              border: '1px solid rgba(239,68,68,.4)'
            }}
          >
            <HodMentorSwitch
              studentId={student.profile._id}
              currentMentorId={student.profile.currentMentor}
              onMentorSwitched={fetchStudentDetails}
            />
          </div>
        )}

        <div className="grid">
          <div className="card">
            <div className="card-head" style={{ justifyContent: 'space-between' }}>
              <h3 className="card-title">Profile</h3>
              <button
                onClick={handleDownloadReport}
                className="form-btn"
                style={{ background: '#0ea5e9', fontSize: 12 }}
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
            <div className="card-head" style={{ justifyContent: 'space-between' }}>
              <h3 className="card-title">
                Assessment Data <span className="chip">Sheet 1</span>
              </h3>
              {!showAssessmentForm && (
                <button onClick={handleAddNewClick} className="form-btn" style={{ background: '#10b981' }}>
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
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => handleEditClick(ass)}
                          className="form-btn"
                          style={{ background: '#f59e0b' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(ass._id)}
                          className="form-btn"
                          style={{ background: '#dc2626' }}
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

          <div className="section" style={{ gridColumn: '1 / -1' }}>
            <div className="card-head" style={{ justifyContent: 'space-between' }}>
              <h3 className="card-title">
                Intervention Log <span className="chip">Sheet 2</span>
              </h3>
              {!showInterventionForm && (
                <button
                  onClick={handleAddNewInterventionClick}
                  className="form-btn"
                  style={{ background: '#10b981' }}
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
                      <strong>
                        {int.monthYear} ({int.category})
                      </strong>
                      <p className="muted">
                        <b>Action:</b> {int.actionTaken}
                      </p>
                      <p className="muted">
                        <b>Impact:</b> {int.impact}
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleEditInterventionClick(int)}
                          className="form-btn"
                          style={{ background: '#f59e0b' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteIntervention(int._id)}
                          className="form-btn"
                          style={{ background: '#dc2626' }}
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
        </div>

        <AcademicLogSection studentId={studentId} />
        <ActivityLogSection studentId={studentId} />
      </div>
    </div>
  )
}

export default MenteeDetailsPage
