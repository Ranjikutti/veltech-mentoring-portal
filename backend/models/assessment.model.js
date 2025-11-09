const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is our Assessment blueprint from Phase 1
const assessmentSchema = new Schema({
    
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student', // Links to a specific student
        required: true
    },

    academicYear: {
        type: String, // e.g., "2nd Year", "3rd Year"
        required: true
    },

    // --- 1. Academic Data (Mentor enters this) ---
    cgpa: {
        type: Number, // e.g., 8.2 [cite: 25]
        default: 0
    },
    attendancePercent: {
        type: Number, // e.g., 91 [cite: 26]
        default: 0
    },

    // --- 2. Co-Curricular Data (Mentor enters counts) --- [cite: 27]
    workshop: { 
        participated: { type: Number, default: 0 } 
    },
    seminar: { 
        participated: { type: Number, default: 0 } 
    },
    conference: {
        participated: { type: Number, default: 0 },
        presented: { type: Number, default: 0 },
        prizesWon: { type: Number, default: 0 }
    },
    symposium: {
        participated: { type: Number, default: 0 },
        presented: { type: Number, default: 0 },
        prizesWon: { type: Number, default: 0 }
    },
    profBodyActivities: {
        participated: { type: Number, default: 0 },
        presented: { type: Number, default: 0 },
        prizesWon: { type: Number, default: 0 }
    },
    talksLectures: { 
        participated: { type: Number, default: 0 } 
    },
    projectExpo: {
        presented: { type: Number, default: 0 },
        prizesWon: { type: Number, default: 0 }
    },

    // --- 3. Certification Data (Mentor enters counts) --- [cite: 28]
    nptelSwayam: {
        completed: { type: Number, default: 0 },
        miniprojects: { type: Number, default: 0 }
    },
    otherCertifications: {
        completed: { type: Number, default: 0 },
        miniprojects: { type: Number, default: 0 }
    },

    // --- 4. Extra-Curricular Data (Mentor enters counts) --- [cite: 29]
    culturals: {
        participated: { type: Number, default: 0 },
        prizesWon: { type: Number, default: 0 }
    },
    sports: {
        participated: { type: Number, default: 0 },
        prizesWon: { type: Number, default: 0 }
    },
    ncc: {
        participated: { type: Number, default: 0 },
        prizesWon: { type: Number, default:0 }
    },
    nss: {
        participated: { type: Number, default: 0 },
        prizesWon: { type: Number, default: 0 }
    },
    
    // --- 5. Remarks --- [cite: 37]
    remarks: {
        type: String,
        default: ""
    }

}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt'

// This creates the 'Assessment' model in our database
const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment; // Exports the model so our server can use it