import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';

import { Ionicons } from '@expo/vector-icons';

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import * as Speech from 'expo-speech';

import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendMessageToGemini } from '../../components/geminiApi';
import MessageBubble from '../../components/MessageBubble';

const API_KEY_KEY = 'gemini_api_key';

export default function GeminiChatBot() {
  const [messages, setMessages] = useState<{ id: number; role: 'user' | 'assistant'; text: string; time?: string }[]>([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    const loadApiKey = async () => {
      const key = await SecureStore.getItemAsync(API_KEY_KEY);
      setApiKey(key || '');
    };
    loadApiKey();
  }, []);

  const sendMessage = async (text: string = input, audioBase64: string | null = null) => {
    if ((!text.trim() && !audioBase64) || !apiKey) return;

    const now = new Date();
    const timestr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: { id: number; role: 'user' | 'assistant'; text: string; time?: string } = {
      id: Date.now(),
      role: 'user',
      text: audioBase64 ? '🎤 Voice Message' : text,
      time: timestr
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    // Call Gemini API using axios service (pass stored apiKey)
    let reply = 'No response';
    try {
      reply = await sendMessageToGemini(text.replace(/\n/g, ' '), apiKey, audioBase64);
    } catch (e) {
      console.error(e);
      reply = 'Sorry, something went wrong.';
    }
    const botMessage: { id: number; role: 'user' | 'assistant'; text: string; time?: string } = { id: Date.now() + 1, role: 'assistant', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, botMessage]);

    // Speak the response
    Speech.speak(reply);

    setIsSending(false);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (uri) {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      sendMessage('', base64);
    }
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.setupContainer}>
          <Ionicons name="key" size={64} color="#4285f4" style={styles.keyIcon} />
          <Text style={styles.setupTitle}>Welcome to ChatBot</Text>
          <Text style={styles.setupSubtitle}>Enter your API Key to get started</Text>
          <TextInput
            style={styles.apiKeyInput}
            value={keyInput}
            onChangeText={setKeyInput}
            placeholder="Paste your API Key here"
            placeholderTextColor="#6b7280"
            secureTextEntry
            multiline
          />
          <TouchableOpacity
            onPress={saveApiKey}
            style={styles.saveButton}
            disabled={!keyInput.trim()}
          >
            <Text style={styles.saveButtonText}>Save & Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {/* Enhanced Header with Gradient */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="sparkles" size={24} color="#4285f4" />
              <Text style={styles.headerTitle}>ChatBot</Text>
            </View>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerDivider} />
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          style={styles.chatList}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Enhanced Input Area */}
        <View style={styles.inputWrap}>
          <View style={styles.pill}>
            <TouchableOpacity style={styles.leftActions}>
              <Ionicons name="add-circle" size={24} color="#6b7280" />
            </TouchableOpacity>

            <TextInput
              style={styles.pillInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask me anything..."
              placeholderTextColor="#6b7280"
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
              blurOnSubmit={false}
              multiline
              maxLength={2000}
            />

            <TouchableOpacity
              onPress={recording ? stopRecording : startRecording}
              style={[styles.micButton, recording && styles.micButtonActive]}
            >
              <Ionicons name={recording ? "stop" : "mic"} size={20} color={recording ? "#fff" : "#6b7280"} />
            </TouchableOpacity>

            <Pressable
              onPress={() => sendMessage(input)}
              style={[styles.sendButton, (!input.trim() || isSending) && styles.sendButtonDisabled]}
              disabled={isSending || !input.trim()}
            >
              {isSending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="arrow-up" size={16} color="#fff" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a'
  },
  header: {
    backgroundColor: '#0a0a0a',
  },
  headerContent: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoButton: {
    padding: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#1f1f1f',
    marginHorizontal: 20,
  },
  chatList: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  inputWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  leftActions: {
    paddingRight: 8,
  },
  pillInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#4285f4',
    width: 30,
    height: 30,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
  },
  // API Key Setup Styles
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#0a0a0a',
  },
  keyIcon: {
    marginBottom: 24,
  },
  setupTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  setupSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  apiKeyInput: {
    width: '100%',
    color: '#fff',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#4285f4',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  micButton: {
    padding: 8,
    marginRight: 4,
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
    borderRadius: 20,
  },
});
