const express = require('express');
const router = express.Router();

// Import our models
const Assessment = require('../models/assessment.model.js');
const Student = require('../models/student.model.js'); // --- THIS IS NEEDED ---

// Import our "security guard" middleware
const { protect } = require('../middleware/auth.middleware.js');

// Import our "smart" scoring brain
const { calculateTotalScore } = require('../utils/scoring.js');

// -----------------------------------------------------------------------
// ROUTE 1: Create or Update an Assessment (Sheet 1)
// URL: POST /api/assessments/
// -----------------------------------------------------------------------
router.post('/', protect, async (req, res) => {
  try {
    const mentorId = req.user._id; // Get the logged-in mentor's ID
    const { 
      studentId, 
      academicYear,
      ...rawData // This collects all other fields (cgpa, attendance, etc.)
    } = req.body;

    // --- Security Check ---
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    if (!student.currentMentor.equals(mentorId)) {
      return res.status(403).json({ message: 'You are not authorized to edit this student.' });
    }

    // --- "Upsert" Logic ---
    const updatedAssessment = await Assessment.findOneAndUpdate(
      { studentId: studentId, academicYear: academicYear }, // Find by this
      { ...rawData, studentId, academicYear }, // Set this data
      { new: true, upsert: true, runValidators: true } // Options
    );

    // --- Scoring Logic ---
    const scores = calculateTotalScore(updatedAssessment);

    res.status(200).json({
      savedData: updatedAssessment,
      calculatedScores: scores
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------------------
// ROUTE 2: Get a student's assessment data
// URL: GET /api/assessments/:studentId
// -----------------------------------------------------------------------
router.get('/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;

    const assessments = await Assessment.find({ studentId: studentId });

    if (!assessments) {
      return res.status(404).json({ message: 'No assessments found for this student.' });
    }

    const assessmentsWithScores = assessments.map(doc => {
      const scores = calculateTotalScore(doc);
      return { savedData: doc, calculatedScores: scores };
    });
    
    res.status(200).json(assessmentsWithScores);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------------------
// ROUTE 3: Get Performance Report for a Mentor's Mentees
// URL: GET /api/assessments/mentor/performance
// -----------------------------------------------------------------------
router.get('/mentor/performance', protect, async (req, res) => {
  try {
    const mentorId = req.user._id; // Get logged-in mentor

    const mentees = await Student.find({ currentMentor: mentorId })
                          .select('_id name registerNumber');

    const performanceData = [];

    await Promise.all(mentees.map(async (mentee) => {
      const latestAssessment = await Assessment.findOne({ studentId: mentee._id })
                                        .sort({ updatedAt: -1 }); // Get the newest one

      if (latestAssessment) {
        const scores = calculateTotalScore(latestAssessment);
        
        performanceData.push({
          studentId: mentee._id,
          name: mentee.name,
          registerNumber: mentee.registerNumber,
          totalScore: scores.totalScore,
          academicYear: latestAssessment.academicYear
        });
      } else {
        performanceData.push({
          studentId: mentee._id,
          name: mentee.name,
          registerNumber: mentee.registerNumber,
          totalScore: 0,
          academicYear: 'N/A'
        });
      }
    }));

    performanceData.sort((a, b) => b.totalScore - a.totalScore);

    res.status(200).json(performanceData);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------------------
// ROUTE 4: Delete an Assessment
// URL: DELETE /api/assessments/:assessmentId
// -----------------------------------------------------------------------
router.delete('/:assessmentId', protect, async (req, res) => {
  try {
    const mentorId = req.user._id;
    const { assessmentId } = req.params;

    // 1. Find the assessment
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' });
    }

    // 2. Find the student associated with the assessment
    const student = await Student.findById(assessment.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Associated student not found.' });
    }

    // 3. Security Check: Ensure the logged-in user is this student's mentor
    if (!student.currentMentor.equals(mentorId)) {
      return res.status(403).json({ message: 'You are not authorized to delete this assessment.' });
    }

    // 4. Delete the assessment
    await Assessment.findByIdAndDelete(assessmentId);

    res.status(200).json({ message: 'Assessment deleted successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------------------
// ROUTE 5: Get Overall PDF Report Data for a Student (NEW)
// URL: GET /api/assessments/report/:studentId
// -----------------------------------------------------------------------
router.get('/report/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Get Student & Mentor Info
    const student = await Student.findById(studentId).populate('currentMentor', 'name');
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // 2. Security Check (HOD or correct mentor)
    const user = req.user;
    if (user.role !== 'hod' && !student.currentMentor._id.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to view this report.' });
    }

    // 3. Get all assessments for this student
    const assessments = await Assessment.find({ studentId: studentId });
    if (assessments.length === 0) {
      return res.status(404).json({ message: 'No assessments found to generate a report.' });
    }

    // 4. Aggregate all data across all semesters
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
      latestCgpaDate: new Date(0), // Start with a very old date
    };

    for (const ass of assessments) {
      totals.workshop.participated += ass.workshop?.participated || 0;
      totals.seminar.participated += ass.seminar?.participated || 0;
      totals.conference.participated += ass.conference?.participated || 0;
      totals.conference.presented += ass.conference?.presented || 0;
      totals.conference.prizesWon += ass.conference?.prizesWon || 0;
      totals.symposium.participated += ass.symposium?.participated || 0;
      totals.symposium.presented += ass.symposium?.presented || 0;
      totals.symposium.prizesWon += ass.symposium?.prizesWon || 0;
      totals.profBodyActivities.participated += ass.profBodyActivities?.participated || 0;
      totals.profBodyActivities.presented += ass.profBodyActivities?.presented || 0;
      totals.profBodyActivities.prizesWon += ass.profBodyActivities?.prizesWon || 0;
      totals.talksLectures.participated += ass.talksLectures?.participated || 0;
      totals.projectExpo.presented += ass.projectExpo?.presented || 0;
      totals.projectExpo.prizesWon += ass.projectExpo?.prizesWon || 0;
      totals.nptelSwayam.completed += ass.nptelSwayam?.completed || 0;
      totals.nptelSwayam.miniprojects += ass.nptelSwayam?.miniprojects || 0;
      totals.otherCertifications.completed += ass.otherCertifications?.completed || 0;
      totals.otherCertifications.miniprojects += ass.otherCertifications?.miniprojects || 0;
      totals.culturals.participated += ass.culturals?.participated || 0;
      totals.culturals.prizesWon += ass.culturals?.prizesWon || 0;
      totals.sports.participated += ass.sports?.participated || 0;
      totals.sports.prizesWon += ass.sports?.prizesWon || 0;
      totals.ncc.participated += ass.ncc?.participated || 0;
      totals.ncc.prizesWon += ass.ncc?.prizesWon || 0;
      totals.nss.participated += ass.nss?.participated || 0;
      totals.nss.prizesWon += ass.nss?.prizesWon || 0;

      totals.attendanceSum += ass.attendancePercent || 0;
      
      // Find the latest CGPA
      if (ass.updatedAt > totals.latestCgpaDate) {
        totals.latestCgpa = ass.cgpa || 0;
        totals.latestCgpaDate = ass.updatedAt;
      }
    }

    // 5. Create the final data object to be scored
    const overallData = {
      ...totals,
      cgpa: totals.latestCgpa,
      // Calculate average attendance
      attendancePercent: totals.attendanceSum / assessments.length, 
    };

    // 6. Calculate the final scores using your "brain"
    const finalScores = calculateTotalScore(overallData);

    // 7. Send the complete report data to the frontend
    res.status(200).json({
      studentProfile: {
        name: student.name,
        vmNumber: student.vmNumber,
        department: student.department,
        batch: student.batch,
      },
      mentorName: student.currentMentor.name,
      kpiTotals: totals, // The total counts (e.g., 5 workshops)
      finalScores: finalScores, // The calculated scores (e.g., 10 points)
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;