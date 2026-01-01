import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  const next = () => {
    const order: Array<typeof preference> = ['system', 'light', 'dark'];
    const idx = order.indexOf(preference);
    const nextPref = order[(idx + 1) % order.length];
    setPreference(nextPref);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={next} style={styles.button}>
        <Text style={styles.text}>Theme: {preference}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 12,
  },
  button: {
    padding: 8,
  },
  text: {
    fontSize: 14,
  },
});
