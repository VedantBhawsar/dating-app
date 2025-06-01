import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService, messageService } from '../../services/api';
import socketService, { Message } from '../../services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomHeaderTitle = ({ name, avatarUrl }: { name: string, avatarUrl?: string }) => {
    console.log("name", name)
    const router = useRouter();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#FF6F00" />
        </TouchableOpacity>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }}
        />
      ) : (
        <View style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="person" size={20} color="#757575" />
        </View>
      )}
      <Text style={{ fontSize: 17, fontWeight: '600', color: '#000' }} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

const MessageBubble = ({ message, isSender }: { message: Message, isSender: boolean }) => {
  const formattedTime = new Date(message.sentAt).toLocaleTimeString(["en-US"], {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return (
    <View style={styles.messageContainer}>
      {!isSender && message.sender.profilePicture && (
        <Image source={{ uri: message.sender.profilePicture }} style={styles.profilePicture} />
      )}
      {!isSender && !message.sender.profilePicture && (
         <View style={[styles.profilePicture, styles.profilePicturePlaceholder]}>
            <Ionicons name="person" size={20} color="#757575" />
         </View>
      )}
      <View style={[
        styles.messageBubble,
        isSender ? styles.senderBubble : styles.receiverBubble,
        !isSender && { marginLeft: message.sender.profilePicture ? 0 : 10 } // Adjust margin if no profile picture for receiver
      ]}>
        {message.messageType === 'IMAGE' ? (
          <Image
            source={{ uri: message.content }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={[
            styles.messageText,
            isSender ? styles.senderText : styles.receiverText
          ]}>
            {message.content}
          </Text>
        )}
        <Text style={[
          styles.messageTime,
          isSender ? styles.senderTime : styles.receiverTime
        ]}>
          {formattedTime}
          {isSender && (
            <Text> {message.isRead ? '✓✓' : '✓'}</Text>
          )}
        </Text>
      </View>
    </View>
  );
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const chatId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const typingIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('accessToken');
        if (userInfo) {
          const data = await authService.getUserByToken();
          setUserId(data.id);
        }
      } catch (err) {
        console.error('Error getting user ID:', err);
      }
    };
    getUserId();
  }, [router]);

  const fetchChatData = async () => {
    if (!chatId || !userId) {
        // Wait for chatId and userId to be available
        if (!chatId) console.warn('Chat ID not available for fetching data.');
        if (!userId) console.warn('User ID not available for fetching data.');
        return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const chatDetails = await messageService.getChatById(chatId);
      setChatInfo(chatDetails); // Assuming chatDetails contains otherUser info

      const messagesData = await messageService.getMessages(chatId);

      if (Array.isArray(messagesData.messages)) {
        setMessages(messagesData.messages.slice().reverse());
        const unreadMessages = messagesData.messages
          .filter((msg: any) => !msg.isRead && msg.senderId !== userId)
          .map((msg: any) => msg.id);

        if (unreadMessages?.length > 0) {
          const response = await messageService.markMessagesAsRead(chatId, unreadMessages);
          console.log("response", response)
        }
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Error fetching chat data:', err);
      setError(err.message || 'Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatId && userId) {
        fetchChatData();

        const initializeSocket = async () => {
            try {
                await socketService.connect();
                socketService.joinChat(chatId);

                const handleNewMessage = (newMessage: Message) => {
                    if (newMessage.chatId === chatId) {
                        if (sentMessageIds.has(newMessage.id)) {
                            return;
                        }
                        setMessages(prevMessages => {
                            const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
                            if (messageExists) {
                                return prevMessages;
                            }
                            if (newMessage.senderId === userId) {
                                setSentMessageIds(prev => new Set(prev).add(newMessage.id));
                                if (pendingMessages.has(newMessage.content)) {
                                    setPendingMessages(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(newMessage.content);
                                        return newSet;
                                    });
                                    return prevMessages
                                        .filter(msg => !(msg.id.startsWith('temp-') && msg.content === newMessage.content))
                                        .concat([newMessage])
                                        .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()) // Ensure correct order
                                        .reverse(); // Newest at bottom for inverted list
                                }
                            }
                            // Add new message to the top for inverted FlatList
                            return [newMessage, ...prevMessages];
                        });

                        if (newMessage.senderId !== userId) {
                            messageService.markMessagesAsRead(chatId, [newMessage.id]).then((response)=> {
                                console.log("response", response)
                                if (response.success) {
                                    messages.slice(0, response.markedAsRead).map((message) => {
                                        setMessages(prev => prev.map(msg => msg.id === message.id ? { ...msg, isRead: true } : msg))
                                    })
                                }
                            })
                        }
                    }
                };

                const handleTypingIndicator = (data: any) => {
                    if (data.chatId === chatId && data.userId !== userId) {
                        setIsTyping(true);
                        if (typingIndicatorTimeoutRef.current) {
                            clearTimeout(typingIndicatorTimeoutRef.current);
                        }
                        typingIndicatorTimeoutRef.current = setTimeout(() => {
                            setIsTyping(false);
                        }, 3000);
                    }
                };

                socketService.on('new-message', handleNewMessage);
                socketService.on('user-typing', handleTypingIndicator);

                const handleReadReceipt = (data: any) => {
                    if (data.chatId === chatId) {
                        setMessages(prev =>
                            prev.map(msg =>
                                data.messageIds.includes(msg.id)
                                    ? { ...msg, isRead: true }
                                    : msg
                            )
                        );
                    }
                };
                socketService.on('messages-read', handleReadReceipt);

                return () => {
                    socketService.off('new-message', handleNewMessage);
                    socketService.off('user-typing', handleTypingIndicator);
                    socketService.off('messages-read', handleReadReceipt);
                    if (typingIndicatorTimeoutRef.current) {
                        clearTimeout(typingIndicatorTimeoutRef.current);
                    }
                    // Consider whether to leave chat room or disconnect socket here based on app flow
                    // socketService.leaveChat(chatId);
                    // socketService.disconnect();
                };
            } catch (err) {
                console.error('Failed to connect to WebSocket:', err);
            }
        };
        initializeSocket();
    }
  }, [chatId, userId]); // Rerun when chatId or userId is available/changes

  const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set());
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(new Set());

  const handleSendMessage = async () => {
    if (!inputText.trim() || !userId) return;

    try {
      const messageText = inputText.trim();
      setInputText('');

      setPendingMessages(prev => new Set(prev).add(messageText));

      await socketService.sendMessage(chatId, messageText);

      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert("Error", "Failed to send message. Please try again.");
      // Revert optimistic update if needed or mark message as failed
      // setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    socketService.sendTypingIndicator(chatId);
    setTypingTimeout(setTimeout(() => {
    }, 1000));
  };

  const otherUserName = chatInfo?.otherUser?.displayName || chatInfo?.otherUser?.firstName || 'Chat';
  const otherUserAvatar = chatInfo?.otherUser?.profilePicture;

  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: () => <CustomHeaderTitle name="Chat" />,
            headerShown: true,
            headerBackTitle: '',
            headerTintColor: '#FF6F00',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F00" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: () => <CustomHeaderTitle name="Chat" />,
            headerShown: true,
            headerBackTitle: '',
            headerTintColor: '#FF6F00',
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchChatData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const participants = chatInfo?.participants[0]

  console.log(participants)
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <CustomHeaderTitle name={participants?.name} avatarUrl={participants?.profilePicture} />,
          headerShown: true,
          headerTintColor: '#FF6F00', // Color for back arrow and other header items
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (/* Header Height approx */ 60 + /* Safe Area Top */ 30) : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          inverted
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isSender={item.sender.id === userId} // Ensure senderId is used for comparison
            />
          )}
          keyExtractor={(item) => item.id.toString()} // Ensure key is a string
          contentContainerStyle={styles.messagesList}
          onEndReachedThreshold={0.5}
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#FF6F00" />
            <Text style={styles.typingText}>
              {chatInfo?.otherUser?.firstName || 'User'} is typing...
            </Text>
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
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() ? '#FF6F00' : '#CCC'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 8, // Reduced padding
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10, // Adjusted padding
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  senderBubble: {
    backgroundColor: '#FF6F00',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    marginLeft: "auto"
  },
  receiverBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22, // Improved readability
  },
  senderText: {
    color: '#FFFFFF',
  },
  receiverText: {
    color: '#333333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.8, // Subtle time
  },
  senderTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  receiverTime: {
    color: '#999',
    textAlign: 'left',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6, // Reduced margin
  },
  profilePicture: {
    width: 36, // Slightly smaller
    height: 36,
    borderRadius: 18,
    marginRight: 8, // Adjusted margin
    marginBottom: 2, // Align with bubble bottom
  },
  profilePicturePlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8, // Reduced padding
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'flex-end', // Align items to bottom for multiline input
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8, // Adjust padding for platforms
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 100, // Max height for multiline
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40, // Match typical input height
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});