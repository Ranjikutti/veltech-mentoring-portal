import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import MenteeListPage from './pages/MenteeListPage.js';
import MenteeDetailsPage from './pages/MenteeDetailsPage.js';
import PerformanceReportPage from './pages/PerformanceReportPage.js';
import EditMentorPage from './pages/EditMentorPage.js';
import ManageHodsPage from './pages/ManageHodsPage.js';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/mentor/:mentorId" element={<MenteeListPage />} />
            <Route path="/mentee/:studentId" element={<MenteeDetailsPage />} />
            <Route path="/performance" element={<PerformanceReportPage />} />
            <Route path="/mentor/:mentorId/edit" element={<EditMentorPage />} />
            <Route path="/hods" element={<ManageHodsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
