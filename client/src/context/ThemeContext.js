import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../theme';
import { GlobalStyle } from '../GlobalStyle';

const ThemeContext = createContext();

/**
 * Custom hook to consume the ThemeContext.
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * Provides theme context to the application, including the current theme mode ('light' or 'dark'),
 * a function to set the mode, and the styled-components ThemeProvider.
 */
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light');

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  const value = {
    theme: themeMode,
    setTheme: setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
