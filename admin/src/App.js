import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagementPage from './pages/UserManagementPage';
import KYCManagementPage from './pages/KYCManagementPage';
import ContentModerationPage from './pages/ContentModerationPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <h1>euromeet online Admin Panel</h1>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route path="/" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/users" element={<ProtectedAdminRoute><UserManagementPage /></ProtectedAdminRoute>} />
          <Route path="/kyc" element={<ProtectedAdminRoute><KYCManagementPage /></ProtectedAdminRoute>} />
          <Route path="/moderation" element={<ProtectedAdminRoute><ContentModerationPage /></ProtectedAdminRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
