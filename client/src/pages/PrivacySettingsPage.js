import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPrivacySettings, updatePrivacySettings } from '../services/supabaseService';

const PrivacySettingsPage = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    show_last_seen: true,
    who_can_message_me: 'matches',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const currentSettings = await getPrivacySettings(currentUser.uid);
      if (currentSettings) {
        setSettings(currentSettings);
      }
      setLoading(false);
    };
    loadSettings();
  }, [currentUser]);

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newSettings = {
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    };
    setSettings(newSettings);
    await updatePrivacySettings(currentUser.uid, { [name]: type === 'checkbox' ? checked : value });
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <Link to="/">Back to Dashboard</Link>
      <h1>Settings</h1>

      <nav>
        <Link to="/settings/privacy" style={{ marginRight: '16px' }}>Privacy</Link>
        <Link to="/settings/email">Email Notifications</Link>
      </nav>

      <hr />

      <h2>Privacy</h2>

      <div>
        <label>
          <input
            type="checkbox"
            name="show_last_seen"
            checked={settings.show_last_seen}
            onChange={handleChange}
          />
          Show my "Last Seen" status
        </label>
      </div>

      <div style={{ marginTop: '16px' }}>
        <label htmlFor="message-perms">Who can message me:</label>
        <select
          id="message-perms"
          name="who_can_message_me"
          value={settings.who_can_message_me}
          onChange={handleChange}
        >
          <option value="matches">Only My Matches</option>
          <option value="following">People I Follow</option>
          <option value="everyone">Everyone</option>
        </select>
      </div>
    </div>
  );
};

export default PrivacySettingsPage;
