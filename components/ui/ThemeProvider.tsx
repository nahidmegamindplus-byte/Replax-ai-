'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('replyx-theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(savedTheme);
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('replyx-theme', nextTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark' as Theme,
      toggleTheme: () => {},
    };
  }
  return context;
}
