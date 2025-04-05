import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, FlatList, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { chats } from '../../../data/chats';
import { messages } from '../../../data/messages';
import Message from '../../../components/chat/Message';

function HeaderTitle() {
  const { id } = useLocalSearchParams();
  const chat = chats.find((c) => c.id === id);

  return (
    <View style={styles.headerTitleContainer}>
      <Image source={{ uri: chat?.image }} style={styles.profileImage} />
      <Text style={styles.headerTitle}>{chat?.name}</Text>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const chat = chats.find((c) => c.id === id);
  const chatMessages = messages[id as string] || [];

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message here
      setMessage('');
    }
  };

  const renderMessage = ({ item }) => (
    <Message
      text={item.text}
      timestamp={item.timestamp}
      isSender={item.isSender}
      isRead={item.isRead}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle />,
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerBackTitle: '',
        }}
      />
      <View style={styles.messagesContainer}>
        {chatMessages.length > 0 ? (
          <FlatList
            data={chatMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.messageContent}>
            <Text style={styles.placeholder}>No messages yet</Text>
          </View>
        )}
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              multiline
              maxHeight={100}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={!message.trim()}
            >
              <FontAwesome name="send" size={20} color={message.trim() ? "#FF6F00" : "#ccc"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    paddingVertical: 16,
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    color: '#666',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    minHeight: 44,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 12,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
  },
}); 