const express = require('express');
const router = express.Router();

// Import our models
const Intervention = require('../models/intervention.model.js');
const Student = require('../models/student.model.js');

// Import our "security guard" middleware
const { protect } = require('../middleware/auth.middleware.js');

// -----------------------------------------------------------------------
// ROUTE 1: Add a new intervention (Sheet 2)
// URL: POST /api/interventions/
// -----------------------------------------------------------------------
router.post('/', protect, async (req, res) => {
  try {
    const mentorId = req.user._id; // Get the logged-in mentor's ID
    const { studentId, monthYear, category, actionTaken, impact } = req.body;

    // --- Security Check ---
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
// URL: GET /api/interventions/:studentId
// -----------------------------------------------------------------------
router.get('/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const interventions = await Intervention.find({ studentId: studentId })
                                            .populate('mentorId', 'name') // Show mentor's name
                                            .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json(interventions);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------------------
// ROUTE 3: Update an intervention (NEW)
// URL: PUT /api/interventions/:interventionId
// -----------------------------------------------------------------------
router.put('/:interventionId', protect, async (req, res) => {
  try {
    const mentorId = req.user._id;
    const { interventionId } = req.params;
    const { monthYear, category, actionTaken, impact } = req.body;

    // 1. Find the intervention
    const intervention = await Intervention.findById(interventionId);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found.' });
    }

    // 2. Security Check: Only the mentor who created it can edit it
    if (!intervention.mentorId.equals(mentorId)) {
      return res.status(403).json({ message: 'You are not authorized to edit this intervention.' });
    }

    // 3. Update the fields
    intervention.monthYear = monthYear || intervention.monthYear;
    intervention.category = category || intervention.category;
    intervention.actionTaken = actionTaken || intervention.actionTaken;
    intervention.impact = impact || intervention.impact;

    const updatedIntervention = await intervention.save();
    res.status(200).json(updatedIntervention);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------------------
// ROUTE 4: Delete an intervention (NEW)
// URL: DELETE /api/interventions/:interventionId
// -----------------------------------------------------------------------
router.delete('/:interventionId', protect, async (req, res) => {
  try {
    const mentorId = req.user._id;
    const { interventionId } = req.params;

    // 1. Find the intervention
    const intervention = await Intervention.findById(interventionId);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found.' });
    }

    // 2. Security Check: Only the mentor who created it can delete it
    if (!intervention.mentorId.equals(mentorId)) {
      return res.status(403).json({ message: 'You are not authorized to delete this intervention.' });
    }

    // 3. Delete the intervention
    await Intervention.findByIdAndDelete(interventionId);
    res.status(200).json({ message: 'Intervention deleted successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;