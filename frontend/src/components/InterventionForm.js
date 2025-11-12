import React, { useState, useEffect } from 'react';
import api from 'api';

// --- NEW PROPS ADDED: onCancel, interventionToEdit ---
function InterventionForm({ studentId, onInterventionAdded, onCancel, interventionToEdit = null }) {
  
  // --- UPDATED: State now pre-fills if editing ---
  const [formData, setFormData] = useState({
    monthYear: interventionToEdit ? interventionToEdit.monthYear : 'Nov 2025',
    category: interventionToEdit ? interventionToEdit.category : 'Slow learner',
    actionTaken: interventionToEdit ? interventionToEdit.actionTaken : '',
    impact: interventionToEdit ? interventionToEdit.impact : ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // --- NEW: useEffect to fill form when prop changes ---
  useEffect(() => {
    if (interventionToEdit) {
      setFormData({
        monthYear: interventionToEdit.monthYear,
        category: interventionToEdit.category,
        actionTaken: interventionToEdit.actionTaken,
        impact: interventionToEdit.impact
      });
    } else {
      // Reset form if we are creating a new one
      setFormData({
        monthYear: 'Nov 2025',
        category: 'Slow learner',
        actionTaken: '',
        impact: ''
      });
    }
  }, [interventionToEdit]);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- UPDATED: handleSubmit now handles both POST and PUT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.actionTaken || !formData.impact) {
      setError('Please fill out both Action Taken and Impact.');
      return;
    }

    try {
      const body = { ...formData, studentId };

      if (interventionToEdit) {
        // --- EDIT MODE ---
        // Call our new 'PUT /api/interventions/:id' route!
        await api.put(`/interventions/${interventionToEdit._id}`, body);
        setMessage('Success! Intervention log updated.');
      } else {
        // --- CREATE MODE ---
        // Call our 'POST /api/interventions' route!
        await api.post('/interventions', body);
        setMessage('Success! Intervention log saved.');
      }

      // Tell the parent page to refresh its data
      onInterventionAdded();
      
      // Clear the form (only if we are not in edit mode)
      if (!interventionToEdit) {
        setFormData({
          ...formData,
          actionTaken: '',
          impact: ''
        });
      }

    } catch (err) {
      setError('Failed to save intervention.');
    }
  };

  return (
    // Your styling is kept, but I've added the new buttons
    <form onSubmit={handleSubmit} style={{ border: '2px solid green', padding: '10px', marginTop: '15px' }}>
      
      {/* --- NEW: Dynamic Title --- */}
      <h4>{interventionToEdit ? 'Edit Intervention' : 'Add Intervention (Sheet 2)'}</h4>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div>
        <label>Month/Year: </label>
        <input type="text" name="monthYear" value={formData.monthYear} onChange={handleChange} />
      </div>
      <div>
        <label>Category: </label>
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="Slow learner">Slow learner</option>
          <option value="Fast learner">Fast learner</option>
        </select>
      </div>
      <div>
        <label>Action Taken: </label>
        <textarea name="actionTaken" value={formData.actionTaken} onChange={handleChange} />
      </div>
      <div>
        <label>Impact: </label>
        <textarea name="impact" value={formData.impact} onChange={handleChange} />
      </div>

      {/* --- NEW: Button Group --- */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="submit" className="form-btn" style={{ margin: 0 }}>
          {interventionToEdit ? 'Update Log' : 'Save Intervention'}
        </button>
        <button type="button" onClick={onCancel} className="form-btn" style={{ margin: 0, background: '#64748b' }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default InterventionForm;