import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserProfile } from '../services/adminService';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const { users: fetchedUsers, count: totalCount } = await getAllUsers();
      setUsers(fetchedUsers);
      setCount(totalCount);
      setLoading(false);
    };
    loadUsers();
  }, []);

  const handleBan = async (userId) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      // This assumes a 'status' column on the profiles table, e.g., 'active', 'banned'
      // The schema would need to be updated for this to work fully.
      await updateUserProfile(userId, { status: 'banned' });
      alert('User has been banned.');
      // Refresh the list
      const { users: fetchedUsers, count: totalCount } = await getAllUsers();
      setUsers(fetchedUsers);
      setCount(totalCount);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h2>User Management ({count} users)</h2>
      <table style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Tier</th>
            <th>KYC Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email_placeholder}</td> {/* Email is not in profiles table by default */}
              <td>{user.subscription_tier}</td>
              <td>{user.kyc_status}</td>
              <td>
                <button onClick={() => handleBan(user.id)}>Ban</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementPage;
