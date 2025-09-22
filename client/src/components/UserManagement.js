import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminGetAllUsers, adminUpdateUserRole } from '../services/supabaseService';

const UserManagementContainer = styled.div`
  margin-top: 2rem;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const data = await adminGetAllUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const result = await adminUpdateUserRole(userId, newRole);
    if (result.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('User role updated successfully.');
    } else {
      alert(`Failed to update role: ${result.error}`);
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <UserManagementContainer>
      <h2>User Management</h2>
      <UserTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name || 'N/A'}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </UserTable>
    </UserManagementContainer>
  );
};

export default UserManagement;
