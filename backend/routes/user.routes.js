const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model.js');
const Student = require('../models/student.model.js');

const { protect, isHod } = require('../middleware/auth.middleware.js');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mtsNumber, designation, department, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { mtsNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or MTS Number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mtsNumber,
      designation,
      department,
      role
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/mentors', protect, isHod, async (req, res) => {
  try {
    const hodDepartment = req.user.department;

    const mentors = await User.find({
      department: hodDepartment,
      role: 'mentor'
    }).select('name email mtsNumber designation');

    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/create-mentor', protect, isHod, async (req, res) => {
  try {
    const { name, email, password, mtsNumber, designation } = req.body;
    const department = req.user.department;

    const existingUser = await User.findOne({ $or: [{ email }, { mtsNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or MTS Number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mtsNumber,
      designation,
      department,
      role: 'mentor'
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      mtsNumber: savedUser.mtsNumber,
      designation: savedUser.designation
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/mentor/:mentorId', protect, isHod, async (req, res) => {
  try {
    const { mentorId } = req.params;

    const mentees = await Student.find({ currentMentor: mentorId });
    if (mentees.length > 0) {
      return res.status(400).json({
        message: `Cannot delete mentor. ${mentees.length} mentees are still assigned. Please re-assign them first.`
      });
    }

    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found.' });
    }

    if (mentor.department !== req.user.department) {
      return res.status(403).json({ message: 'You can only delete mentors within your own department.' });
    }

    await User.findByIdAndDelete(mentorId);

    res.status(200).json({ message: 'Mentor deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/mentor/:mentorId', protect, isHod, async (req, res) => {
  try {
    const { mentorId } = req.params;

    const mentor = await User.findOne({
      _id: mentorId,
      department: req.user.department,
      role: 'mentor'
    }).select('name email mtsNumber designation');

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found in your department.' });
    }

    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/mentor/:mentorId', protect, isHod, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { name, email, mtsNumber, designation } = req.body;

    const mentor = await User.findOne({
      _id: mentorId,
      department: req.user.department,
      role: 'mentor'
    });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found in your department.' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mtsNumber }],
      _id: { $ne: mentorId }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Another user with this email or MTS Number already exists.' });
    }

    mentor.name = name || mentor.name;
    mentor.email = email || mentor.email;
    mentor.mtsNumber = mtsNumber || mentor.mtsNumber;
    mentor.designation = designation || mentor.designation;

    const updatedMentor = await mentor.save();

    res.status(200).json({
      _id: updatedMentor._id,
      name: updatedMentor.name,
      email: updatedMentor.email,
      mtsNumber: updatedMentor.mtsNumber,
      designation: updatedMentor.designation
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/hods', protect, isHod, async (req, res) => {
  try {
    const hods = await User.find({ role: 'hod' }).select('-password');
    res.status(200).json(hods);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/hods', protect, isHod, async (req, res) => {
  try {
    const { name, email, password, mtsNumber, department, designation } = req.body;

    const existingHod = await User.findOne({ department, role: 'hod' });
    if (existingHod) {
      return res.status(400).json({ message: 'HOD already exists for this department.' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mtsNumber }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or MTS Number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const hod = await User.create({
      name,
      email,
      password: hashedPassword,
      mtsNumber,
      department,
      designation,
      role: 'hod'
    });

    res.status(201).json({
      _id: hod._id,
      name: hod.name,
      email: hod.email,
      mtsNumber: hod.mtsNumber,
      department: hod.department,
      designation: hod.designation,
      role: hod.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/hods/:hodId', protect, isHod, async (req, res) => {
  try {
    const { hodId } = req.params;

    const hod = await User.findOne({ _id: hodId, role: 'hod' });
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found.' });
    }

    await User.deleteOne({ _id: hodId });

    res.status(200).json({ message: 'HOD deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
