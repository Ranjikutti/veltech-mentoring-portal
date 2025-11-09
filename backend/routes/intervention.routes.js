const express = require('express');
const router = express.Router();

// Import our models
const Intervention = require('../models/intervention.model.js');
const Student = require('../models/student.model.js');

// Import our "security guard" middleware
const { protect } = require('../middleware/auth.middleware.js');

// -----------------------------------------------------------------------
// ROUTE 1: Add a new intervention (Sheet 2)
// URL: POST http://localhost:5000/api/interventions/
// -----------------------------------------------------------------------
router.post('/', protect, async (req, res) => {
  try {
    const mentorId = req.user._id; // Get the logged-in mentor's ID
    const { studentId, monthYear, category, actionTaken, impact } = req.body;

    // --- Security Check ---
    // Check if the mentor is authorized to edit this student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    if (!student.currentMentor.equals(mentorId)) {
      return res.status(403).json({ message: 'You are not authorized to edit this student.' });
    }

    // --- Create New Intervention ---
    const newIntervention = new Intervention({
      studentId,
      mentorId, // Log which mentor added this
      monthYear,
      category,
      actionTaken,
      impact
    });

    const savedIntervention = await newIntervention.save();
    res.status(201).json(savedIntervention);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------------------
// ROUTE 2: Get all interventions for one student
// URL: GET http://localhost:5000/api/interventions/:studentId
// -----------------------------------------------------------------------
router.get('/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;

    // We can add a security check here too if we want
    
    const interventions = await Intervention.find({ studentId: studentId })
                                            .populate('mentorId', 'name') // Show mentor's name
                                            .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json(interventions);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;