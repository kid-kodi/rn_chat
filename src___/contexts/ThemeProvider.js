import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => { },
  isSystemTheme: false,
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isSystemTheme, setIsSystemTheme] = useState(false);

  // Load saved theme preference on initial render
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@user_theme');
        const systemPref = await AsyncStorage.getItem('@use_system_theme');

        if (systemPref === 'true') {
          setIsSystemTheme(true);
          const systemTheme = Appearance.getColorScheme();
          setTheme(systemTheme || 'light');
        } else if (savedTheme) {
          setIsSystemTheme(false);
          setTheme(savedTheme);
        } else {
          // First time user - default to system theme
          setIsSystemTheme(true);
          const systemTheme = Appearance.getColorScheme();
          setTheme(systemTheme || 'light');
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  // Handle system theme changes when using system theme
  useEffect(() => {
    if (!isSystemTheme) return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme || 'light');
    });

    return () => subscription.remove();
  }, [isSystemTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsSystemTheme(false);
    try {
      await AsyncStorage.setItem('@user_theme', newTheme);
      await AsyncStorage.setItem('@use_system_theme', 'false');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const useSystemTheme = async () => {
    const systemTheme = Appearance.getColorScheme();
    setTheme(systemTheme || 'light');
    setIsSystemTheme(true);
    try {
      await AsyncStorage.setItem('@use_system_theme', 'true');
      await AsyncStorage.removeItem('@user_theme');
    } catch (error) {
      console.log('Error setting system theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      isSystemTheme,
      useSystemTheme, // Added this new function
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};