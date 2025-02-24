import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';

const ChatsHeader = () => {
  return (
    <View style={styles.header}>
      {/* Title: Chats */}
      <Text style={styles.title}>Chats</Text>

      {/* Right Side: Search Icon */}
      <TouchableOpacity style={styles.iconButton}>
        <FontAwesome5 name="search" size={18} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center',
    justifyContent: 'space-between', // Pushes title to the left and button to the right
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  iconButton: {
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
});

export default ChatsHeader;
