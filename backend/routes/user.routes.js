const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import the User model we created
const User = require('../models/user.model.js');
// --- ADD THIS LINE ---
const Student = require('../models/student.model.js'); 

// Import our "security guard" middleware
const { protect, isHod } = require('../middleware/auth.middleware.js');

// -----------------------------------------------------------
// ROUTE 1: Register a new user (Mentor or HOD)
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// ROUTE 2: Login a user
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// ROUTE 3: Get all mentors in the HOD's department
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// ROUTE 4: Create a new mentor (HOD ONLY)
// -----------------------------------------------------------
router.post('/create-mentor', protect, isHod, async (req, res) => {
  try {
    const { name, email, password, mtsNumber, designation } = req.body;
    const department = req.user.department; // Get HOD's department

    // 1. Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mtsNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or MTS Number already exists.' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the new mentor
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mtsNumber,
      designation,
      department,
      role: 'mentor' // Force role to 'mentor'
    });

    // 4. Save the user to the database
    const savedUser = await newUser.save();
    
    // Send back the new mentor data (excluding password)
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

// -----------------------------------------------------------
// ROUTE 5: Delete a mentor (HOD ONLY)
// -----------------------------------------------------------
router.delete('/mentor/:mentorId', protect, isHod, async (req, res) => {
  try {
    const { mentorId } = req.params;

    // 1. Check if this mentor still has mentees assigned
    const mentees = await Student.find({ currentMentor: mentorId });
    if (mentees.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete mentor. ${mentees.length} mentees are still assigned. Please re-assign them first.` 
      });
    }

    // 2. Find the mentor to check department
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found.' });
    }

    // 3. Security Check: Ensure HOD is in the same department
    if (mentor.department !== req.user.department) {
       return res.status(403).json({ message: 'You can only delete mentors within your own department.' });
    }

    // 4. Delete the mentor
    await User.findByIdAndDelete(mentorId);

    res.status(200).json({ message: 'Mentor deleted successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 6: Get a single mentor's details (HOD ONLY)
// URL: GET http://localhost:5000/api/.../api/.../api/users/mentor/:mentorId
// -----------------------------------------------------------
router.get('/mentor/:mentorId', protect, isHod, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await User.findOne({ _id: mentorId, department: req.user.department, role: 'mentor' })
                             .select('name email mtsNumber designation');
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found in your department.' });
    }
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -----------------------------------------------------------
// ROUTE 7: Update a mentor's details (HOD ONLY)
// URL: PUT http://localhost:5000/api/.../api/.../api/users/mentor/:mentorId
// -----------------------------------------------------------
router.put('/mentor/:mentorId', protect, isHod, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { name, email, mtsNumber, designation } = req.body;

    // Find the mentor and check if they are in the HOD's department
    const mentor = await User.findOne({ _id: mentorId, department: req.user.department, role: 'mentor' });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found in your department.' });
    }

    // Check if new email or MTS number already exists (and doesn't belong to the current mentor)
    const existingUser = await User.findOne({ 
      $or: [{ email }, { mtsNumber }], 
      _id: { $ne: mentorId } // $ne means "not equal"
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Another user with this email or MTS Number already exists.' });
    }

    // Update the details
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


module.exports = router;