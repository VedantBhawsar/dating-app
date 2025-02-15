import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window'); // 📲 Get Screen Size

const SwipeCard = ({ profile }) => {
  if (!profile) return null; // 🛑 Prevents "profile is undefined" error

  return (
    <View style={styles.card}>
      {/* Profile Image */}
      <Image source={{ uri: profile.image }} style={styles.image} />

      {/* Match Percentage */}
      <View style={styles.matchBadge}>
        <FontAwesome name="heart" size={14} color="white" />
        <Text style={styles.matchText}>{profile.match}% Match!</Text>
      </View>

      {/* Name & Bio */}
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.bio}>{profile.bio}</Text>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#FF5864' }]}>
          <FontAwesome name="times" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#6A0DAD' }]}>
          <FontAwesome name="heart" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: width * 0.9, // 📲 Responsive width
    maxHeight: height * 0.75, // 🔥 Prevents overflow on smaller screens
  },
  image: {
    width: '100%',
    height: height * 0.5, // 📲 Responsive image height
    borderRadius: 10,
  },
  matchBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#6A0DAD',
    padding: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  bio: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 15,
  },
  iconButton: {
    padding: 15,
    borderRadius: 50,
  },
});

export default SwipeCard;
