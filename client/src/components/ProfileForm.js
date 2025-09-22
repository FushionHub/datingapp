import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, upsertProfile } from '../services/supabaseService';

const ProfileForm = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [photos, setPhotos] = useState('');
  const [error, setError] = useState('');
  const [hasExistingUsername, setHasExistingUsername] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const profile = await getProfile(currentUser.uid);
      if (profile) {
        setName(profile.name || '');
        setUsername(profile.username || '');
        setAge(profile.age || '');
        setBio(profile.bio || '');
        setInterests(profile.interests ? profile.interests.join(', ') : '');
        setPhotos(profile.photos ? profile.photos.join(', ') : '');
        if (profile.username) {
          setHasExistingUsername(true);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [currentUser]);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
        setError('Username can only contain letters, numbers, and underscores.');
        return;
    }
    setError('');
    setUsername(value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const profileData = {
      name,
      username,
      age: parseInt(age, 10),
      bio,
      interests: interests.split(',').map(item => item.trim()),
      photos: photos.split(',').map(item => item.trim()),
    };

    const result = await upsertProfile(currentUser.uid, profileData);
    setLoading(false);

    if (result.error) {
        if (result.error.message.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
            setError('This username is already taken. Please choose another one.');
        } else {
            setError('An error occurred while saving your profile.');
        }
    } else {
        alert('Profile saved!');
        if (result.data.username) {
            setHasExistingUsername(true);
        }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Your Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          disabled={hasExistingUsername}
          minLength="3"
        />
        {hasExistingUsername && <small> (Username cannot be changed)</small>}
      </div>
      <div>
        <label>Age</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
      </div>
      <div>
        <label>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div>
        <label>Interests (comma-separated)</label>
        <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} />
      </div>
       <div>
        <label>Photo URLs (comma-separated)</label>
        <input type="text" value={photos} onChange={(e) => setPhotos(e.target.value)} />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};

export default ProfileForm;
