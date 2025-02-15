import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const images = [
    'https://plus.unsplash.com/premium_photo-1673734626655-0c1dc4be0e9c?q=80&w=1887',
    'https://plus.unsplash.com/premium_photo-1672322565907-932e7554b1cc?q=80&w=1887',
    'https://plus.unsplash.com/premium_photo-1672239496290-5061cfee7ebb?q=80&w=1887',
    'https://plus.unsplash.com/premium_photo-1673734626655-0c1dc4be0e9c?q=80&w=1887'
  ];

  const openImage = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header with Edit & Settings Buttons */}
      <View style={styles.headerWrapper}>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={28} color="white" />
        </TouchableOpacity>
        <Image source={{ uri: images[0] }} style={styles.profileImage} />
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>Dipraj Rajput</Text>
        <Text style={styles.bio}>Software Developer 🚀</Text>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.about}>I love coding, biking, and watching sci-fi movies. Building innovative web & mobile applications is my passion! 🚀</Text>

        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.tagsContainer}>
          <Text style={styles.tag}>💻 Coding</Text>
          <Text style={styles.tag}>🏍️ Biking</Text>
          <Text style={styles.tag}>🎬 Sci-Fi Movies</Text>
        </View>

        <Text style={styles.sectionTitle}>Gallery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {images.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => openImage(img)}>
              <Image style={styles.galleryImage} source={{ uri: img }} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Fullscreen Image Viewer Modal */}
      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  headerWrapper: {
    width: '100%',
    height: 300,
    backgroundColor: '#FF5864',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editButton: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginTop: -50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  location: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  about: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#FF5864',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
    fontSize: 14,
  },
  gallery: {
    flexDirection: 'row',
    marginTop: 10,
  },
  galleryImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '80%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
