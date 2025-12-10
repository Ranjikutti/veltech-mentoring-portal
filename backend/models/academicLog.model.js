const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const academicLogSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    semester: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['AP', 'PP'],
      required: true
    },
    problemIdentification: {
      type: String,
      required: true
    },
    problemDetails: {
      type: String
    },
    remedialAction: {
      type: String
    },
    improvementProgress: {
      type: String
    }
  },
  { timestamps: true }
);

const AcademicLog = mongoose.model('AcademicLog', academicLogSchema);

module.exports = AcademicLog;
