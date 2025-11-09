import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const { token } = useAuth(); // Check if we have a token

  if (!token) {
    // If no token, send them back to the login page
    return <Navigate to="/" replace />;
  }

  // If there IS a token, show the page they asked for
  return <Outlet />;
}

export default ProtectedRoute;