import React, { useEffect, useState } from 'react';
import api from 'api';

const CATEGORY_OPTIONS = [
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
];

function ActivityLogSection({ studentId }) {
  const [activities, setActivities] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    semester: '',
    date: '',
    category: 'Conference',
    title: '',
    notes: ''
  });

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.get(`/activity-logs/${studentId}`, { params });
      setActivities(res.data || []);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load activities';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) loadActivities();
  }, [studentId, semesterFilter, categoryFilter]);

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
        category: form.category,
        title: form.title.trim(),
        notes: form.notes.trim()
      };
      const res = await api.post('/activity-logs', body);
      setSuccess('Activity added successfully');
      setForm({
        semester: '',
        date: '',
        category: 'Conference',
        title: '',
        notes: ''
      });
      setActivities((prev) => [...prev, res.data]);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to add activity';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/activity-logs/${id}`);
      setActivities((prev) => prev.filter((a) => a._id !== id));
      setSuccess('Activity deleted');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete activity';
      setError(msg);
    }
  };

  return (
    <div className="section">
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 4 }}>
          Co / Extra Curricular Activities
        </h3>
        <p className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
          Track conferences, projects, sports and other achievements by semester.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            marginBottom: 16,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ minWidth: 180 }}>
            <label className="label" style={{ fontSize: 12 }}>
              Filter by Semester
            </label>
            <input
              className="input"
              placeholder="e.g., Sem 1"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <label className="label" style={{ fontSize: 12 }}>
              Filter by Category
            </label>
            <select
              className="input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            className="form-btn"
            type="button"
            onClick={loadActivities}
            disabled={loading}
            style={{ padding: '8px 18px', fontSize: 12 }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="form-card"
          style={{ background: 'rgba(15,23,42,0.6)', marginTop: 4 }}
        >
          <h4 className="form-title">Add Activity</h4>
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
              <label className="label">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="field">
            <label className="label">Title / Description</label>
            <textarea
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input"
              rows={2}
              required
            />
          </div>
          <div className="field">
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
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
          {saving ? 'Saving...' : 'Add Activity'}
        </button>
      </form>

      <div className="msg-wrap" style={{ marginTop: 8 }}>
        {error && <p className="msg-err">{error}</p>}
        {success && <p className="msg-ok">{success}</p>}
      </div>

      <div style={{ marginTop: 20 }}>
        <h4 className="form-title" style={{ marginBottom: 8 }}>
          Logged Activities
        </h4>
        {activities.length === 0 && !loading && (
          <p className="muted" style={{ fontSize: 13 }}>
            No activities recorded yet.
          </p>
        )}
        {activities.length > 0 && (
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table className="table text-sm" style={{ width: '100%', fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Sem</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Notes</th>
                  <th>By</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr key={a._id}>
                    <td>{a.semester}</td>
                    <td>{a.date ? new Date(a.date).toLocaleDateString() : ''}</td>
                    <td>{a.category}</td>
                    <td>{a.title}</td>
                    <td>{a.notes}</td>
                    <td>{a.mentorId?.name || '-'}</td>
                    <td>
                      <button
                        type="button"
                        className="form-btn"
                        onClick={() => handleDelete(a._id)}
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
  );
}

export default ActivityLogSection;
