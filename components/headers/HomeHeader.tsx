import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { FontAwesome5, Feather, MaterialIcons } from '@expo/vector-icons';

const HomeHeader = () => {
  return (
    <View style={styles.header}>
      {/* Left Side: Location Selector */}
      <TouchableOpacity style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={22} color="#FF5864" />
        <Text style={styles.locationText}>Mumbai</Text>
        <Feather name="chevron-down" size={18} color="black" />
      </TouchableOpacity>

      {/* Center: Tinder Title (Slightly Right Shifted) */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Connect</Text>
      </View>

      {/* Right Side: Filter Icon */}
      <TouchableOpacity style={styles.filterButton}>
        <FontAwesome5 name="sliders-h" size={18} color="white" />
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1, // Ensures left side takes space
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  titleContainer: {
    position: 'absolute',
    left: '52%', // 🔥 Shifted slightly to right
    transform: [{ translateX: -30 }], // Adjusting for proper centering
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF5864',
    textAlign: 'center',
  },
  filterButton: {
    backgroundColor: '#FF5864',
    padding: 8,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 40,
  },
});

export default HomeHeader;
