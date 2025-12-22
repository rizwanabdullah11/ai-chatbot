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
      {!isUser && <View style={styles.diamond} />}

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
    alignItems: 'flex-end',
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  rowUser: {
    justifyContent: 'flex-end'
  },
  rowBot: {
    justifyContent: 'center'
  },
  diamond: {
    width: 14,
    height: 14,
    backgroundColor: '#2ea5ff',
    transform: [{ rotate: '45deg' }],
    marginRight: 12,
    marginLeft: 6,
    alignSelf: 'center',
    borderRadius: 2
  },
  container: {
    maxWidth: '82%'
  },
  userContainer: {
    alignItems: 'flex-end'
  },
  botContainer: {
    alignItems: 'flex-start'
  },
  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  userBubble: {
    backgroundColor: '#2b2b2b'
  },
  botBubble: {
    backgroundColor: 'transparent',
    borderColor: '#222',
    borderWidth: 1
  },
  text: {
    fontSize: 15,
    lineHeight: 20
  },
  userText: {
    color: '#fff'
  },
  botText: {
    color: '#ddd'
  },
  time: {
    fontSize: 11,
    color: '#888',
    marginTop: 6,
    alignSelf: 'flex-end'
  },
  loading: {
    marginTop: 6,
    color: '#999',
    fontSize: 12
  }
});
