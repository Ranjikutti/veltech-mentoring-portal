import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import MenteeListPage from './pages/MenteeListPage.js';
import MenteeDetailsPage from './pages/MenteeDetailsPage.js';
import EditStudentPage from './pages/EditStudentPage.js';
import PerformanceReportPage from './pages/PerformanceReportPage.js';
import EditMentorPage from './pages/EditMentorPage.js';
import ManageHodsPage from './pages/ManageHodsPage.js';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/mentor/:mentorId" element={<MenteeListPage />} />
            <Route path="/mentee/:studentId" element={<MenteeDetailsPage />} />
            <Route path="/mentee/:studentId/edit" element={<EditStudentPage />} />
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
