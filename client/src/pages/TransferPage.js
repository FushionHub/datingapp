import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchUsers } from '../services/supabaseService';
import UserProfileCard from '../components/UserProfileCard';
import TransferModal from '../components/TransferModal';

const TransferPage = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      const results = await searchUsers(searchTerm);
      // Exclude the current user from the search results
      const filteredResults = results.filter(user => user.id !== currentUser.uid);
      setSearchResults(filteredResults);
      setLoading(false);
    }, 500); // Debounce search input

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentUser.uid]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      {selectedUser && <TransferModal receiverId={selectedUser.id} onClose={handleCloseModal} />}
      <Link to="/wallet">Back to Wallet</Link>
      <h1>Transfer Funds</h1>
      <p>Find a user to transfer funds to by their name, username, or email.</p>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for a user..."
        style={{ width: '100%', padding: '10px', fontSize: '1rem', marginBottom: '20px' }}
      />
      {loading && <p>Searching...</p>}
      <div>
        {searchResults.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {searchResults.map(profile => (
              <div key={profile.id} onClick={() => handleSelectUser(profile)}>
                <UserProfileCard profile={profile} />
              </div>
            ))}
          </div>
        ) : (
          !loading && searchTerm && <p>No users found for "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
};

export default TransferPage;
