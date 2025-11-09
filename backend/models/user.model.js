const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is our User blueprint from Phase 1
const userSchema = new Schema({
    
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true  // Makes sure no two users have the same email
    },

    password: {
        type: String,
        required: true
    },
    
    mtsNumber: {
        type: String,
        required: true,
        unique: true  // Your example: "mts001"
    },

    designation: {
        type: String,
        required: true  // Your example: "Assistant Professor"
    },

    department: {
        type: String,
        required: true  // Yourexample: "AI&DS", "MECH"
    },

    role: {
        type: String,
        required: true,
        enum: ['mentor', 'hod'], // Can only be 'mentor' or 'hod'
        default: 'mentor'
    }

}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' fields

// This creates the 'User' model in our database
const User = mongoose.model('User', userSchema);

module.exports = User; // Exports the model so our server can use it