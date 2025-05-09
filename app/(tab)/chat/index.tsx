import { View, SafeAreaView, StyleSheet, FlatList, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import SearchBar from '../../../components/chat/SearchBar';
import RecentContacts from '../../../components/chat/RecentContacts';
import ChatListItem from '../../../components/chat/ChatListItem';
import ChatHeader from '../../../components/headers/ChatHeader';
import { Chat } from '../../../data/chats';
import { messageService } from '../../../services/api';
import socketService from '../../../services/socketService';
import { router } from 'expo-router';

export default function ChatsScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

  // Function to fetch chats from the backend
  const fetchChats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await messageService.getChats();
      
      // Transform the API response to match our Chat interface
      const transformedChats = response.map((chat: any) => ({
        id: chat.id,
        name: chat.otherUser?.displayName || chat.otherUser?.firstName || 'Unknown',
        message: chat.lastMessage?.content || 'No messages yet',
        image: chat.otherUser?.avatarUrl || 'https://via.placeholder.com/50',
        time: new Date(chat.lastMessage?.createdAt || chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount: chat.unreadCount || 0,
      }));
      
      setChats(transformedChats);
      setFilteredChats(transformedChats);
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      setError(err.message || 'Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to WebSocket when component mounts
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketService.connect();
        
        // Listen for new messages
        socketService.on('new-message', (data) => {
          console.log('New message received:', data);
          // Refresh chats to show the latest message
          fetchChats();
        });
        
        // Listen for messages being read
        socketService.on('messages-read', (data) => {
          console.log('Messages marked as read:', data);
          // Refresh chats to update unread counts
          fetchChats();
        });
        
        // Listen for new notifications
        socketService.on('new-notification', (data) => {
          console.log('New notification received:', data);
          // Handle notification (could show a toast or update UI)
        });
      } catch (err) {
        console.error('Failed to connect to WebSocket:', err);
      }
    };
    
    initializeSocket();
    fetchChats();
    
    // Cleanup function to disconnect socket when component unmounts
    return () => {
      socketService.off('new-message', () => {});
      socketService.off('messages-read', () => {});
      socketService.off('new-notification', () => {});
    };
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  // Navigate to chat detail screen
  const handleChatPress = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const renderItem = ({ item }: { item: Chat }) => (
    <ChatListItem
      id={item.id}
      name={item.name}
      message={item.message}
      image={item.image}
      time={item.time}
      unreadCount={item.unreadCount}
      onPress={() => handleChatPress(item.id)}
    />
  );

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ChatHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F00" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ChatHeader />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchChats}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (filteredChats.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ChatHeader />
          <View style={styles.searchContainer}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() !== '' 
                ? 'No chats match your search' 
                : 'No chats yet. Match with someone to start chatting!'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render chats list
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ChatHeader />
        <View style={styles.searchContainer}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        <View style={styles.recentContactsContainer}>
          <RecentContacts />
        </View>
        <FlatList
          data={filteredChats}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  recentContactsContainer: {
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
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
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
