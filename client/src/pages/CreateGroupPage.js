import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllProfiles, createGroup } from '../services/supabaseService';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`;

const UserList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 0.5rem;
`;

const UserLabel = styled.label`
  display: block;
  padding: 0.5rem;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:disabled {
    opacity: 0.5;
  }
`;

const CreateGroupPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [groupName, setGroupName] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (currentUser) {
        const data = await getAllProfiles(currentUser.uid);
        setProfiles(data);
      }
    };
    fetchProfiles();
  }, [currentUser]);

  const handleMemberToggle = (profileId) => {
    setSelectedMembers(prev =>
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName || selectedMembers.length === 0) {
      setError('Group name and at least one member are required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const result = await createGroup(groupName, selectedMembers);
      if (result.success) {
        alert('Group created successfully!');
        // In the next step, we will refactor the chat page to handle group chats.
        // For now, we'll just navigate to the conversations list.
        navigate('/conversations'); // This route will be created in the next step
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <h1>Create New Group</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />

        <div>
          <h3>Select Members:</h3>
          <UserList>
            {profiles.map(profile => (
              <UserLabel key={profile.id}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(profile.id)}
                  onChange={() => handleMemberToggle(profile.id)}
                />
                {profile.name}
              </UserLabel>
            ))}
          </UserList>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Group...' : 'Create Group'}
        </Button>
      </Form>
    </PageContainer>
  );
};

export default CreateGroupPage;
