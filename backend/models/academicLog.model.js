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

    // Semester (ex: "Sem 1", "Sem 2", "Sem 3")
    semester: {
      type: String,
      required: true,
      trim: true
    },

    // Serial number inside each semester table
    slNo: {
      type: Number,
      required: false
    },

    date: {
      type: Date,
      required: true
    },

    // AP = Academic Problem, PP = Personal Problem
    type: {
      type: String,
      enum: ['AP', 'PP'],
      required: true
    },

    // Problem Identification (column 3)
    problemIdentification: {
      type: String,
      required: true,
      trim: true
    },

    // Detailed academic/personal issue (column 4)
    problemDetails: {
      type: String,
      default: ''
    },

    // Remedial action taken (column 5)
    remedialAction: {
      type: String,
      default: ''
    },

    // Improvement / Progress (column 6)
    improvementProgress: {
      type: String,
      default: ''
    },

    // Snapshot of student name (optional but useful)
    studentName: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Auto-generate studentName + slNo before saving
academicLogSchema.pre('save', async function (next) {
  // If studentName is empty → autofill
  if (!this.studentName) {
    try {
      const Student = mongoose.model('Student');
      const student = await Student.findById(this.studentId).select('name');
      if (student) {
        this.studentName = student.name;
      }
    } catch (error) {
      // Ignore, but don't break saving
    }
  }

  // slNo auto-increment within the same semester
  if (!this.slNo) {
    const AcademicLog = mongoose.model('AcademicLog');
    const count = await AcademicLog.countDocuments({
      studentId: this.studentId,
      semester: this.semester
    });
    this.slNo = count + 1;
  }

  next();
});

const AcademicLog = mongoose.model('AcademicLog', academicLogSchema);

module.exports = AcademicLog;
