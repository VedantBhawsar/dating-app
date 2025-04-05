import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';

const recentContacts = [
  { id: '1', name: 'Abdul', image: 'https://i.pravatar.cc/150?img=1', isActive: true },
  { id: '2', name: 'Nora', image: 'https://i.pravatar.cc/150?img=2', isActive: true },
  { id: '3', name: 'Adithya', image: 'https://i.pravatar.cc/150?img=3', isActive: true },
  { id: '4', name: 'Vitho', image: 'https://i.pravatar.cc/150?img=4', isActive: false },
  { id: '5', name: 'Inam', image: 'https://i.pravatar.cc/150?img=5', isActive: true },
];

export default function RecentContacts() {
  const activeContacts = recentContacts.filter(contact => contact.isActive);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {activeContacts.map((contact) => (
          <TouchableOpacity key={contact.id} style={styles.contactContainer}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: contact.image }} style={styles.avatar} />
              <View style={styles.activeIndicator} />
            </View>
            <Text style={styles.name}>{contact.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollView: {
    paddingLeft: 16,
  },
  contactContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 12,
    color: '#666',
  },
}); 