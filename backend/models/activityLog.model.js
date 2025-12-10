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

    slNo: {
      type: Number,
      required: false
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

    // Auto-filled based on category group
    categoryGroup: {
      type: String,
      enum: ['Co-Curricular', 'Extra-Curricular'],
      default: ''
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    notes: {
      type: String,
      default: ''
    },

    studentName: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Pre-save hook for auto-filling fields
activityLogSchema.pre('save', async function (next) {
  try {
    // Auto-fill student name if missing
    if (!this.studentName) {
      const Student = mongoose.model('Student');
      const student = await Student.findById(this.studentId).select('name');
      if (student) {
        this.studentName = student.name;
      }
    }

    // Auto-assign category group
    const coCurricular = [
      'Conference',
      'Journal Publication',
      'Book Publication',
      'Patent',
      'Research Proposal',
      'Mini Project',
      'Workshop',
      'Industrial Visit',
      'Inplant Training'
    ];

    const extraCurricular = ['Culturals', 'Sports'];

    if (coCurricular.includes(this.category)) {
      this.categoryGroup = 'Co-Curricular';
    } else if (extraCurricular.includes(this.category)) {
      this.categoryGroup = 'Extra-Curricular';
    }

    // Auto-increment slNo per semester
    if (!this.slNo) {
      const ActivityLog = mongoose.model('ActivityLog');
      const count = await ActivityLog.countDocuments({
        studentId: this.studentId,
        semester: this.semester
      });
      this.slNo = count + 1;
    }
  } catch (err) {
    // Avoid breaking if any fetch fails
  }

  next();
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
