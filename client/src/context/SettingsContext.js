import React, { useContext, useState, useEffect } from 'react';
import { getSiteSettings } from '../services/supabaseService';

const SettingsContext = React.createContext();

/**
 * Custom hook to consume the SettingsContext.
 */
export function useSettings() {
  return useContext(SettingsContext);
}

/**
 * Provides site-wide settings to the application.
 * Fetches settings from the database and makes them available via the context.
 */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
        // In a real app, you might want to set some default settings here
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const value = {
    settings,
    loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
