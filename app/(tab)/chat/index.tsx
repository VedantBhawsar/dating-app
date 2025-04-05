import { View, SafeAreaView, StyleSheet, FlatList } from 'react-native';
import React from 'react';
import SearchBar from '../../../components/chat/SearchBar';
import RecentContacts from '../../../components/chat/RecentContacts';
import ChatListItem from '../../../components/chat/ChatListItem';
import ChatHeader from '../../../components/headers/ChatHeader';
import { Chat, chats } from '../../../data/chats';

export default function ChatsScreen() {
  const renderItem = ({ item }: { item: Chat }) => (
    <ChatListItem
      id={item.id}
      name={item.name}
      message={item.message}
      image={item.image}
      time={item.time}
      unreadCount={item.unreadCount}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ChatHeader />
        <View style={styles.searchContainer}>
          <SearchBar value="" onChangeText={() => {}} />
        </View>
        <View style={styles.recentContactsContainer}>
          <RecentContacts />
        </View>
        <FlatList
          data={chats}
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
});
