import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getSiteSettings, updateSiteSetting } from '../services/supabaseService';

const SettingsContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;

  &:disabled {
    opacity: 0.5;
  }
`;

const SiteSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const data = await getSiteSettings();
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const updatePromises = Object.keys(settings).map(key =>
      updateSiteSetting(key, settings[key])
    );

    await Promise.all(updatePromises);

    setSaving(false);
    alert('Settings saved successfully!');
  };

  if (loading) {
    return <p>Loading settings...</p>;
  }

  return (
    <SettingsContainer>
      <h2>Site Metadata Settings</h2>
      <Form onSubmit={handleSubmit}>
        <label>
          App Name:
          <Input type="text" name="appName" value={settings.appName || ''} onChange={handleChange} />
        </label>
        <label>
          SEO Description:
          <Input type="text" name="seoDescription" value={settings.seoDescription || ''} onChange={handleChange} />
        </label>
        <label>
          SEO Keywords (comma-separated):
          <Input type="text" name="seoKeywords" value={settings.seoKeywords || ''} onChange={handleChange} />
        </label>
        <label>
          Logo URL:
          <Input type="text" name="logoUrl" value={settings.logoUrl || ''} onChange={handleChange} />
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Form>
    </SettingsContainer>
  );
};

export default SiteSettings;
