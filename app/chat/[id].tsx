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
import { messageService } from '../../services/api';
import socketService, { Message } from '../../services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Message bubble component
const MessageBubble = ({ message, isSender }: { message: Message, isSender: boolean }) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <View style={[
      styles.messageBubble, 
      isSender ? styles.senderBubble : styles.receiverBubble
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
  );
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  console.log(id)
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

  console.log(chatId, userId)

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const parsedUserInfo = JSON.parse(userInfo);
          console.log('User info retrieved:', parsedUserInfo.id);
          setUserId(parsedUserInfo.id);
        } else {
          console.error('No user info found in AsyncStorage');
          // Redirect to login if no user info is found
          router.replace('/auth/login');
        }
      } catch (err) {
        console.error('Error getting user ID:', err);
      }
    };
    
    getUserId();
  }, [router]);

  // Fetch chat info and messages
  const fetchChatData = async () => {
    try {
      // Alert.alert('Fetching chat data for chat ID:', chatId);
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching chat data for chat ID:', chatId);
      
      // Get chat details
      const chatDetails = await messageService.getChatById(chatId);
      console.log('Chat details received:', chatDetails);
      setChatInfo(chatDetails);
      
      // Get messages
      const messagesData = await messageService.getMessages(chatId);
      console.log('Messages received:', messagesData?.length || 0);
      
      if (Array.isArray(messagesData)) {
        setMessages(messagesData.reverse()); // Newest messages at the bottom
        
        // Mark unread messages as read
        const unreadMessages = messagesData
          .filter((msg: any) => !msg.isRead && msg.senderId !== userId)
          .map((msg: any) => msg.id);
          
        if (unreadMessages.length > 0) {
          await messageService.markMessagesAsRead(chatId, unreadMessages);
        }
      } else {
        console.error('Messages data is not an array:', messagesData);
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Error fetching chat data:', err);
      setError(err.message || 'Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  // Main useEffect for initialization
  useEffect(() => {
    console.log('Chat detail screen initialized with chat ID:', chatId);
    const getUserId = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('accessToken');
        console.log(userInfo)
        if (userInfo) {
          const parsedUserInfo = JSON.parse(userInfo);
          setUserId(parsedUserInfo.id);
        } else {
          console.error('No user info found in AsyncStorage');
          // Redirect to login if no user info is found
          // router.replace('/auth/login');
        }
      } catch (err) {
        console.error('Error getting user ID:', err);
      }
    };
    
    getUserId();
    
    // Connect to socket and join chat room
    const initializeSocket = async () => {
      try {
        console.log('Connecting to socket and joining chat:', chatId);
        await socketService.connect();
        socketService.joinChat(chatId);
        
        // Listen for new messages
        const handleNewMessage = (newMessage: Message) => {
          console.log('New message received:', newMessage);
          if (newMessage.chatId === chatId) {
            setMessages(prevMessages => [newMessage, ...prevMessages]);
            
            // Mark message as read if it's not from current user
            if (newMessage.senderId !== userId) {
              messageService.markMessagesAsRead(chatId, [newMessage.id]);
            }
          }
        };
        
        // Listen for typing indicators
        const handleTypingIndicator = (data: any) => {
          console.log('Typing indicator received:', data);
          if (data.chatId === chatId && data.userId !== userId) {
            setIsTyping(true);
            
            // Clear previous timeout if exists
            if (typingIndicatorTimeoutRef.current) {
              clearTimeout(typingIndicatorTimeoutRef.current);
            }
            
            // Hide typing indicator after 3 seconds
            typingIndicatorTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, 3000);
          }
        };
        
        socketService.on('new-message', handleNewMessage);
        socketService.on('user-typing', handleTypingIndicator);
        
        // Listen for read receipts
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
          
          // Clear timeout on cleanup
          if (typingIndicatorTimeoutRef.current) {
            clearTimeout(typingIndicatorTimeoutRef.current);
          }
        };
      } catch (err) {
        console.error('Failed to connect to WebSocket:', err);
      }
    };
    
    initializeSocket();
    fetchChatData();
  }, [chatId, userId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    try {
      console.log('Sending message:', inputText);
      const messageText = inputText;
      setInputText('');
      
      // Send message via API
      const newMessage = await messageService.sendMessage(chatId, messageText);
      console.log('New message:', newMessage)
      // Send message via socket for real-time updates
      await socketService.sendMessage(chatId, inputText.trim());
      console.log('Message sent successfully');
      
      // Clear typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      // Could show an error toast here
    }
  };

  // Handle typing indicator
  const handleTyping = (text: string) => {
    console.log('User typing:', text);
    setInputText(text);
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Send typing indicator via socket
    socketService.sendTypingIndicator(chatId);
    
    // Set new timeout
    setTypingTimeout(setTimeout(() => {
      // This prevents sending too many typing events
    }, 1000));
  };

  // Render loading state
  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Chat',
            headerShown: true,
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F00" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Chat',
            headerShown: true,
            headerBackTitle: 'Back',
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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: chatInfo?.otherUser?.displayName || chatInfo?.otherUser?.firstName || 'Chat',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          inverted
          renderItem={({ item }) => (
            <MessageBubble 
              message={item} 
              isSender={item.senderId === userId}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
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
    paddingBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
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
  },
  receiverBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
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
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
    padding: 8,
  },
  typingIndicator: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 5,
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
