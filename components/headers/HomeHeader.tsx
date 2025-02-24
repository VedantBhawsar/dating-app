import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';

const HomeHeader = () => {
  return (
    <View style={styles.header}>
      {/* Left Side: Menu Icon */}
      <TouchableOpacity style={styles.iconButton}>
        <FontAwesome5 name="filter" size={18} color="black" />
      </TouchableOpacity>
      
      {/* Center: Title */}
      <Text style={styles.title}>Connect</Text>

      {/* Right Side: Language Icon (Globe) */}
      <TouchableOpacity style={styles.iconButton}>
        <FontAwesome5 name="globe" size={18} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6F00',
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
});

export default HomeHeader;
