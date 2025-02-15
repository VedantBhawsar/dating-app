import { View, SafeAreaView, StyleSheet, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import ChatsHeader from '../../components/headers/ChatHeader';

const chats = [
  { id: '1', name: 'Sophia', message: 'Hey, how are you?', image: 'https://plus.unsplash.com/premium_photo-1673792686302-7555a74de717?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '2', name: 'Liam', message: 'Let’s catch up soon!', image: 'https://plus.unsplash.com/premium_photo-1689977927774-401b12d137d6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '3', name: 'Emma', message: 'Had a great time today! 😊', image: 'https://plus.unsplash.com/premium_photo-1688676796006-bbd1599bbfb6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '4', name: 'Noah', message: 'See you tomorrow.', image: 'https://images.unsplash.com/photo-1551024739-78e9d60c45ca?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '5', name: 'Ava', message: 'Can’t wait for the weekend!', image: 'https://images.unsplash.com/photo-1600600423621-70c9f4416ae9?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '6', name: 'Oliver', message: 'Let’s plan something fun.', image: 'https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '7', name: 'Sophia', message: 'Hey, how are you?', image: 'https://images.unsplash.com/photo-1464863979621-258859e62245?q=80&w=1886&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '8', name: 'Liam', message: 'Let’s catch up soon!', image: 'https://images.unsplash.com/photo-1597586124394-fbd6ef244026?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '9', name: 'Emma', message: 'Had a great time today! 😊', image: 'https://images.unsplash.com/photo-1516195851888-6f1a981a862e?q=80&w=1905&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '10', name: 'Noah', message: 'See you tomorrow.', image: 'https://images.unsplash.com/photo-1599201463146-a2540b76e216?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

const ChatsScreen = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.chatCard}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.chatDetails}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message} numberOfLines={1}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ChatsHeader />
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatList: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatDetails: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#777',
    marginTop: 3,
  },
});

export default ChatsScreen;
