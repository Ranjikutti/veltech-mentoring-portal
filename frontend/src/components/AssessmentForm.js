import React, { useState, useEffect } from 'react'; // Added useEffect
import api from 'api';

// --- I've added your dark mode styles to the form ---
const styles = `
  .form-card {
    border: 1px solid rgba(255, 255, 255, .12);
    background: rgba(2, 6, 23, .45);
    border-radius: 14px;
    padding: 18px;
    animation: pop .3s ease;
  }
  .form-title {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 16px 0;
  }
  .form-grid {
    display: grid;
    gap: 14px;
  }
  @media (min-width: 720px) {
    .form-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (min-width: 980px) {
    .form-grid { grid-template-columns: 1fr 1fr 1fr; }
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .label {
    font-size: 13px;
    color: #cbd5e1;
  }
  .input {
    height: 38px;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, .35);
    background: rgba(255, 255, 255, .08);
    padding: 0 10px;
    color: #e5e7eb;
    outline: none;
    transition: border .2s, box-shadow .2s;
  }
  .input:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56, 189, 248, .25);
  }
  .form-group {
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 8px;
    padding: 10px;
    background: rgba(255, 255, 255, .03);
  }
  .form-group-title {
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    text-transform: uppercase;
    margin: 0 0 10px 0;
  }
  .form-group-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 1fr 1fr;
  }
  .form-btn {
    height: 38px;
    padding: 0 16px;
    border: none;
    border-radius: 10px;
    background: #0ea5e9;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s, box-shadow .2s, transform .1s;
    margin-top: 10px;
  }
  .form-btn:hover {
    background: #38bdf8;
    box-shadow: 0 8px 25px rgba(14, 165, 233, .25);
  }
  .form-btn:active { transform: translateY(1px); }
  .msg-wrap { margin-top: 10px; }
  .msg-err { font-size: 13px; color: #fca5a5; }
  .msg-ok { font-size: 13px; color: #4ade80; }
  @keyframes pop{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}
`;

// --- NEW: Helper function to get the default empty form state ---
const getDefaultFormData = () => ({
  academicYear: '1st Year - Sem 1',
  cgpa: 0,
  attendancePercent: 0,
  workshopP: 0, seminarP: 0,
  conferenceP: 0, conferencePr: 0, conferenceW: 0,
  symposiumP: 0, symposiumPr: 0, symposiumW: 0,
  profBodyP: 0, profBodyPr: 0, profBodyW: 0,
  talksP: 0, projectExpoPr: 0, projectExpoW: 0,
  nptelC: 0, nptelMp: 0,
  otherCertC: 0, otherCertMp: 0,
  culturalsP: 0, culturalsW: 0,
  sportsP: 0, sportsW: 0,
  nccP: 0, nccW: 0,
  nssP: 0, nssW: 0,
});

// --- NEW: Helper function to flatten data for the form ---
// This turns { workshop: { participated: 5 } } into { workshopP: 5 }
const flattenData = (data) => ({
  academicYear: data.academicYear || '1st Year - Sem 1',
  cgpa: data.cgpa || 0,
  attendancePercent: data.attendancePercent || 0,
  workshopP: data.workshop?.participated || 0,
  seminarP: data.seminar?.participated || 0,
  conferenceP: data.conference?.participated || 0,
  conferencePr: data.conference?.presented || 0,
  conferenceW: data.conference?.prizesWon || 0,
  symposiumP: data.symposium?.participated || 0,
  symposiumPr: data.symposium?.presented || 0,
  symposiumW: data.symposium?.prizesWon || 0,
  profBodyP: data.profBodyActivities?.participated || 0,
  profBodyPr: data.profBodyActivities?.presented || 0,
  profBodyW: data.profBodyActivities?.prizesWon || 0,
  talksP: data.talksLectures?.participated || 0,
  projectExpoPr: data.projectExpo?.presented || 0,
  projectExpoW: data.projectExpo?.prizesWon || 0,
  nptelC: data.nptelSwayam?.completed || 0,
  nptelMp: data.nptelSwayam?.miniprojects || 0,
  otherCertC: data.otherCertifications?.completed || 0,
  otherCertMp: data.otherCertifications?.miniprojects || 0,
  culturalsP: data.culturals?.participated || 0,
  culturalsW: data.culturals?.prizesWon || 0,
  sportsP: data.sports?.participated || 0,
  sportsW: data.sports?.prizesWon || 0,
  nccP: data.ncc?.participated || 0,
  nccW: data.ncc?.prizesWon || 0,
  nssP: data.nss?.participated || 0,
  nssW: data.nss?.prizesWon || 0,
});


// --- PROPS ARE UPDATED ---
function AssessmentForm({ studentId, onAssessmentAdded, onCancel, assessmentToEdit = null }) {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // --- 1. Set up state for ALL fields ---
  // It now starts empty or with the data to edit
  const [formData, setFormData] = useState(
    assessmentToEdit ? flattenData(assessmentToEdit) : getDefaultFormData()
  );

  // --- NEW: useEffect to fill form when 'assessmentToEdit' prop changes ---
  useEffect(() => {
    if (assessmentToEdit) {
      setFormData(flattenData(assessmentToEdit));
    } else {
      setFormData(getDefaultFormData());
    }
  }, [assessmentToEdit]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      // --- (Build the body - this logic is unchanged) ---
      const body = {
        studentId: studentId,
        academicYear: formData.academicYear,
        cgpa: parseFloat(formData.cgpa) || 0,
        attendancePercent: parseInt(formData.attendancePercent) || 0,
        workshop: { participated: parseInt(formData.workshopP) || 0 },
        seminar: { participated: parseInt(formData.seminarP) || 0 },
        conference: {
          participated: parseInt(formData.conferenceP) || 0,
          presented: parseInt(formData.conferencePr) || 0,
          prizesWon: parseInt(formData.conferenceW) || 0
        },
        symposium: {
          participated: parseInt(formData.symposiumP) || 0,
          presented: parseInt(formData.symposiumPr) || 0,
          prizesWon: parseInt(formData.symposiumW) || 0
        },
        profBodyActivities: {
          participated: parseInt(formData.profBodyP) || 0,
          presented: parseInt(formData.profBodyPr) || 0,
          prizesWon: parseInt(formData.profBodyW) || 0
        },
        talksLectures: { participated: parseInt(formData.talksP) || 0 },
        projectExpo: {
          presented: parseInt(formData.projectExpoPr) || 0,
          prizesWon: parseInt(formData.projectExpoW) || 0
        },
        nptelSwayam: {
          completed: parseInt(formData.nptelC) || 0,
          miniprojects: parseInt(formData.nptelMp) || 0
        },
        otherCertifications: {
          completed: parseInt(formData.otherCertC) || 0,
          miniprojects: parseInt(formData.otherCertMp) || 0
        },
        culturals: {
          participated: parseInt(formData.culturalsP) || 0,
          prizesWon: parseInt(formData.culturalsW) || 0
        },
        sports: {
          participated: parseInt(formData.sportsP) || 0,
          prizesWon: parseInt(formData.sportsW) || 0
        },
        ncc: {
          participated: parseInt(formData.nccP) || 0,
          prizesWon: parseInt(formData.nccW) || 0
        },
        nss: {
          participated: parseInt(formData.nssP) || 0,
          prizesWon: parseInt(formData.nssW) || 0
        }
      };

      const response = await api.post('/assessments', body);
      
      setMessage(assessmentToEdit ? 'Success! Assessment updated.' : 'Success! Assessment saved.');
      
      // Call the onAssessmentAdded prop (which now hides the form)
      onAssessmentAdded(); 

    } catch (err) {
      setError('Failed to save assessment. Please check all fields.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <style>{styles}</style>
      
      {/* --- NEW: Dynamic Title --- */}
      <h4 className="form-title">
        {assessmentToEdit ? `Editing: ${assessmentToEdit.academicYear}` : 'Add New Assessment'}
      </h4>
      
      <div className="form-grid">

        {/* --- Academics --- */}
        <div className="field">
          <label className="label">Academic Year</label>
          {/* --- NEW: Disabled when editing --- */}
          <input 
            type="text" 
            name="academicYear" 
            value={formData.academicYear} 
            onChange={handleChange} 
            className="input" 
            disabled={!!assessmentToEdit} // Disable if in edit mode
          />
        </div>
        <div className="field">
          <label className="label">CGPA (e.g., 8.7)</label>
          <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} className="input" />
        </div>
        <div className="field">
          <label className="label">Attendance % (e.g., 92)</label>
          <input type="number" name="attendancePercent" value={formData.attendancePercent} onChange={handleChange} className="input" />
        </div>

        {/* --- Co-Curricular --- */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <h5 className="form-group-title">Co-Curricular (Max 15)</h5>
          <p style={{fontSize: 11, color: '#94a3b8', margin: '-8px 0 10px 0'}}>P: Participated, Pr: Presented, W: Won</p>
          <div className="form-group-grid">
            <div className="field">
              <label className="label">Workshop (P)</label>
              <input type="number" name="workshopP" value={formData.workshopP} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Seminar (P)</label>
              <input type="number" name="seminarP" value={formData.seminarP} onChange={handleChange} className="input" />
            </div>
             <div className="field">
              <label className="label">Talks (P)</label>
              <input type="number" name="talksP" value={formData.talksP} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Conference (P)</label>
              <input type="number" name="conferenceP" value={formData.conferenceP} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Conference (Pr)</label>
              <input type="number" name="conferencePr" value={formData.conferencePr} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Conference (W)</label>
              <input type="number" name="conferenceW" value={formData.conferenceW} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Symposium (P)</label>
              <input type="number" name="symposiumP" value={formData.symposiumP} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Symposium (Pr)</label>
              <input type="number" name="symposiumPr" value={formData.symposiumPr} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Symposium (W)</label>
              <input type="number" name="symposiumW" value={formData.symposiumW} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Prof. Body (P)</label>
              <input type="number" name="profBodyP" value={formData.profBodyP} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Prof. Body (Pr)</label>
              <input type="number" name="profBodyPr" value={formData.profBodyPr} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Prof. Body (W)</label>
              <input type="number" name="profBodyW" value={formData.profBodyW} onChange={handleChange} className="input" />
            </div>
             <div className="field">
              <label className="label">Project Expo (Pr)</label>
              <input type="number" name="projectExpoPr" value={formData.projectExpoPr} onChange={handleChange} className="input" />
            </div>
             <div className="field">
              <label className="label">Project Expo (W)</label>
              <input type="number" name="projectExpoW" value={formData.projectExpoW} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

        {/* --- Certifications --- */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <h5 className="form-group-title">Certifications (Max 10)</h5>
           <p style={{fontSize: 11, color: '#94a3b8', margin: '-8px 0 10px 0'}}>C: Completed, MP: Mini-Project</p>
          <div className="form-group-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
            <div className="field">
              <label className="label">NPTEL/SWAYAM (C)</label>
              <input type="number" name="nptelC" value={formData.nptelC} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">NPTEL/SWAYAM (MP)</label>
              <input type="number" name="nptelMp" value={formData.nptelMp} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Other Certs (C)</label>
              <input type="number" name="otherCertC" value={formData.otherCertC} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Other Certs (MP)</label>
              <input type="number" name="otherCertMp" value={formData.otherCertMp} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

        {/* --- Extra-Curricular --- */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <h5 className="form-group-title">Extra-Curricular (Max 12)</h5>
           <p style={{fontSize: 11, color: '#94a3b8', margin: '-8px 0 10px 0'}}>P: Participated, W: Won</p>
          <div className="form-group-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
            <div className="field">
              <label className="label">Culturals (P)</label>
              <input type="number" name="culturalsP" value={formData.culturalsP} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Culturals (W)</label>
              <input type="number" name="culturalsW" value={formData.culturalsW} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Sports (P)</label>
              <input type="number" name="sportsP" value={formData.sportsP} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">Sports (W)</label>
              <input type="number" name="sportsW" value={formData.sportsW} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">NCC (P)</label>
              <input type="number" name="nccP" value={formData.nccP} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">NCC (W)</label>
              <input type="number" name="nccW" value={formData.nccW} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">NSS (P)</label>
              <input type="number" name="nssP" value={formData.nssP} onChange={handleChange} className="input" />
            </div>
            <div className="field">
              <label className="label">NSS (W)</label>

              <input type="number" name="nssW" value={formData.nssW} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

      </div>

      {/* --- NEW: Button Group --- */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="form-btn">
          {assessmentToEdit ? 'Update Assessment' : 'Save Assessment'}
        </button>
        <button type="button" onClick={onCancel} className="form-btn" style={{ background: '#64748b' }}>
          Cancel
        </button>
      </div>
      
      <div className="msg-wrap">
        {error && <p className="msg-err">{error}</p>}
        {message && <p className="msg-ok">{message}</p>}
      </div>
    </form>
  );
}

export default AssessmentForm;