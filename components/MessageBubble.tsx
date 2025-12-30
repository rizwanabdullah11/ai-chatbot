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
          {loading ? (
            <Text style={styles.loading}>• • •</Text>
          ) : (
            <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>{text}</Text>
          )}
        </View>
        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>
      {isUser && (
        <View style={styles.userAvatarContainer}>
          <Ionicons name="person" size={14} color="#111827" />
        </View>
      )}
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
  userAvatarContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#c7d2fe',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginTop: 4,
    borderWidth: 0,
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
    backgroundColor: '#4f46e5',
    borderBottomRightRadius: 6,
  },
  botBubble: {
    backgroundColor: '#0f1724',
    borderColor: '#111827',
    borderWidth: 1,
    borderBottomLeftRadius: 6,
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
    marginTop: 0,
    color: '#9ca3af',
    fontSize: 16,
    letterSpacing: 6,
    textAlign: 'left',
  }
});
