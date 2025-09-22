import React, { useState } from 'react';
import styled from 'styled-components';
import { findFriendsFromContacts } from '../services/supabaseService';
import UserProfileCard from '../components/UserProfileCard';

const PageContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const FindButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const FindFriendsPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleFindFriends = async () => {
    setError('');
    setSearched(false);

    if (!('contacts' in navigator && 'select' in navigator.contacts)) {
      setError('The Contact Picker API is not supported by your browser.');
      return;
    }

    setLoading(true);
    try {
      const contacts = await navigator.contacts.select(['name', 'email', 'tel'], { multiple: true });
      if (contacts.length === 0) {
        setLoading(false);
        return;
      }

      const { success, data, error: apiError } = await findFriendsFromContacts(contacts);
      if (success) {
        setResults(data);
      } else {
        setError(apiError);
      }
    } catch (err) {
      // This catches errors from the Contact Picker itself (e.g., user cancels)
      console.log('Contact picking cancelled or failed.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <PageContainer>
      <h1>Find Your Friends</h1>
      <p>Find friends who are already using the app by scanning your contacts.</p>
      <FindButton onClick={handleFindFriends} disabled={loading}>
        {loading ? 'Scanning...' : 'Scan Contacts'}
      </FindButton>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {searched && (
        <ResultsContainer>
          {results.length > 0 ? (
            results.map(profile => <UserProfileCard key={profile.id} profile={profile} />)
          ) : (
            <p>No friends found from the selected contacts.</p>
          )}
        </ResultsContainer>
      )}
    </PageContainer>
  );
};

export default FindFriendsPage;
