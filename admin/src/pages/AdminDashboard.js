import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <div>
          <span>Welcome, {currentUser.email} ({currentUser.adminData.role.role_name})</span>
          <button onClick={logout} style={{ marginLeft: '16px' }}>Log Out</button>
        </div>
      </div>

      <nav>
        <Link to="/" style={{ marginRight: '16px' }}>Overview</Link>
        <Link to="/users" style={{ marginRight: '16px' }}>User Management</Link>
        <Link to="/kyc" style={{ marginRight: '16px' }}>KYC Queue</Link>
        <Link to="/moderation">Content Moderation</Link>
      </nav>

      <hr />

      <h3>Overview</h3>
      <p>This is the main dashboard overview. Key stats and metrics will be displayed here.</p>
    </div>
  );
};

export default AdminDashboard;
