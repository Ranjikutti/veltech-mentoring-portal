const express = require('express');
const router = express.Router();

const ActivityLog = require('../models/activityLog.model.js');
const Student = require('../models/student.model.js');
const { protect } = require('../middleware/auth.middleware.js');

router.post('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const { studentId, semester, date, category, title, notes } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (user.role === 'mentor' && !student.currentMentor.equals(user._id)) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to add an activity for this student.' });
    }

    if (user.role === 'hod' && student.department !== user.department) {
      return res
        .status(403)
        .json({ message: 'You can only add activities for students in your own department.' });
    }

    const activity = new ActivityLog({
      studentId,
      mentorId: user._id,
      semester: semester ? String(semester).trim() : '',
      date: date ? new Date(date) : new Date(),
      category,
      title: title ? String(title).trim() : '',
      notes: notes ? String(notes).trim() : ''
    });

    const saved = await activity.save();
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, category } = req.query;

    const filter = { studentId };
    if (semester) {
      filter.semester = semester;
    }
    if (category) {
      filter.category = category;
    }

    const activities = await ActivityLog.find(filter)
      .populate('mentorId', 'name')
      .sort({ semester: 1, slNo: 1, date: 1, createdAt: 1 });

    return res.status(200).json(activities);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:activityId', protect, async (req, res) => {
  try {
    const user = req.user;
    const { activityId } = req.params;
    const { semester, date, category, title, notes } = req.body;

    const activity = await ActivityLog.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    const student = await Student.findById(activity.studentId);

    if (user.role === 'mentor' && !activity.mentorId.equals(user._id)) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to edit this activity.' });
    }

    if (user.role === 'hod' && student.department !== user.department) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to edit this activity.' });
    }

    if (semester) activity.semester = String(semester).trim();
    if (date) activity.date = new Date(date);
    if (category) activity.category = category;
    if (title !== undefined) activity.title = String(title).trim();
    if (notes !== undefined) activity.notes = String(notes).trim();

    const updated = await activity.save();
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:activityId', protect, async (req, res) => {
  try {
    const user = req.user;
    const { activityId } = req.params;

    const activity = await ActivityLog.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    const student = await Student.findById(activity.studentId);

    if (user.role === 'mentor' && !activity.mentorId.equals(user._id)) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this activity.' });
    }

    if (user.role === 'hod' && student.department !== user.department) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this activity.' });
    }

    await ActivityLog.findByIdAndDelete(activityId);
    return res.status(200).json({ message: 'Activity deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
