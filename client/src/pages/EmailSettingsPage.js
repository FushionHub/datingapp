import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmailNotificationSettings, updateEmailNotificationSettings } from '../services/supabaseService';

const EmailSettingsPage = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    on_new_match: true,
    on_new_message: true,
    on_new_follower: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const currentSettings = await getEmailNotificationSettings(currentUser.uid);
      if (currentSettings) {
        setSettings(currentSettings);
      }
      setLoading(false);
    };
    loadSettings();
  }, [currentUser]);

  const handleChange = async (e) => {
    const { name, checked } = e.target;
    const newSettings = {
      ...settings,
      [name]: checked,
    };
    setSettings(newSettings);
    await updateEmailNotificationSettings(currentUser.uid, { [name]: checked });
  };

  if (loading) {
    return <div>Loading email settings...</div>;
  }

  return (
    <div>
      <Link to="/">Back to Dashboard</Link>
      <h1>Email Notifications</h1>
      <p>Control which emails you receive from us.</p>

      <div>
        <label>
          <input
            type="checkbox"
            name="on_new_match"
            checked={settings.on_new_match}
            onChange={handleChange}
          />
          Email me when I get a new match
        </label>
      </div>

      <div style={{ marginTop: '16px' }}>
        <label>
          <input
            type="checkbox"
            name="on_new_message"
            checked={settings.on_new_message}
            onChange={handleChange}
          />
          Email me when I get a new message
        </label>
      </div>

      <div style={{ marginTop: '16px' }}>
        <label>
          <input
            type="checkbox"
            name="on_new_follower"
            checked={settings.on_new_follower}
            onChange={handleChange}
          />
          Email me when someone follows me
        </label>
      </div>
    </div>
  );
};

export default EmailSettingsPage;
