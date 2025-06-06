import { View, SafeAreaView, StyleSheet, FlatList, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import SearchBar from '../../../components/chat/SearchBar';
import ChatListItem from '../../../components/chat/ChatListItem';
import ChatHeader from '../../../components/headers/ChatHeader';
import socketService from '../../../services/socketService';
import useChatStore, { IStoreChat } from '../../../store/chatStore';
import { router, useFocusEffect } from 'expo-router';
import { authService } from '@/services/api';

export default function ChatsScreen() {
  const {
    chats,
    isLoading,
    error,
    fetchChats: storeFetchChats,
    setCurrentUserId,
    addMessageFromSocket,
    handleOtherUserReadReceipt,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchUserAndChats = async () => {
        try {
          const user = await authService.getUserByToken();
          setCurrentUserId(user.id);
          storeFetchChats();
        } catch (e) {
          console.error("Failed to get user or fetch chats", e);
        }
      };
      fetchUserAndChats();
    }, [setCurrentUserId, storeFetchChats])
  );

  const onNewMessage = useCallback((data: any) => {
    addMessageFromSocket(data.chatId, data.message, data.newChatData);
    console.log("New message received:", data);
  }, [addMessageFromSocket]);

  const onMessagesRead = useCallback((data: any) => {
    handleOtherUserReadReceipt(data.chatId, data.readerId, data.messageIds);
  }, [handleOtherUserReadReceipt]);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketService.connect();
        socketService.on('new-message', onNewMessage);
        socketService.on('messages-read', onMessagesRead);
      } catch (err) {
        console.error('Failed to connect to WebSocket:', err);
      }
    };

    initializeSocket();

    return () => {
      socketService.off('new-message', onNewMessage);
      socketService.off('messages-read', onMessagesRead);
    };
  }, [onNewMessage, onMessagesRead]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await storeFetchChats();
    } catch (e) {
      console.error("Failed to refresh chats on pull-to-refresh:", e);
      // Optionally, you could display a toast or other feedback to the user here
    } finally {
      setRefreshing(false);
    }
  }, [storeFetchChats]);

  const filteredChats = chats.filter((chat) =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const renderItem = ({ item }: { item: IStoreChat }) => (
    <ChatListItem
      id={item.chatId}
      name={item.user.name}
      message={item.lastMessage?.content || ''}
      image={item.user.profilePicture}
      time={item.lastActivity.toLocaleString()}
      unreadCount={item.unreadCount}
     onPress={() => handleChatPress(item.chatId)}
    />
  );

  if (isLoading && chats.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ChatHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F00" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ChatHeader />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={storeFetchChats}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ChatHeader />
        <View style={styles.searchContainer}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        {filteredChats.length > 0 ? (
          <FlatList
            data={filteredChats}
            renderItem={renderItem}
            keyExtractor={(item) => item.chatId}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#FF6F00']} // Android
                tintColor={'#FF6F00'} // iOS
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() !== '' ? 'No chats match your search' : 'No chats yet.'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
  searchContainer: { padding: 10, paddingBottom: 0 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#FF6F00', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: 'white', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
});