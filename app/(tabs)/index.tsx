import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';

import { Ionicons } from '@expo/vector-icons';

import * as SecureStore from 'expo-secure-store';



import { useEffect, useRef, useState } from 'react';
import { sendMessageToGemini } from '../../components/geminiApi';
import MessageBubble from '../../components/MessageBubble';

const API_KEY_KEY = 'gemini_api_key';

export default function GeminiChatBot() {
  const [messages, setMessages] = useState<{ id: number; role: 'user' | 'assistant'; text: string; time?: string }[]>([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    const loadApiKey = async () => {
      const key = await SecureStore.getItemAsync(API_KEY_KEY);
      setApiKey(key || '');
    };
    loadApiKey();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const now = new Date();
    const timestr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: { id: number; role: 'user' | 'assistant'; text: string; time?: string } = { id: Date.now(), role: 'user', text: input, time: timestr };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    // Call Gemini API using axios service (pass stored apiKey)
    let reply = 'No response';
    try {
      reply = await sendMessageToGemini(input.replace(/\n/g, ' '), apiKey);
    } catch (e) {
      console.error(e);
      reply = 'Sorry, something went wrong.';
    }
    const botMessage: { id: number; role: 'user' | 'assistant'; text: string; time?: string } = { id: Date.now() + 1, role: 'assistant', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, botMessage]);
    setIsSending(false);
  };

  const renderMessage = ({ item }: { item: { id: number; role: 'user' | 'assistant'; text: string; time?: string } }) => (
    <MessageBubble text={item.text} role={item.role} time={item.time} />
  );

  if (!apiKey) {
    const saveApiKey = async () => {
      await SecureStore.setItemAsync(API_KEY_KEY, keyInput);
      setApiKey(keyInput);
    };

    return (
      <View style={styles.container}>
        <Text>Enter Gemini API Key:</Text>
        <TextInput
          style={[styles.input, { height: 200 }]}
          value={keyInput}
          onChangeText={setKeyInput}
          placeholder="API Key"
          secureTextEntry
          multiline
        />
        <TouchableOpacity onPress={saveApiKey}>
          <Text>Save Key</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gemini</Text>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={20} color="#cfcfcf" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        style={styles.chatList}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputWrap}>
        <View style={styles.pill}>
          <TouchableOpacity style={styles.leftActions}>
            <Ionicons name="add" size={20} color="#9aa0a6" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolsButton}>
            <Text style={styles.toolsText}>Tools</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.pillInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Gemini 3"
            placeholderTextColor="#9aa0a6"
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
            blurOnSubmit={false}
          />

          <TouchableOpacity style={styles.speed}>
            <Text style={styles.toolsText}>Fast ▾</Text>
          </TouchableOpacity>

          <Pressable onPress={sendMessage} style={styles.micButton} disabled={isSending || !input.trim()}>
            {isSending ? <ActivityIndicator color="#fff" /> : <Ionicons name="mic" size={18} color="#fff" />}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0d'
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  chatList: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 24,
    alignItems: 'center',
    paddingHorizontal: 8
  },
  inputWrap: {
    padding: 12,
    backgroundColor: 'transparent'
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1113',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#242526',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  leftActions: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  toolsButton: {
    paddingHorizontal: 8,
  },
  toolsText: {
    color: '#9aa0a6',
    fontSize: 13
  },
  pillInput: {
    flex: 1,
    color: '#fff',
    paddingHorizontal: 12,
    fontSize: 16
  },
  speed: {
    paddingHorizontal: 8,
  },
  micButton: {
    backgroundColor: '#1f1f1f',
    padding: 8,
    borderRadius: 18,
    marginLeft: 8
  },
  input: {
    color: '#fff',
    backgroundColor: '#0f1113',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242526',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16
  }
});
