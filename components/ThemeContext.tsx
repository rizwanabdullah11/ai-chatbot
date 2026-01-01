import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemePreference = 'light' | 'dark' | 'system';

const THEME_KEY = 'user-theme-preference';

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => Promise<void>;
  colorScheme: NonNullable<ColorSchemeName>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [colorScheme, setColorScheme] = useState<NonNullable<ColorSchemeName>>(Appearance.getColorScheme() ?? 'light');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const stored = await SecureStore.getItemAsync(THEME_KEY);
        if (!mounted) return;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      } catch {
        // ignore
      }
    }

    load();

    const sub = Appearance.addChangeListener(({ colorScheme: cs }) => {
      if (preference === 'system') {
        setColorScheme(cs ?? 'light');
      }
    });

    return () => {
      mounted = false;
      try {
        sub.remove();
      } catch {
        // some RN versions use different return shapes
      }
    };
  }, [preference]);

  useEffect(() => {
    const resolved = preference === 'system' ? (Appearance.getColorScheme() ?? 'light') : preference;
    setColorScheme(resolved);
  }, [preference]);

  const setPreference = async (p: ThemePreference) => {
    setPreferenceState(p);
    try {
      await SecureStore.setItemAsync(THEME_KEY, p);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ preference, setPreference, colorScheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within AppThemeProvider');
  return ctx;
}

export default ThemeContext;
