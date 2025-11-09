const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is our Student blueprint from Phase 1
const studentSchema = new Schema({
    
    name: {
        type: String,
        required: true
        // Your example: "Ranjith J"
    },

    registerNumber: {
        type: String,
        required: true,
        unique: true
        // Your example: "113123ug08084"
    },

    vmNumber: {
        type: String,
        required: true,
        unique: true
        // Your example: "15894" [user_prompt]
    },

    department: {
        type: String,
        required: true
        // e.g., "AI&DS"
    },

    batch: {
        type: String,
        required: true
        // e.g., "2023-2027"
    },

    // --- This is the important part ---

    currentMentor: {
        type: Schema.Types.ObjectId, // This is a special type
        ref: 'User', // This tells MongoDB to link to the 'User' model
        required: true
    },

    firstYearMentor: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Also links to the 'User' model
        required: false // Maybe not all students have this yet
    }

}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt'

// This creates the 'Student' model in our database
const Student = mongoose.model('Student', studentSchema);

module.exports = Student; // Exports the model so our server can use it