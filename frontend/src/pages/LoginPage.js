// src/pages/LoginPage.js
import React, { useState } from 'react'
import api from 'api';
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      // --- THIS IS THE FIX ---
      // The URL is now short and correct.
      const response = await api.post('/users/login', { email, password })
      // -----------------------
      
      login(response.data)
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.'
      setError(msg)
    }
  }

  return (
    <div className="login-page">
      <style>{`
        .login-page{min-height:100vh;display:grid;place-items:center;background:radial-gradient(1200px 800px at 20% -10%,#334155 0%,transparent 60%),radial-gradient(900px 600px at 120% 10%,#0ea5e9 0%,transparent 60%),linear-gradient(160deg,#0b1020 0%,#0f172a 60%,#0b1020 100%);padding:24px}
        .card{width:100%;max-width:440px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.45);overflow:hidden}
        .card-header{padding:22px;border-bottom:1px solid rgba(255,255,255,.08);text-align:center}
        .title{margin:0;color:#fff;font-size:22px;letter-spacing:.2px;font-weight:600}
        .card-body{padding:22px}
        .field{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
        .label{font-size:13px;color:#cbd5e1}
        .input{height:44px;border-radius:10px;border:1px solid rgba(148,163,184,.35);background:rgba(255,255,255,.08);padding:0 12px;color:#e5e7eb;outline:none;transition:border .2s, box-shadow .2s}
        .input::placeholder{color:#94a3b8}
        .input:focus{border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,.25)}
        .error{font-size:13px;color:#fca5a5;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.4);padding:8px 10px;border-radius:8px;margin:8px 0}
        .btn{width:100%;height:46px;border-radius:12px;background:#ffffff;color:#0b1220;font-weight:600;border:none;cursor:pointer;transition:transform .08s ease, box-shadow .2s ease, background .2s}
        .btn:hover{box-shadow:0 10px 30px rgba(255,255,255,.12);background:#e8eef9}
        .btn:active{transform:translateY(1px)}
      `}</style>

      <div className="card">
        <div className="card-header">
          <h1 className="title">Mentor & HOD Login</h1>
        </div>
        <div className="card-body">
          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn">Sign in</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage