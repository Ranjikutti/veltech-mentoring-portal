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
// This is the NEW route you needed.
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


module.exports = router;