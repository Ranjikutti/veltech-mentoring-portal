const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema(
  {
    doorNo: String,
    street: String,
    townOrVillage: String,
    taluk: String,
    state: String
  },
  { _id: false }
);

const marksSchema = new Schema(
  {
    english: { secured: Number, max: Number },
    mathematics: { secured: Number, max: Number },
    physics: { secured: Number, max: Number },
    chemistry: { secured: Number, max: Number },
    totalSecured: Number,
    totalMax: Number,
    board: String,
    yearOfPassing: String
  },
  { _id: false }
);

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    registerNumber: {
      type: String,
      required: true,
      unique: true
    },

    vmNumber: {
      type: String,
      required: true,
      unique: true
    },

    department: {
      type: String,
      required: true
    },

    batch: {
      type: String,
      required: true
    },

    section: {
      type: String
    },

    semester: {
      type: String
    },

    currentMentor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    firstYearMentor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },

    personal: {
      dateOfBirth: { type: Date },
      placeOfBirth: { type: String },
      motherTongue: { type: String }
    },

    parents: {
      fatherName: String,
      fatherQualification: String,
      fatherOccupation: String,
      motherName: String,
      motherQualification: String,
      motherOccupation: String
    },

    addresses: {
      permanent: addressSchema,
      local: addressSchema
    },

    contact: {
      contactNumber: String,
      landline: String,
      email: String
    },

    academics: {
      tenth: marksSchema,
      twelfth: marksSchema
    },

    health: {
      generalHealth: String,
      eyeSight: String,
      bloodGroup: String,
      otherDeficiency: String,
      illnessLastThreeYears: String
    },

    achievements: {
      past: String,
      present: String,
      features: String
    }
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
