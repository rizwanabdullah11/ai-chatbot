import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  text: string;
  role: 'user' | 'assistant';
  time?: string;
  loading?: boolean;
};

export default function MessageBubble({ text, role, time, loading }: Props) {
  const isUser = role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Ionicons name="sparkles" size={16} color="#4285f4" />
        </View>
      )}

      <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>{text}</Text>
          {loading ? <Text style={styles.loading}>• • •</Text> : null}
        </View>
        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    paddingHorizontal: 16,
    width: '100%',
  },
  rowUser: {
    justifyContent: 'flex-end'
  },
  rowBot: {
    justifyContent: 'flex-start'
  },
  avatarContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  container: {
    maxWidth: '75%',
    minWidth: 60,
  },
  userContainer: {
    alignItems: 'flex-end'
  },
  botContainer: {
    alignItems: 'flex-start'
  },
  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#4285f4',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#1a1a1a',
    borderColor: '#2a2a2a',
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff'
  },
  botText: {
    color: '#e5e7eb'
  },
  time: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    marginHorizontal: 4,
  },
  loading: {
    marginTop: 6,
    color: '#9ca3af',
    fontSize: 14,
    letterSpacing: 2,
  }
});
