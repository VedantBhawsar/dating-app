import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Image, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { messageService } from '../../services/api';
import socketService, { Message } from '../../services/socketService';
import useChatStore from '../../store/chatStore';

const CustomHeaderTitle = ({ chatIdToDisplay }: { chatIdToDisplay: string }) => {
  const { chats } = useChatStore();
  const chatToDisplay = chatIdToDisplay ? chats.find(c => c.chatId === chatIdToDisplay) : null;
  const name = chatToDisplay?.user.name || 'Chat';
  const avatarUrl = chatToDisplay?.user.profilePicture;
  const router = useRouter();
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
        <Ionicons name="arrow-back" size={24} color="#FF6F00" />
      </TouchableOpacity>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} />
      ) : (
        <View style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="person" size={20} color="#757575" />
        </View>
      )}
      <Text style={{ fontSize: 17, fontWeight: '600' }} numberOfLines={1}>{name}</Text>
    </View>
  );
};

const MessageBubble = ({ message, isSender }: { message: Message; isSender: boolean }) => {
  const formattedTime = new Date(message.sentAt).toLocaleTimeString([], { hour: "numeric", minute: "numeric", hour12: true });

  console.log("message", message)

  return (
    <View style={styles.messageContainer}>
      {!isSender && (
        message.sender?.profilePicture ? 
        <Image source={{ uri: message.sender.profilePicture }} style={styles.profilePicture} /> :
        <View style={[styles.profilePicture, styles.profilePicturePlaceholder]}>
          <Ionicons name="person" size={20} color="#757575" />
        </View>
      )}
      <View style={[styles.messageBubble, isSender ? styles.senderBubble : styles.receiverBubble]}>
        <Text style={[styles.messageText, isSender ? styles.senderText : styles.receiverText]}>{message.content}</Text>
        <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', marginTop: 4 }}>
          <Text style={[styles.messageTime, isSender ? styles.senderTime : styles.receiverTime]}>{formattedTime}</Text>
          {isSender && (
            <Ionicons name={message.isRead ? "checkmark-done" : "checkmark"} size={16} color={message.isRead ? '#4FC3F7' : 'rgba(255, 255, 255, 0.7)'} style={{ marginLeft: 5 }} />
          )}
        </View>
      </View>
    </View>
  );
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const chatId = Array.isArray(id) ? id[0] : id;
  
  const { currentUserId, markChatAsReadByCurrentUser } = useChatStore();
  const chatDetails = useChatStore(state => state.chats.find(c => c.chatId === chatId));
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessagesAndMarkRead = useCallback(async () => {
    if (!chatId || !currentUserId) return;
    setIsLoading(true);
    try {
      const data = await messageService.getMessages(chatId);
      const fetchedMessages = data.messages || [];
      setMessages(fetchedMessages);

      const unreadMessageIds = fetchedMessages
        .filter((msg: { senderId: string; _id: string; isRead?: boolean; status?: string }) => msg.senderId !== currentUserId && !msg.isRead)
        .map((msg: { _id: string }) => msg._id);

      if (unreadMessageIds.length > 0) {
        markChatAsReadByCurrentUser(chatId, unreadMessageIds);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load messages.");
    } finally {
      setIsLoading(false);
    }
  }, [chatId, currentUserId, markChatAsReadByCurrentUser]);

  const handleNewMessage = useCallback((newMessage: Message) => {
    if (newMessage.chatId === chatId) {
      setMessages(prev => [newMessage, ...prev]);
      }
  }, [chatId, currentUserId, markChatAsReadByCurrentUser]);

  const handleIncomingReadReceipt = useCallback((data: { chatId: string; messageIds: string[]; readerId: string }) => {
    if (data.chatId === chatId && data.readerId !== currentUserId) {
      setMessages(prev =>
        prev.map(msg =>
          data.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );
    }
  }, [chatId, currentUserId]);
  
  const handleTypingIndicator = useCallback((data: { chatId: string, userId: string }) => {
    if (data.chatId === chatId && data.userId !== currentUserId) {
      setIsTyping(true);
      if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    }
  }, [chatId, currentUserId]);

  useEffect(() => {
    fetchMessagesAndMarkRead();
    
    const setupSockets = async () => {
      await socketService.connect();
      socketService.joinChat(chatId);
      socketService.on('new-message', handleNewMessage);
      socketService.on('messages-read', handleIncomingReadReceipt);
      socketService.on('user-typing', handleTypingIndicator);
    };

    setupSockets();

    return () => {
      socketService.off('new-message', handleNewMessage);
      socketService.off('messages-read', handleIncomingReadReceipt);
      socketService.off('user-typing', handleTypingIndicator);
      if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [chatId, fetchMessagesAndMarkRead, handleNewMessage, handleIncomingReadReceipt, handleTypingIndicator]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatId) return;
    socketService.sendMessage(chatId, inputText.trim());
    setInputText('');
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    socketService.sendTypingIndicator(chatId);
  };


  console.log("currentUserId", currentUserId)

  if (isLoading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6F00" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: () => <CustomHeaderTitle chatIdToDisplay={chatId} />, headerShown: true, headerBackVisible: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView} keyboardVerticalOffset={90}>
        <FlatList
          data={messages}
          inverted={true}
          renderItem={({ item }) => <MessageBubble message={item} isSender={item.sender.id === currentUserId} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
        />
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{chatDetails?.user?.name || 'User'} is typing...</Text>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={!inputText.trim()}>
            <Ionicons name="send" size={24} color={inputText.trim() ? '#FF6F00' : '#CCC'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  keyboardAvoidingView: { flex: 1 },
  messagesList: { paddingHorizontal: 10, paddingBottom: 10 },
  messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 5 },
  profilePicture: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  profilePicturePlaceholder: { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  messageBubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  senderBubble: { backgroundColor: '#FF6F00', alignSelf: 'flex-end', marginLeft: 'auto', borderBottomRightRadius: 4 },
  receiverBubble: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22 },
  senderText: { color: '#FFFFFF' },
  receiverText: { color: '#333333' },
  messageTime: { fontSize: 11, opacity: 0.9 },
  senderTime: { color: 'rgba(255, 255, 255, 0.8)' },
  receiverTime: { color: '#999' },
  inputContainer: { flexDirection: 'row', padding: 8, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EEEEEE', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 16, marginRight: 8 },
  sendButton: { padding: 8 },
  typingIndicator: { paddingHorizontal: 16, paddingBottom: 5 },
  typingText: { color: '#666', fontStyle: 'italic' },
});