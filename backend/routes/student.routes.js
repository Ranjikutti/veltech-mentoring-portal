const express = require('express');
const router = express.Router();

const Student = require('../models/student.model.js');
const User = require('../models/user.model.js');
const Assessment = require('../models/assessment.model.js');
const Intervention = require('../models/intervention.model.js');

const { protect, isHod } = require('../middleware/auth.middleware.js');

// -----------------------------------------------------------
// ROUTE 1: Create a new student (HOD ONLY)
// -----------------------------------------------------------
router.post('/', protect, isHod, async (req, res) => {
  try {
    const {
      name,
      registerNumber,
      vmNumber,
      batch,
      section,
      semester,
      mentorMtsNumber,
      personal,
      parents,
      addresses,
      contact,
      academics,
      health,
      achievements
    } = req.body;

    const department = req.user.department;

    const mentor = await User.findOne({ mtsNumber: mentorMtsNumber });
    if (!mentor) {
      return res
        .status(404)
        .json({ message: `Mentor with MTS Number ${mentorMtsNumber} not found.` });
    }

    const newStudent = new Student({
      name,
      registerNumber,
      vmNumber,
      department,
      batch,
      section,
      semester,
      currentMentor: mentor._id,
      personal: personal || {},
      parents: parents || {},
      addresses: addresses || {},
      contact: contact || {},
      academics: academics || {},
      health: health || {},
      achievements: achievements || {}
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Student with this Register Number or VM Number already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 2: Get all students for logged-in mentor
// -----------------------------------------------------------
router.get('/my-mentees', protect, async (req, res) => {
  try {
    const mentorId = req.user._id;
    const mentees = await Student.find({ currentMentor: mentorId }).select(
      'name registerNumber vmNumber department'
    );
    res.status(200).json(mentees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 3: Get all students for a specific mentor (HOD ONLY)
// -----------------------------------------------------------
router.get('/mentor/:mentorId', protect, isHod, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentees = await Student.find({ currentMentor: mentorId }).select(
      'name registerNumber vmNumber'
    );
    res.status(200).json(mentees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 4: Get full details for a single student
// -----------------------------------------------------------
router.get('/:studentId/details', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = req.user;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (user.role !== 'hod' && !student.currentMentor.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to view this student.' });
    }

    const assessments = await Assessment.find({ studentId }).sort({ academicYear: 1 });
    const interventions = await Intervention.find({ studentId }).sort({ createdAt: -1 });

    res.status(200).json({
      profile: student,
      assessments,
      interventions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 5: Re-assign a new mentor to a student (HOD ONLY)
// -----------------------------------------------------------
router.put('/:studentId/assign-mentor', protect, isHod, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { newMentorId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const newMentor = await User.findById(newMentorId);
    if (!newMentor || newMentor.role !== 'mentor') {
      return res
        .status(404)
        .json({ message: 'New mentor not found or user is not a mentor.' });
    }

    if (
      newMentor.department !== req.user.department ||
      student.department !== req.user.department
    ) {
      return res
        .status(403)
        .json({ message: 'You can only assign mentors within your own department.' });
    }

    student.currentMentor = newMentorId;
    await student.save();

    res.status(200).json({ message: 'Mentor successfully reassigned.', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
