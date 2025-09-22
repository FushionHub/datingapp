import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    // While checking auth state, show a loading indicator or null
    return <p>Loading user...</p>;
  }

  if (!currentUser) {
    // If no user is logged in, redirect to the login page
    return <Navigate to="/login" />;
  }

  if (userProfile && userProfile.role !== 'admin') {
    // If user is not an admin, redirect to the home page
    // You could also redirect to a dedicated "Unauthorized" page
    return <Navigate to="/" />;
  }

  if (userProfile && userProfile.role === 'admin') {
    // If user is an admin, allow access to the route
    return children;
  }

  // This case handles the brief moment where currentUser exists but userProfile hasn't loaded yet.
  // Or if a profile failed to load for some reason.
  // Showing a loading message is a safe fallback.
  return <p>Verifying admin permissions...</p>;
};

export default AdminRoute;
