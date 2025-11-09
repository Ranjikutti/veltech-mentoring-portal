// 1. Import all our tools
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// 2. Load our secret DATABASE_URL from .env
dotenv.config();

// 3. Create the Express server (our "engine")
const app = express();
const PORT = process.env.PORT || 5000;

// 4. Set up our "middleware" (tools for the engine)

// --- THIS IS THE FIX ---
// Define exactly which URL is allowed to make requests
const corsOptions = {
  origin: 'https://veltech-mentoring-portal.vercel.app'
};
// Use the new options
app.use(cors(corsOptions));
// ----------------------

app.use(express.json()); // Allows the server to understand JSON data

// --- Import our routes ---
const userRoutes = require('./routes/user.routes.js');
const studentRoutes = require('./routes/student.routes.js');
const assessmentRoutes = require('./routes/assessment.routes.js');
const interventionRoutes = require('./routes/intervention.routes.js'); // --- ADDED ---

// --- Tell the server to use these routes ---
app.use('/api/users', userRoutes); // All user routes will start with /api/users
app.use('/api/students', studentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/interventions', interventionRoutes); // --- ADDED ---

// 5. Create a function to connect to the database
const connectDB = async () => {
  try {
    // Get the database URL from .env file
    const dbUrl = process.env.DATABASE_URL;
    
    // Tell Mongoose to connect
    await mongoose.connect(dbUrl);
    
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    // Exit the process if we can't connect
    process.exit(1); 
  }
};

// 6. Create a test "route" (a URL for our server)
// This is just to check if the server is running
app.get('/', (req, res) => {
  res.send('Mentoring Portal API is running!');
});

// 7. Create a function to start the server
const startServer = async () => {
  // First, connect to the database
  await connectDB();
  
  // After the database is connected, start the server
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

// 8. Call the function to start everything!
startServer();