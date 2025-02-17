import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState(null);
  const [profileData, setProfileData] = useState({
    name: 'Dipraj Rajput',
    age: '24',
    occupation: 'Software Developer',
    income: '10 LPA',
    location: 'Mumbai, India',
    education: 'B.E. Computer Science',
    height: "5'9\"",
    interests: 'Coding, Biking, Sci-Fi Movies',
    clanGotra: 'Rajput',
    gan: 'Dev',
    nakshatra: 'Ashwini',
  });
  
  const [inputValue, setInputValue] = useState('');

  const images = [
    'https://plus.unsplash.com/premium_photo-1673734626655-0c1dc4be0e9c?q=80&w=1887',
    'https://plus.unsplash.com/premium_photo-1672322565907-932e7554b1cc?q=80&w=1887',
    'https://plus.unsplash.com/premium_photo-1672239496290-5061cfee7ebb?q=80&w=1887'
  ];

  const handleEdit = (field) => {
    setEditField(field);
    setInputValue(profileData[field]);
    setModalVisible(true);
  };

  const saveEdit = () => {
    setProfileData({ ...profileData, [editField]: inputValue });
    setModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerWrapper}>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={28} color="white" />
        </TouchableOpacity>
        <Image source={{ uri: images[0] }} style={styles.profileImage} />
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit('name')}>
          <Ionicons name="create-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>{profileData.name}</Text>
        <TouchableOpacity onPress={() => handleEdit('age')}><Text style={styles.detail}>Age: {profileData.age}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit('occupation')}><Text style={styles.detail}>Occupation: {profileData.occupation}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit('income')}><Text style={styles.detail}>Income: {profileData.income}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit('location')}><Text style={styles.detail}>Location: {profileData.location}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit('education')}><Text style={styles.detail}>Education: {profileData.education}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit('height')}><Text style={styles.detail}>Height: {profileData.height}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit('interests')}><Text style={styles.detail}>Interests: {profileData.interests}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit('clanGotra')}><Text style={styles.detail}>Clan/Gotra: {profileData.clanGotra}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit('gan')}><Text style={styles.detail}>Gan: {profileData.gan}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit('nakshatra')}><Text style={styles.detail}>Nakshatra: {profileData.nakshatra}</Text></TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Gallery</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
        {images.map((img, index) => (
          <Image key={index} style={styles.galleryImage} source={{ uri: img }} />
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            autoFocus
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f9f9f9', alignItems: 'center' },
  headerWrapper: { width: '100%', height: 250, backgroundColor: '#FF5864', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  profileImage: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#fff' },
  editButton: { position: 'absolute', left: 20, top: 20 },
  settingsButton: { position: 'absolute', right: 20, top: 20 },
  card: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 20, marginTop: -50, elevation: 5 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  detail: { fontSize: 16, color: '#555', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15 },
  gallery: { flexDirection: 'row', marginTop: 10 },
  galleryImage: { width: 90, height: 90, borderRadius: 10, marginHorizontal: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  input: { width: '80%', backgroundColor: '#fff', padding: 10, fontSize: 16, borderRadius: 5 },
  saveButton: { backgroundColor: '#FF5864', padding: 10, marginTop: 10, borderRadius: 5 },
  saveButtonText: { color: 'white', fontWeight: 'bold' }
});

export default ProfileScreen;
