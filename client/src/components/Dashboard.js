import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getAllProfiles } from '../services/supabaseService';
import ProfileForm from './ProfileForm';
import UserProfileCard from './UserProfileCard';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const [error, setError] = useState('');
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile, logout } = useAuth(); // Get userProfile from context
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!userProfile) {
          // The profile is still loading in the context, wait for it.
          // The AuthContext already handles the main loading state.
          // If we reach here, it means the AuthProvider has finished loading but profile is null.
          setLoading(false);
          return;
        }

        if (userProfile && !userProfile.onboarding_complete) {
          navigate('/onboarding');
          return;
        }

        const otherProfiles = await getAllProfiles(currentUser.uid);
        setAllProfiles(otherProfiles);
      } catch (e) {
        setError("Failed to load dashboard data.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    // AuthProvider handles the initial loading, so we only run this when userProfile is available.
    if (userProfile) {
      loadDashboard();
    } else {
      // Handle the case where the profile might still be loading or is null for a new user
      setLoading(false);
    }
  }, [currentUser, userProfile, navigate]);

  async function handleLogout() {
    setError('');
    try {
      await logout();
      navigate('/login');
    } catch {
      setError('Failed to log out');
    }
  }

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="app-container">
      <header className="main-nav">
        <h2>euromeet online</h2>
        <nav>
          <Link to={`/profile/${currentUser.uid}`}>My Profile</Link>
          <Link to="/matches">My Matches</Link>
          <Link to="/reels">Reels</Link>
          <Link to="/wallet">My Wallet</Link>
          <Link to="/subscriptions">Subscriptions</Link>
          <Link to="/settings/privacy">Settings</Link>
          <div style={{display: 'inline-block', marginLeft: '16px'}}>
            <label htmlFor="theme-select" style={{marginRight: '8px'}}>Theme:</label>
            <select id="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button onClick={handleLogout} style={{marginLeft: '16px'}}>Log Out</button>
        </nav>
      </header>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="card">
        <h3>
          Your Profile
          {userProfile && (userProfile.is_verified ? <span style={{ color: 'green' }}> (Verified ✔)</span> : <span style={{ color: 'red' }}> (Not Verified)</span>)}
        </h3>
        {userProfile && !userProfile.is_verified && (
          <p><Link to="/verify">Verify Your Profile Now</Link></p>
        )}
        {userProfile ? (
          <div>
            <p><strong>Name:</strong> {userProfile.name}</p>
          </div>
        ) : (
          <p>You have not created a profile yet. Please fill out the form below.</p>
        )}
        <ProfileForm />
      </div>

      <hr />

      <div>
        <h3>Discover Other Users</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {allProfiles.length > 0 ? (
            allProfiles.map(p => <UserProfileCard key={p.id} profile={p} />)
          ) : (
            <p>No other users to show right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
