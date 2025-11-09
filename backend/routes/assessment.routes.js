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
// URL: POST http://localhost:5000/api/assessments/
// This route is PROTECTED. Only a logged-in mentor can do this.
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
    // 1. Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // 2. Check if the logged-in mentor is the student's current mentor
    // We compare the IDs. .equals() is the safe way to compare Mongoose IDs.
    if (!student.currentMentor.equals(mentorId)) {
      return res.status(403).json({ message: 'You are not authorized to edit this student.' });
    }

    // --- "Upsert" Logic ---
    // This is the "smart" part.
    // It finds an assessment for this student AND year.
    // If it exists, it updates it.
    // If it doesn't exist, it creates it (upsert: true).
    
    const updatedAssessment = await Assessment.findOneAndUpdate(
      { studentId: studentId, academicYear: academicYear }, // Find by this
      { ...rawData, studentId, academicYear }, // Set this data
      { new: true, upsert: true, runValidators: true } // Options
    );

    // --- Scoring Logic ---
    // Now that the data is saved, we calculate the scores to send back
    const scores = calculateTotalScore(updatedAssessment);

    // Send back both the saved data and the calculated scores
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
// URL: GET http://localhost:5000/api/assessments/:studentId
// -----------------------------------------------------------------------
router.get('/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find all assessments for this student
    const assessments = await Assessment.find({ studentId: studentId });

    if (!assessments) {
      return res.status(404).json({ message: 'No assessments found for this student.' });
    }

    // We can also calculate scores for each assessment
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
// URL: GET http://localhost:5000/api/assessments/mentor/performance
// This route is PROTECTED.
// -----------------------------------------------------------------------
router.get('/mentor/performance', protect, async (req, res) => {
  try {
    const mentorId = req.user._id; // Get logged-in mentor

    // 1. Find all students for this mentor
    const mentees = await Student.find({ currentMentor: mentorId })
                                 .select('_id name registerNumber');

    // 2. For each mentee, find their latest assessment and calculate score
    const performanceData = [];

    // We use Promise.all to run all these database lookups at the same time
    await Promise.all(mentees.map(async (mentee) => {
      // Find the most recent assessment for this mentee
      const latestAssessment = await Assessment.findOne({ studentId: mentee._id })
                                               .sort({ updatedAt: -1 }); // Get the newest one

      if (latestAssessment) {
        // 3. Use our "brain" to calculate the score
        const scores = calculateTotalScore(latestAssessment);
        
        performanceData.push({
          studentId: mentee._id,
          name: mentee.name,
          registerNumber: mentee.registerNumber,
          totalScore: scores.totalScore, // Get the final score
          academicYear: latestAssessment.academicYear // Show which year this score is from
        });
      } else {
        // If no assessment, they get 0
        performanceData.push({
          studentId: mentee._id,
          name: mentee.name,
          registerNumber: mentee.registerNumber,
          totalScore: 0,
          academicYear: 'N/A'
        });
      }
    }));

    // 4. Sort the list: "well performer" (highest score) first
    performanceData.sort((a, b) => b.totalScore - a.totalScore);

    // 5. Send the final ranked list
    res.status(200).json(performanceData);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;