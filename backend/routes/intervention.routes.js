const express = require('express');
const router = express.Router();

const Intervention = require('../models/intervention.model.js');
const Student = require('../models/student.model.js');

const { protect } = require('../middleware/auth.middleware.js');

// -----------------------------------------------------------
// ROUTE 1: Add Intervention (Mentor OR HOD)
// -----------------------------------------------------------
router.post('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const { studentId, monthYear, category, actionTaken, impact } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Mentor rule: can only add for own mentees
    if (user.role === 'mentor' && !student.currentMentor.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to add an intervention for this student.' });
    }

    // HOD rule: can only add for students in department
    if (user.role === 'hod' && student.department !== user.department) {
      return res.status(403).json({ message: 'You can only add interventions for students in your own department.' });
    }

    const newIntervention = new Intervention({
      studentId,
      mentorId: user._id,
      monthYear,
      category,
      actionTaken,
      impact
    });

    const saved = await newIntervention.save();
    return res.status(201).json(saved);

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 2: Get All Interventions For a Student
// -----------------------------------------------------------
router.get('/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;

    const interventions = await Intervention.find({ studentId })
      .populate('mentorId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json(interventions);

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 3: Update Intervention
// -----------------------------------------------------------
router.put('/:interventionId', protect, async (req, res) => {
  try {
    const user = req.user;
    const { interventionId } = req.params;
    const { monthYear, category, actionTaken, impact } = req.body;

    const intervention = await Intervention.findById(interventionId);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found.' });
    }

    const student = await Student.findById(intervention.studentId);

    // Mentor rule
    if (user.role === 'mentor' && !intervention.mentorId.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to edit this intervention.' });
    }

    // HOD rule
    if (user.role === 'hod' && student.department !== user.department) {
      return res.status(403).json({ message: 'You are not authorized to edit this intervention.' });
    }

    intervention.monthYear = monthYear || intervention.monthYear;
    intervention.category = category || intervention.category;
    intervention.actionTaken = actionTaken || intervention.actionTaken;
    intervention.impact = impact || intervention.impact;

    const updated = await intervention.save();
    return res.status(200).json(updated);

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 4: Delete Intervention
// -----------------------------------------------------------
router.delete('/:interventionId', protect, async (req, res) => {
  try {
    const user = req.user;
    const { interventionId } = req.params;

    const intervention = await Intervention.findById(interventionId);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found.' });
    }

    const student = await Student.findById(intervention.studentId);

    // Mentor rule
    if (user.role === 'mentor' && !intervention.mentorId.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to delete this intervention.' });
    }

    // HOD rule
    if (user.role === 'hod' && student.department !== user.department) {
      return res.status(403).json({ message: 'You are not authorized to delete this intervention.' });
    }

    await Intervention.findByIdAndDelete(interventionId);
    return res.status(200).json({ message: 'Intervention deleted successfully.' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
