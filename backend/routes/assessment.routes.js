const express = require('express')
const router = express.Router()

const Assessment = require('../models/assessment.model.js')
const Student = require('../models/student.model.js')
const { protect } = require('../middleware/auth.middleware.js')
const { calculateTotalScore } = require('../utils/scoring.js')

router.post('/', protect, async (req, res) => {
  try {
    const mentorId = req.user._id
    const { studentId, academicYear, ...rawData } = req.body

    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' })
    }
    if (!student.currentMentor.equals(mentorId)) {
      return res.status(403).json({ message: 'You are not authorized to edit this student.' })
    }

    const updatedAssessment = await Assessment.findOneAndUpdate(
      { studentId: studentId, academicYear: academicYear },
      { ...rawData, studentId, academicYear },
      { new: true, upsert: true, runValidators: true }
    )

    const scores = calculateTotalScore(updatedAssessment)

    res.status(200).json({
      savedData: updatedAssessment,
      calculatedScores: scores
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

router.get('/mentor/performance', protect, async (req, res) => {
  try {
    const mentorId = req.user._id

    const mentees = await Student.find({ currentMentor: mentorId }).select('_id name registerNumber')

    const performanceData = []

    await Promise.all(
      mentees.map(async mentee => {
        const latestAssessment = await Assessment.findOne({ studentId: mentee._id }).sort({ updatedAt: -1 })

        if (latestAssessment) {
          const scores = calculateTotalScore(latestAssessment)
          performanceData.push({
            studentId: mentee._id,
            name: mentee.name,
            registerNumber: mentee.registerNumber,
            totalScore: scores.totalScore,
            academicYear: latestAssessment.academicYear
          })
        } else {
          performanceData.push({
            studentId: mentee._id,
            name: mentee.name,
            registerNumber: mentee.registerNumber,
            totalScore: 0,
            academicYear: 'N/A'
          })
        }
      })
    )

    performanceData.sort((a, b) => b.totalScore - a.totalScore)

    res.status(200).json(performanceData)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

router.get('/report/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params

    const student = await Student.findById(studentId).populate('currentMentor', 'name')
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    const user = req.user
    if (user.role !== 'hod' && !student.currentMentor._id.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to view this report.' })
    }

    const assessments = await Assessment.find({ studentId: studentId })
    if (assessments.length === 0) {
      return res.status(404).json({ message: 'No assessments found to generate a report.' })
    }

    const totals = {
      workshop: { participated: 0 },
      seminar: { participated: 0 },
      conference: { participated: 0, presented: 0, prizesWon: 0 },
      symposium: { participated: 0, presented: 0, prizesWon: 0 },
      profBodyActivities: { participated: 0, presented: 0, prizesWon: 0 },
      talksLectures: { participated: 0 },
      projectExpo: { presented: 0, prizesWon: 0 },
      nptelSwayam: { completed: 0, miniprojects: 0 },
      otherCertifications: { completed: 0, miniprojects: 0 },
      culturals: { participated: 0, prizesWon: 0 },
      sports: { participated: 0, prizesWon: 0 },
      ncc: { participated: 0, prizesWon: 0 },
      nss: { participated: 0, prizesWon: 0 },
      attendanceSum: 0,
      latestCgpa: 0,
      latestCgpaDate: new Date(0)
    }

    for (const ass of assessments) {
      totals.workshop.participated += ass.workshop?.participated || 0
      totals.seminar.participated += ass.seminar?.participated || 0
      totals.conference.participated += ass.conference?.participated || 0
      totals.conference.presented += ass.conference?.presented || 0
      totals.conference.prizesWon += ass.conference?.prizesWon || 0
      totals.symposium.participated += ass.symposium?.participated || 0
      totals.symposium.presented += ass.symposium?.presented || 0
      totals.symposium.prizesWon += ass.symposium?.prizesWon || 0
      totals.profBodyActivities.participated += ass.profBodyActivities?.participated || 0
      totals.profBodyActivities.presented += ass.profBodyActivities?.presented || 0
      totals.profBodyActivities.prizesWon += ass.profBodyActivities?.prizesWon || 0
      totals.talksLectures.participated += ass.talksLectures?.participated || 0
      totals.projectExpo.presented += ass.projectExpo?.presented || 0
      totals.projectExpo.prizesWon += ass.projectExpo?.prizesWon || 0
      totals.nptelSwayam.completed += ass.nptelSwayam?.completed || 0
      totals.nptelSwayam.miniprojects += ass.nptelSwayam?.miniprojects || 0
      totals.otherCertifications.completed += ass.otherCertifications?.completed || 0
      totals.otherCertifications.miniprojects += ass.otherCertifications?.miniprojects || 0
      totals.culturals.participated += ass.culturals?.participated || 0
      totals.culturals.prizesWon += ass.culturals?.prizesWon || 0
      totals.sports.participated += ass.sports?.participated || 0
      totals.sports.prizesWon += ass.sports?.prizesWon || 0
      totals.ncc.participated += ass.ncc?.participated || 0
      totals.ncc.prizesWon += ass.ncc?.prizesWon || 0
      totals.nss.participated += ass.nss?.participated || 0
      totals.nss.prizesWon += ass.nss?.prizesWon || 0

      totals.attendanceSum += ass.attendancePercent || 0

      if (ass.updatedAt > totals.latestCgpaDate) {
        totals.latestCgpa = ass.cgpa || 0
        totals.latestCgpaDate = ass.updatedAt
      }
    }

    const overallData = {
      ...totals,
      cgpa: totals.latestCgpa,
      attendancePercent: totals.attendanceSum / assessments.length
    }

    const finalScores = calculateTotalScore(overallData)

    res.status(200).json({
      studentProfile: {
        name: student.name,
        vmNumber: student.vmNumber,
        department: student.department,
        batch: student.batch
      },
      mentorName: student.currentMentor.name,
      kpiTotals: totals,
      finalScores: finalScores
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

router.get('/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params

    const assessments = await Assessment.find({ studentId: studentId })

    const assessmentsWithScores = assessments.map(doc => {
      const scores = calculateTotalScore(doc)
      return { savedData: doc, calculatedScores: scores }
    })

    res.status(200).json(assessmentsWithScores)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

router.delete('/:assessmentId', protect, async (req, res) => {
  try {
    const user = req.user
    const { assessmentId } = req.params

    const assessment = await Assessment.findById(assessmentId)
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' })
    }

    const student = await Student.findById(assessment.studentId)
    if (!student) {
      return res.status(404).json({ message: 'Associated student not found.' })
    }

    if (user.role === 'mentor') {
      if (!student.currentMentor.equals(user._id)) {
        return res.status(403).json({ message: 'You are not authorized to delete this assessment.' })
      }
    } else if (user.role === 'hod') {
      if (student.department !== user.department) {
        return res.status(403).json({ message: 'You can only delete assessments for students in your department.' })
      }
    } else {
      return res.status(403).json({ message: 'Only mentors or HOD can delete assessments.' })
    }

    await Assessment.findByIdAndDelete(assessmentId)

    res.status(200).json({ message: 'Assessment deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router
