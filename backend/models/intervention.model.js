const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is our Intervention blueprint from Phase 1
const interventionSchema = new Schema({
    
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student', // Links to the student
        required: true
    },

    mentorId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Links to the mentor who took the action
        required: true
    },

    monthYear: {
        type: String, // As shown in the PDF
        required: true
        // e.g., "Oct 2025"
    },

    category: {
        type: String,
        required: true,
        enum: ['Slow learner', 'Fast learner'] // From the PDF
    },

    actionTaken: {
        type: String, // "Action Taken" column
        required: true
    },

    impact: {
        type: String, // "Impact" column
        required: true
    }

}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt'

// This creates the 'Intervention' model in our database
const Intervention = mongoose.model('Intervention', interventionSchema);

module.exports = Intervention; // Exports the model