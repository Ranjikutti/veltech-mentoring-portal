const express = require('express');
const router = express.Router();

const AcademicLog = require('../models/academicLog.model.js');
const Student = require('../models/student.model.js');
const { protect } = require('../middleware/auth.middleware.js');

router.post('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const { studentId, semester, date, type, problemIdentification, problemDetails, remedialAction, improvementProgress } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (user.role === 'mentor' && !student.currentMentor.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to add a log for this student.' });
    }

    if (user.role === 'hod' && student.department !== user.department) {
      return res.status(403).json({ message: 'You can only add logs for students in your own department.' });
    }

    const log = new AcademicLog({
      studentId,
      mentorId: user._id,
      semester,
      date,
      type,
      problemIdentification,
      problemDetails,
      remedialAction,
      improvementProgress
    });

    const saved = await log.save();
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;

    const filter = { studentId };
    if (semester) {
      filter.semester = semester;
    }

    const logs = await AcademicLog.find(filter)
      .populate('mentorId', 'name')
      .sort({ date: 1, createdAt: 1 });

    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:logId', protect, async (req, res) => {
  try {
    const user = req.user;
    const { logId } = req.params;
    const { semester, date, type, problemIdentification, problemDetails, remedialAction, improvementProgress } = req.body;

    const log = await AcademicLog.findById(logId);
    if (!log) {
      return res.status(404).json({ message: 'Log not found.' });
    }

    const student = await Student.findById(log.studentId);

    if (user.role === 'mentor' && !log.mentorId.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to edit this log.' });
    }

    if (user.role === 'hod' && student.department !== user.department) {
      return res.status(403).json({ message: 'You are not authorized to edit this log.' });
    }

    if (semester) log.semester = semester;
    if (date) log.date = date;
    if (type) log.type = type;
    if (problemIdentification) log.problemIdentification = problemIdentification;
    if (problemDetails) log.problemDetails = problemDetails;
    if (remedialAction) log.remedialAction = remedialAction;
    if (improvementProgress) log.improvementProgress = improvementProgress;

    const updated = await log.save();
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:logId', protect, async (req, res) => {
  try {
    const user = req.user;
    const { logId } = req.params;

    const log = await AcademicLog.findById(logId);
    if (!log) {
      return res.status(404).json({ message: 'Log not found.' });
    }

    const student = await Student.findById(log.studentId);

    if (user.role === 'mentor' && !log.mentorId.equals(user._id)) {
      return res.status(403).json({ message: 'You are not authorized to delete this log.' });
    }

    if (user.role === 'hod' && student.department !== user.department) {
      return res.status(403).json({ message: 'You are not authorized to delete this log.' });
    }

    await AcademicLog.findByIdAndDelete(logId);
    return res.status(200).json({ message: 'Log deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
