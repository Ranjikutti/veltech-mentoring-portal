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

  const loadHods = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('/users/hods');
      const data = Array.isArray(res.data) ? res.data : [];
      data.sort((a, b) => {
        const depA = (a.department || '').localeCompare(b.department || '');
        if (depA !== 0) return depA;
        return (a.name || '').localeCompare(b.name || '');
      });
      setHods(data);
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
      setHods((prev) => {
        const next = [...prev, res.data];
        next.sort((a, b) => {
          const depA = (a.department || '').localeCompare(b.department || '');
          if (depA !== 0) return depA;
          return (a.name || '').localeCompare(b.name || '');
        });
        return next;
      });
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Manage HODs</h1>
            <p className="text-slate-400 text-sm mt-1">
              Create and remove Head of Department profiles for each department.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Create New HOD</h2>
            <form className="space-y-3" onSubmit={handleCreate}>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring focus:ring-sky-500/40"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring focus:ring-sky-500/40"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring focus:ring-sky-500/40"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">MTS Number</label>
                <input
                  name="mtsNumber"
                  value={form.mtsNumber}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring focus:ring-sky-500/40"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Department</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="CSE, ECE, IT, MECH"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring focus:ring-sky-500/40"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Designation</label>
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="HOD, Professor"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring focus:ring-sky-500/40"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create HOD'}
              </button>
            </form>
            <div className="mt-3 space-y-1 text-sm">
              {error && <div className="text-red-400">{error}</div>}
              {success && <div className="text-emerald-400">{success}</div>}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Existing HODs</h2>
              <button
                onClick={loadHods}
                disabled={loading}
                className="text-xs rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {loading && hods.length === 0 && (
              <div className="text-sm text-slate-400">Loading HODs...</div>
            )}
            {!loading && hods.length === 0 && (
              <div className="text-sm text-slate-400">No HODs found yet.</div>
            )}
            <div className="space-y-2">
              {hods.map((hod) => (
                <div
                  key={hod._id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {hod.name}{' '}
                      <span className="text-xs text-sky-400">
                        ({hod.department})
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{hod.email}</div>
                    <div className="text-xs text-slate-500">
                      {hod.mtsNumber} • {hod.designation}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(hod._id)}
                    disabled={deletingId === hod._id}
                    className="text-xs rounded-lg bg-red-500/90 px-3 py-1 font-medium text-slate-50 hover:bg-red-400 disabled:opacity-60"
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
  );
}

export default ManageHodsPage;
