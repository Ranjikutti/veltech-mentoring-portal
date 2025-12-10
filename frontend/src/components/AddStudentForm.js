import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from 'api';

function AddStudentForm({ onStudentAdded }) {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    vmNumber: '',
    batch: '2023-2027',
    mentorMtsNumber: '',
    section: '',
    semester: '',
    dateOfBirth: '',
    placeOfBirth: '',
    motherTongue: '',
    fatherName: '',
    fatherQualification: '',
    fatherOccupation: '',
    motherName: '',
    motherQualification: '',
    motherOccupation: '',
    permanentDoorNo: '',
    permanentStreet: '',
    permanentTownOrVillage: '',
    permanentTaluk: '',
    permanentState: '',
    localDoorNo: '',
    localStreet: '',
    localTownOrVillage: '',
    localTaluk: '',
    localState: '',
    contactNumber: '',
    landline: '',
    email: '',
    tenthBoard: '',
    tenthYearOfPassing: '',
    tenthEnglishSecured: '',
    tenthEnglishMax: '',
    tenthMathSecured: '',
    tenthMathMax: '',
    tenthPhysicsSecured: '',
    tenthPhysicsMax: '',
    tenthChemistrySecured: '',
    tenthChemistryMax: '',
    tenthTotalSecured: '',
    tenthTotalMax: '',
    twelfthBoard: '',
    twelfthYearOfPassing: '',
    twelfthEnglishSecured: '',
    twelfthEnglishMax: '',
    twelfthMathSecured: '',
    twelfthMathMax: '',
    twelfthPhysicsSecured: '',
    twelfthPhysicsMax: '',
    twelfthChemistrySecured: '',
    twelfthChemistryMax: '',
    twelfthTotalSecured: '',
    twelfthTotalMax: '',
    generalHealth: '',
    eyeSight: '',
    bloodGroup: '',
    otherDeficiency: '',
    illnessLastThreeYears: '',
    achievementsPast: '',
    achievementsPresent: '',
    achievementsFeatures: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const body = {
        name: formData.name.trim(),
        registerNumber: formData.registerNumber.trim(),
        vmNumber: formData.vmNumber.trim(),
        batch: formData.batch.trim(),
        department: user.department,
        section: formData.section.trim(),
        semester: formData.semester.trim(),
        mentorMtsNumber: formData.mentorMtsNumber.trim(),
        personal: {
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
          placeOfBirth: formData.placeOfBirth.trim(),
          motherTongue: formData.motherTongue.trim()
        },
        parents: {
          fatherName: formData.fatherName.trim(),
          fatherQualification: formData.fatherQualification.trim(),
          fatherOccupation: formData.fatherOccupation.trim(),
          motherName: formData.motherName.trim(),
          motherQualification: formData.motherQualification.trim(),
          motherOccupation: formData.motherOccupation.trim()
        },
        addresses: {
          permanent: {
            doorNo: formData.permanentDoorNo.trim(),
            street: formData.permanentStreet.trim(),
            townOrVillage: formData.permanentTownOrVillage.trim(),
            taluk: formData.permanentTaluk.trim(),
            state: formData.permanentState.trim()
          },
          local: {
            doorNo: formData.localDoorNo.trim(),
            street: formData.localStreet.trim(),
            townOrVillage: formData.localTownOrVillage.trim(),
            taluk: formData.localTaluk.trim(),
            state: formData.localState.trim()
          }
        },
        contact: {
          contactNumber: formData.contactNumber.trim(),
          landline: formData.landline.trim(),
          email: formData.email.trim()
        },
        academics: {
          tenth: {
            board: formData.tenthBoard.trim(),
            yearOfPassing: formData.tenthYearOfPassing.trim(),
            english: {
              secured: Number(formData.tenthEnglishSecured) || undefined,
              max: Number(formData.tenthEnglishMax) || undefined
            },
            mathematics: {
              secured: Number(formData.tenthMathSecured) || undefined,
              max: Number(formData.tenthMathMax) || undefined
            },
            physics: {
              secured: Number(formData.tenthPhysicsSecured) || undefined,
              max: Number(formData.tenthPhysicsMax) || undefined
            },
            chemistry: {
              secured: Number(formData.tenthChemistrySecured) || undefined,
              max: Number(formData.tenthChemistryMax) || undefined
            },
            totalSecured: Number(formData.tenthTotalSecured) || undefined,
            totalMax: Number(formData.tenthTotalMax) || undefined
          },
          twelfth: {
            board: formData.twelfthBoard.trim(),
            yearOfPassing: formData.twelfthYearOfPassing.trim(),
            english: {
              secured: Number(formData.twelfthEnglishSecured) || undefined,
              max: Number(formData.twelfthEnglishMax) || undefined
            },
            mathematics: {
              secured: Number(formData.twelfthMathSecured) || undefined,
              max: Number(formData.twelfthMathMax) || undefined
            },
            physics: {
              secured: Number(formData.twelfthPhysicsSecured) || undefined,
              max: Number(formData.twelfthPhysicsMax) || undefined
            },
            chemistry: {
              secured: Number(formData.twelfthChemistrySecured) || undefined,
              max: Number(formData.twelfthChemistryMax) || undefined
            },
            totalSecured: Number(formData.twelfthTotalSecured) || undefined,
            totalMax: Number(formData.twelfthTotalMax) || undefined
          }
        },
        health: {
          generalHealth: formData.generalHealth.trim(),
          eyeSight: formData.eyeSight.trim(),
          bloodGroup: formData.bloodGroup.trim(),
          otherDeficiency: formData.otherDeficiency.trim(),
          illnessLastThreeYears: formData.illnessLastThreeYears.trim()
        },
        achievements: {
          past: formData.achievementsPast.trim(),
          present: formData.achievementsPresent.trim(),
          features: formData.achievementsFeatures.trim()
        }
      };

      const response = await api.post('/students', body);
      setMessage(`Success! Student ${response.data.name} created.`);
      if (onStudentAdded) {
        onStudentAdded(response.data);
      }

      setFormData({
        name: '',
        registerNumber: '',
        vmNumber: '',
        batch: '2023-2027',
        mentorMtsNumber: '',
        section: '',
        semester: '',
        dateOfBirth: '',
        placeOfBirth: '',
        motherTongue: '',
        fatherName: '',
        fatherQualification: '',
        fatherOccupation: '',
        motherName: '',
        motherQualification: '',
        motherOccupation: '',
        permanentDoorNo: '',
        permanentStreet: '',
        permanentTownOrVillage: '',
        permanentTaluk: '',
        permanentState: '',
        localDoorNo: '',
        localStreet: '',
        localTownOrVillage: '',
        localTaluk: '',
        localState: '',
        contactNumber: '',
        landline: '',
        email: '',
        tenthBoard: '',
        tenthYearOfPassing: '',
        tenthEnglishSecured: '',
        tenthEnglishMax: '',
        tenthMathSecured: '',
        tenthMathMax: '',
        tenthPhysicsSecured: '',
        tenthPhysicsMax: '',
        tenthChemistrySecured: '',
        tenthChemistryMax: '',
        tenthTotalSecured: '',
        tenthTotalMax: '',
        twelfthBoard: '',
        twelfthYearOfPassing: '',
        twelfthEnglishSecured: '',
        twelfthEnglishMax: '',
        twelfthMathSecured: '',
        twelfthMathMax: '',
        twelfthPhysicsSecured: '',
        twelfthPhysicsMax: '',
        twelfthChemistrySecured: '',
        twelfthChemistryMax: '',
        twelfthTotalSecured: '',
        twelfthTotalMax: '',
        generalHealth: '',
        eyeSight: '',
        bloodGroup: '',
        otherDeficiency: '',
        illnessLastThreeYears: '',
        achievementsPast: '',
        achievementsPresent: '',
        achievementsFeatures: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="form-card"
      style={{ background: 'rgba(2, 6, 23, .55)', marginTop: '16px' }}
    >
      <h4 className="form-title">Add New Student</h4>

      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label className="label">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div className="field">
          <label className="label">Register Number</label>
          <input
            type="text"
            name="registerNumber"
            value={formData.registerNumber}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div className="field">
          <label className="label">VM Number</label>
          <input
            type="text"
            name="vmNumber"
            value={formData.vmNumber}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div className="field">
          <label className="label">Batch (e.g., 2023-2027)</label>
          <input
            type="text"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div className="field">
          <label className="label">Section</label>
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Semester</label>
          <input
            type="text"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="label">Mentor's MTS Number</label>
          <input
            type="text"
            name="mentorMtsNumber"
            value={formData.mentorMtsNumber}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
      </div>

      <h5 className="form-title" style={{ marginTop: 18 }}>Personal Details</h5>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label className="label">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Place of Birth</label>
          <input
            type="text"
            name="placeOfBirth"
            value={formData.placeOfBirth}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Mother Tongue</label>
          <input
            type="text"
            name="motherTongue"
            value={formData.motherTongue}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <h5 className="form-title" style={{ marginTop: 18 }}>Parents</h5>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label className="label">Father Name</label>
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Father Qualification</label>
          <input
            type="text"
            name="fatherQualification"
            value={formData.fatherQualification}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Father Occupation</label>
          <input
            type="text"
            name="fatherOccupation"
            value={formData.fatherOccupation}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Mother Name</label>
          <input
            type="text"
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Mother Qualification</label>
          <input
            type="text"
            name="motherQualification"
            value={formData.motherQualification}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Mother Occupation</label>
          <input
            type="text"
            name="motherOccupation"
            value={formData.motherOccupation}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <h5 className="form-title" style={{ marginTop: 18 }}>Permanent Address</h5>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label className="label">Door No</label>
          <input
            type="text"
            name="permanentDoorNo"
            value={formData.permanentDoorNo}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Street</label>
          <input
            type="text"
            name="permanentStreet"
            value={formData.permanentStreet}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Town/Village</label>
          <input
            type="text"
            name="permanentTownOrVillage"
            value={formData.permanentTownOrVillage}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Taluk</label>
          <input
            type="text"
            name="permanentTaluk"
            value={formData.permanentTaluk}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">State</label>
          <input
            type="text"
            name="permanentState"
            value={formData.permanentState}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <h5 className="form-title" style={{ marginTop: 18 }}>Local Address</h5>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label className="label">Door No</label>
          <input
            type="text"
            name="localDoorNo"
            value={formData.localDoorNo}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Street</label>
          <input
            type="text"
            name="localStreet"
            value={formData.localStreet}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Town/Village</label>
          <input
            type="text"
            name="localTownOrVillage"
            value={formData.localTownOrVillage}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Taluk</label>
          <input
            type="text"
            name="localTaluk"
            value={formData.localTaluk}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">State</label>
          <input
            type="text"
            name="localState"
            value={formData.localState}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <h5 className="form-title" style={{ marginTop: 18 }}>Contact & Health</h5>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label className="label">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Landline</label>
          <input
            type="text"
            name="landline"
            value={formData.landline}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">General Health</label>
          <input
            type="text"
            name="generalHealth"
            value={formData.generalHealth}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Eye Sight</label>
          <input
            type="text"
            name="eyeSight"
            value={formData.eyeSight}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Blood Group</label>
          <input
            type="text"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Other Deficiency</label>
          <input
            type="text"
            name="otherDeficiency"
            value={formData.otherDeficiency}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Illness (Last 3 Years)</label>
          <input
            type="text"
            name="illnessLastThreeYears"
            value={formData.illnessLastThreeYears}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <h5 className="form-title" style={{ marginTop: 18 }}>Academics – 10th</h5>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label className="label">Board</label>
          <input
            type="text"
            name="tenthBoard"
            value={formData.tenthBoard}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Year of Passing</label>
          <input
            type="text"
            name="tenthYearOfPassing"
            value={formData.tenthYearOfPassing}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field">
          <label className="label">English (Secured)</label>
          <input
            type="text"
            name="tenthEnglishSecured"
            value={formData.tenthEnglishSecured}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">English (Max)</label>
          <input
            type="text"
            name="tenthEnglishMax"
            value={formData.tenthEnglishMax}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field">
          <label className="label">Maths (Secured)</label>
          <input
            type="text"
            name="tenthMathSecured"
            value={formData.tenthMathSecured}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Maths (Max)</label>
          <input
            type="text"
            name="tenthMathMax"
            value={formData.tenthMathMax}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field">
          <label className="label">Physics (Secured)</label>
          <input
            type="text"
            name="tenthPhysicsSecured"
            value={formData.tenthPhysicsSecured}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Physics (Max)</label>
          <input
            type="text"
            name="tenthPhysicsMax"
            value={formData.tenthPhysicsMax}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field">
          <label className="label">Chemistry (Secured)</label>
          <input
            type="text"
            name="tenthChemistrySecured"
            value={formData.tenthChemistrySecured}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Chemistry (Max)</label>
          <input
            type="text"
            name="tenthChemistryMax"
            value={formData.tenthChemistryMax}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field">
          <label className="label">Total Secured</label>
          <input
            type="text"
            name="tenthTotalSecured"
            value={formData.tenthTotalSecured}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Total Max</label>
          <input
            type="text"
            name="tenthTotalMax"
            value={formData.tenthTotalMax}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <h5 className="form-title" style={{ marginTop: 18 }}>Academics – 12th</h5>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label className="label">Board</label>
          <input
            type="text"
            name="twelfthBoard"
            value={formData.twelfthBoard}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Year of Passing</label>
          <input
            type="text"
            name="twelfthYearOfPassing"
            value={formData.twelfthYearOfPassing}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field">
          <label className="label">English (Secured)</label>
          <input
            type="text"
            name="twelfthEnglishSecured"
            value={formData.twelfthEnglishSecured}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">English (Max)</label>
          <input
            type="text"
            name="twelfthEnglishMax"
            value={formData.twelfthEnglishMax}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field">
          <label className="label">Maths (Secured)</label>
          <input
            type="text"
            name="twelfthMathSecured"
            value={formData.twelfthMathSecured}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Maths (Max)</label>
          <input
            type="text"
            name="twelfthMathMax"
            value={formData.twelfthMathMax}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field">
          <label className="label">Physics (Secured)</label>
          <input
            type="text"
            name="twelfthPhysicsSecured"
            value={formData.twelfthPhysicsSecured}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Physics (Max)</label>
          <input
            type="text"
            name="twelfthPhysicsMax"
            value={formData.twelfthPhysicsMax}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field">
          <label className="label">Chemistry (Secured)</label>
          <input
            type="text"
            name="twelfthChemistrySecured"
            value={formData.twelfthChemistrySecured}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Chemistry (Max)</label>
          <input
            type="text"
            name="twelfthChemistryMax"
            value={formData.twelfthChemistryMax}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="field">
          <label className="label">Total Secured</label>
          <input
            type="text"
            name="twelfthTotalSecured"
            value={formData.twelfthTotalSecured}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="field">
          <label className="label">Total Max</label>
          <input
            type="text"
            name="twelfthTotalMax"
            value={formData.twelfthTotalMax}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <h5 className="form-title" style={{ marginTop: 18 }}>Achievements</h5>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="field">
          <label className="label">Past Achievements</label>
          <textarea
            name="achievementsPast"
            value={formData.achievementsPast}
            onChange={handleChange}
            className="input"
            rows={2}
          />
        </div>
        <div className="field">
          <label className="label">Present Achievements</label>
          <textarea
            name="achievementsPresent"
            value={formData.achievementsPresent}
            onChange={handleChange}
            className="input"
            rows={2}
          />
        </div>
        <div className="field">
          <label className="label">Features / Remarks</label>
          <textarea
            name="achievementsFeatures"
            value={formData.achievementsFeatures}
            onChange={handleChange}
            className="input"
            rows={2}
          />
        </div>
      </div>

      <button type="submit" className="form-btn" disabled={saving} style={{ marginTop: 20 }}>
        {saving ? 'Saving...' : 'Add Student'}
      </button>
      <div className="msg-wrap">
        {error && <p className="msg-err">{error}</p>}
        {message && <p className="msg-ok">{message}</p>}
      </div>
    </form>
  );
}

export default AddStudentForm;
