import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const MatchesHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Matches</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20, // Added padding for left alignment
    alignItems: 'flex-start', // Align text to the left
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Shadow effect for Android
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF5864',
  },
});

export default MatchesHeader;
