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
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link to="/dashboard" className="text-sky-600 hover:text-sky-700 font-medium hover:underline flex items-center gap-1">
          ← Back to Dashboard
        </Link>

        {user?.role === 'hod' && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 shadow-sm">
            <HodMentorSwitch
              studentId={student.profile._id}
              currentMentorId={student.profile.currentMentor}
              onMentorSwitched={fetchStudentDetails}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden col-span-1 md:col-span-2">
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h3 className="text-xl font-bold text-slate-800 m-0">Profile</h3>
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                disabled={isDownloading}
              >
                {isDownloading ? 'Downloading...' : 'Download Report'}
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{student.profile.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Register No</p>
                  <p className="text-lg font-semibold text-slate-800 m-0">{student.profile.registerNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">VM No</p>
                  <p className="text-lg font-semibold text-slate-800 m-0">{student.profile.vmNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                  <p className="text-lg font-semibold text-slate-800 m-0">{student.profile.department}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 m-0">
                Assessment Data 
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">Sheet 1</span>
              </h3>
              {!showAssessmentForm && (
                <button onClick={handleAddNewClick} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-md shadow-sm transition">
                  Add New
                </button>
              )}
            </div>

            <div className="p-6">
              {showAssessmentForm ? (
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl mb-4">
                  <AssessmentForm
                    studentId={studentId}
                    assessmentToEdit={editingAssessment}
                    onAssessmentAdded={handleFormSave}
                    onCancel={handleFormCancel}
                  />
                </div>
              ) : (
                student.assessments.length === 0 && <div className="text-slate-500 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">No assessment data found.</div>
              )}

              {!showAssessmentForm && student.assessments.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {student.assessments.map(ass => (
                    <div key={ass._id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <strong className="text-slate-900 block text-lg mb-1">{ass.academicYear}</strong>
                        <div className="text-slate-600 font-medium">Attendance: <span className="text-slate-900">{ass.attendancePercent}%</span></div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(ass)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-sm transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(ass._id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm transition border-none cursor-pointer"
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

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 m-0">
                Intervention Log 
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">Sheet 2</span>
              </h3>
              {!showInterventionForm && (
                <button
                  onClick={handleAddNewInterventionClick}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-md shadow-sm transition border-none cursor-pointer"
                >
                  Add New
                </button>
              )}
            </div>

            <div className="p-6">
              {showInterventionForm ? (
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl mb-4">
                  <InterventionForm
                    studentId={studentId}
                    interventionToEdit={editingIntervention}
                    onInterventionAdded={handleInterventionFormSave}
                    onCancel={handleInterventionFormCancel}
                  />
                </div>
              ) : (
                student.interventions.length === 0 && <div className="text-slate-500 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">No intervention data found.</div>
              )}

              {!showInterventionForm && student.interventions.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {student.interventions.map(int => (
                    <div key={int._id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-3 mb-3">
                        <strong className="text-slate-900 text-lg">
                          {int.monthYear} <span className="text-sky-600 text-sm font-semibold ml-1">({int.category})</span>
                        </strong>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditInterventionClick(int)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 border-none cursor-pointer text-white font-medium rounded-md shadow-sm transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteIntervention(int._id)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 border-none cursor-pointer text-white font-medium rounded-md shadow-sm transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-700 mb-2 mt-0">
                        <span className="font-bold text-slate-900">Action:</span> {int.actionTaken}
                      </p>
                      <p className="text-slate-700 m-0">
                        <span className="font-bold text-slate-900">Impact:</span> {int.impact}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <AcademicLogSection studentId={studentId} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <ActivityLogSection studentId={studentId} />
        </div>
      </div>
    </div>
  )
}

export default MenteeDetailsPage
