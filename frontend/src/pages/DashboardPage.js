import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import HodDashboard from '../components/HodDashboard'
import MentorDashboard from '../components/MentorDashboard'

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="dash-wrap loading">
        {/* All styles are in index.css */}
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="dash-wrap">
      {/* All styles are in index.css */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="title">Mentoring Portal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="pill">{user.role}</span>
            <button className="logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="welcome">
          <span className="name">Welcome, {user.name}</span>
        </div>

        <div className="grid">
          <div className="card">
            <div className="card-body">
              {/* This is the correct logic */}
              {user.role === 'hod' ? <HodDashboard /> : <MentorDashboard />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage