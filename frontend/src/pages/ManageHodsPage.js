import React, { useEffect, useState } from 'react';
import api from 'api';
import { Link } from 'react-router-dom';

function ManageHodsPage() {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    mtsNumber: '',
    department: '',
    designation: ''
  });

  const sortHods = (list) => {
    const arr = Array.isArray(list) ? [...list] : [];
    arr.sort((a, b) => {
      const depA = (a.department || '').localeCompare(b.department || '');
      if (depA !== 0) return depA;
      return (a.name || '').localeCompare(b.name || '');
    });
    return arr;
  };

  const loadHods = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('/users/hods');
      setHods(sortHods(res.data || []));
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load HODs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHods();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        mtsNumber: form.mtsNumber.trim(),
        department: form.department.trim(),
        designation: form.designation.trim()
      };
      const res = await api.post('/users/hods', body);
      setSuccess('HOD created successfully');
      setForm({
        name: '',
        email: '',
        password: '',
        mtsNumber: '',
        department: '',
        designation: ''
      });
      setHods((prev) => sortHods([...prev, res.data]));
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to create HOD';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this HOD?')) return;
    setError('');
    setSuccess('');
    setDeletingId(id);
    try {
      await api.delete(`/users/hods/${id}`);
      setHods((prev) => prev.filter((h) => h._id !== id));
      setSuccess('HOD deleted successfully');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to delete HOD';
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && hods.length === 0) {
    return (
      <div className="mlp loading">
        <div className="spin" />
      </div>
    );
  }

  return (
    <div className="mlp">
      <div className="container" style={{ maxWidth: '900px' }}>
        <Link to="/dashboard" className="back">
          ← Back to Dashboard
        </Link>

        <div className="panel" style={{ marginTop: '16px' }}>
          <div className="panel-body">
            <div className="header">
              <div>
                <h2 className="title">Manage HODs</h2>
                <p className="meta">Create and remove Head of Department profiles for each department.</p>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gap: 18,
                gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1.1fr)'
              }}
            >
              <div className="form-card">
                <h4 className="form-title">Create New HOD</h4>
                <form onSubmit={handleCreate}>
                  <div className="form-grid">
                    <div className="field">
                      <label className="label">Name</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="input"
                        required
                      />
                    </div>
                    <div className="field">
                      <label className="label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input"
                        required
                      />
                    </div>
                    <div className="field">
                      <label className="label">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="input"
                        required
                      />
                    </div>
                    <div className="field">
                      <label className="label">MTS Number</label>
                      <input
                        name="mtsNumber"
                        value={form.mtsNumber}
                        onChange={handleChange}
                        className="input"
                        required
                      />
                    </div>
                    <div className="field">
                      <label className="label">Department</label>
                      <input
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        placeholder="CSE, ECE, IT, MECH"
                        className="input"
                        required
                      />
                    </div>
                    <div className="field">
                      <label className="label">Designation</label>
                      <input
                        name="designation"
                        value={form.designation}
                        onChange={handleChange}
                        placeholder="HOD, Professor"
                        className="input"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="form-btn"
                    style={{ marginTop: 18, minWidth: 140 }}
                  >
                    {saving ? 'Creating...' : 'Create HOD'}
                  </button>
                  <div className="msg-wrap">
                    {error && <p className="msg-err">{error}</p>}
                    {success && <p className="msg-ok">{success}</p>}
                  </div>
                </form>
              </div>

              <div className="form-card">
                <h4 className="form-title">Existing HODs</h4>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10
                  }}
                >
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                    Total: {hods.length}
                  </p>
                  <button
                    onClick={loadHods}
                    disabled={loading}
                    className="form-btn"
                    style={{
                      height: 32,
                      paddingInline: 12,
                      marginTop: 0,
                      fontSize: 12,
                      background: '#020617'
                    }}
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {hods.length === 0 && !loading && (
                  <div className="empty">No HODs found yet.</div>
                )}

                <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                  {hods.map((hod) => (
                    <div
                      key={hod._id}
                      style={{
                        borderRadius: 12,
                        border: '1px solid rgba(148, 163, 184, .45)',
                        background: 'rgba(15,23,42,.85)',
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {hod.name}{' '}
                          <span style={{ fontSize: 11, color: '#38bdf8' }}>
                            ({hod.department})
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>
                          {hod.email}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          {hod.mtsNumber} • {hod.designation}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(hod._id)}
                        disabled={deletingId === hod._id}
                        className="form-btn"
                        style={{
                          background: '#ef4444',
                          height: 32,
                          paddingInline: 14,
                          marginTop: 0,
                          fontSize: 12
                        }}
                      >
                        {deletingId === hod._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageHodsPage;
