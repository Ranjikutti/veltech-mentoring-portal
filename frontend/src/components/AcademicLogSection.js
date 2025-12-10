import React, { useEffect, useState } from 'react';
import api from 'api';

function AcademicLogSection({ studentId }) {
  const [logs, setLogs] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    semester: '',
    date: '',
    type: 'AP',
    problemIdentification: '',
    problemDetails: '',
    remedialAction: '',
    improvementProgress: ''
  });

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      const res = await api.get(`/academic-logs/${studentId}`, { params });
      setLogs(res.data || []);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load academic logs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) loadLogs();
  }, [studentId, semesterFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const body = {
        studentId,
        semester: form.semester.trim(),
        date: form.date,
        type: form.type,
        problemIdentification: form.problemIdentification.trim(),
        problemDetails: form.problemDetails.trim(),
        remedialAction: form.remedialAction.trim(),
        improvementProgress: form.improvementProgress.trim()
      };
      const res = await api.post('/academic-logs', body);
      setSuccess('Academic log added successfully');
      setForm({
        semester: '',
        date: '',
        type: 'AP',
        problemIdentification: '',
        problemDetails: '',
        remedialAction: '',
        improvementProgress: ''
      });
      setLogs((prev) => [...prev, res.data]);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to add academic log';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this academic log?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/academic-logs/${id}`);
      setLogs((prev) => prev.filter((log) => log._id !== id));
      setSuccess('Academic log deleted');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete log';
      setError(msg);
    }
  };

  return (
    <div className="section" style={{ gridColumn: '1 / -1' }}>
      <div className="card-head" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="card-title">Academic / Personal Problems Log</h3>
          <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
            Record AP/PP issues, actions taken and progress for each semester.
          </p>
        </div>
      </div>

      <div className="card-body">
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            marginBottom: 16,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ minWidth: 220 }}>
            <label className="label" style={{ fontSize: 12 }}>
              Filter by Semester
            </label>
            <input
              className="input"
              placeholder="e.g., Sem 1, 1, I"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            />
          </div>
          <button
            className="form-btn"
            type="button"
            onClick={loadLogs}
            disabled={loading}
            style={{ padding: '8px 18px', fontSize: 12, marginBottom: 2 }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1.1fr)',
            gap: 18,
            alignItems: 'flex-start'
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="form-card"
            style={{ background: 'rgba(15,23,42,0.7)', margin: 0 }}
          >
            <h4 className="form-title">Add Entry</h4>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="field">
                <label className="label">Semester</label>
                <input
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className="input"
                  placeholder="Sem 1 / 1 / I"
                  required
                />
              </div>
              <div className="field">
                <label className="label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div className="field">
                <label className="label">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="AP">Academic Problem (AP)</option>
                  <option value="PP">Personal Problem (PP)</option>
                </select>
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="field">
                <label className="label">Problem Identification</label>
                <textarea
                  name="problemIdentification"
                  value={form.problemIdentification}
                  onChange={handleChange}
                  className="input"
                  rows={2}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Problem Details</label>
                <textarea
                  name="problemDetails"
                  value={form.problemDetails}
                  onChange={handleChange}
                  className="input"
                  rows={2}
                />
              </div>
              <div className="field">
                <label className="label">Remedial Action</label>
                <textarea
                  name="remedialAction"
                  value={form.remedialAction}
                  onChange={handleChange}
                  className="input"
                  rows={2}
                />
              </div>
              <div className="field">
                <label className="label">Improvement / Progress</label>
                <textarea
                  name="improvementProgress"
                  value={form.improvementProgress}
                  onChange={handleChange}
                  className="input"
                  rows={2}
                />
              </div>
            </div>

            <button
              type="submit"
              className="form-btn"
              disabled={saving}
              style={{ marginTop: 12 }}
            >
              {saving ? 'Saving...' : 'Add Log'}
            </button>

            <div className="msg-wrap" style={{ marginTop: 8 }}>
              {error && <p className="msg-err">{error}</p>}
              {success && <p className="msg-ok">{success}</p>}
            </div>
          </form>

          <div className="form-card" style={{ background: 'rgba(15,23,42,0.7)', margin: 0 }}>
            <h4 className="form-title">Logged Entries</h4>
            {logs.length === 0 && !loading && (
              <p className="muted" style={{ fontSize: 13 }}>
                No entries yet for this student.
              </p>
            )}
            {logs.length > 0 && (
              <div className="table-wrap" style={{ marginTop: 8, overflowX: 'auto' }}>
                <table className="table text-sm" style={{ width: '100%', fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Sem</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Problem</th>
                      <th>Remedial Action</th>
                      <th>Progress</th>
                      <th>By</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id}>
                        <td>{log.semester}</td>
                        <td>{log.date ? new Date(log.date).toLocaleDateString() : ''}</td>
                        <td>{log.type}</td>
                        <td>{log.problemIdentification}</td>
                        <td>{log.remedialAction}</td>
                        <td>{log.improvementProgress}</td>
                        <td>{log.mentorId?.name || '-'}</td>
                        <td>
                          <button
                            type="button"
                            className="form-btn"
                            onClick={() => handleDelete(log._id)}
                            style={{ background: '#dc2626', padding: '4px 10px', fontSize: 11 }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademicLogSection;
