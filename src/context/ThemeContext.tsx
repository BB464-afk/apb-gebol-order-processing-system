import React, { createContext, useContext, useState, useEffect } from 'react';

export type PrototypeTheme = 'A' | 'B';

interface ThemeContextType {
  theme: PrototypeTheme;
  setTheme: (theme: PrototypeTheme) => void;
  toggleTheme: () => void;
  isThemeA: boolean;
  isThemeB: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'gebol_prototype_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<PrototypeTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'A' || saved === 'B') {
        return saved;
      }
    }
    return 'A';
  });

  const setTheme = (newTheme: PrototypeTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'A' ? 'B' : 'A');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isThemeA: theme === 'A',
        isThemeB: theme === 'B',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
