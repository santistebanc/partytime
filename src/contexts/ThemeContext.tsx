import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, defaultTheme, applyTheme, type Theme } from '../themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('partytime-theme');
    return saved ? themes.find(t => t.name === saved) || defaultTheme : defaultTheme;
  });

  useEffect(() => {
    applyTheme(currentTheme);
    localStorage.setItem('partytime-theme', currentTheme.name);
  }, [currentTheme]);

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
