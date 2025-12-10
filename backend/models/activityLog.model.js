const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activityLogSchema = new Schema(
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
    category: {
      type: String,
      enum: [
        'Conference',
        'Journal Publication',
        'Book Publication',
        'Patent',
        'Research Proposal',
        'Mini Project',
        'Workshop',
        'Industrial Visit',
        'Inplant Training',
        'Culturals',
        'Sports'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
