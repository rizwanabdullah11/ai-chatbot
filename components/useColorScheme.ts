import { useContext } from 'react';
import { Appearance } from 'react-native';
import ThemeContext from './ThemeContext';

export function useColorScheme() {
	const ctx = useContext(ThemeContext as any);
	return ctx?.colorScheme ?? (Appearance.getColorScheme() ?? 'light');
}
