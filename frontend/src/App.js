import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your pages and components
import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import MenteeListPage from './pages/MenteeListPage.js';
import MenteeDetailsPage from './pages/MenteeDetailsPage.js';
import PerformanceReportPage from './pages/PerformanceReportPage.js';
import EditMentorPage from './pages/EditMentorPage.js'; // --- ADD THIS LINE ---

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <Router>
        <Routes>
          {/* ROUTE 1: Login Page */}
          <Route path="/" element={<LoginPage />} />

          {/* ROUTE 2: Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/mentor/:mentorId" element={<MenteeListPage />} />
            <Route path="/mentee/:studentId" element={<MenteeDetailsPage />} />
            <Route path="/performance" element={<PerformanceReportPage />} />
            
            {/* --- ADD THIS LINE --- */}
            <Route path="/mentor/:mentorId/edit" element={<EditMentorPage />} />
            
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;