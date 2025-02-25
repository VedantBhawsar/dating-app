import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [profileData, setProfileData] = useState({
    name: 'Sam ALtman',
    email: 'dipraj@example.com',
    phone: '9898712132',
    education: 'B.E. Computer Science',
    occupation: 'Software Developer',
    location: 'Mumbai, India',
    income: '10 LPA',
    age: '24',
    height: "5'9",
    clanGotra: 'Rajput',
    gan: 'Dev',
    nakshatra: 'Ashwini',
    interests: 'Coding, Biking, Sci-Fi Movies'
  });

  const [inputValue, setInputValue] = useState('');

  const handleEditClick = () => {
    if (selectedField) {
      setEditField(selectedField);
      setInputValue(profileData[selectedField]);
      setModalVisible(true);
    }
  };

  const saveEdit = () => {
    setProfileData({ ...profileData, [editField]: inputValue });
    setModalVisible(false);
    setSelectedField(null);
  };

  const calculateProfileCompletion = () => {
    const totalFields = Object.keys(profileData).length;
    const filledFields = Object.values(profileData).filter(value => value !== '').length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const getCompletionColor = () => {
    if (profileCompletion < 34) return '#FF6B6B';
    if (profileCompletion < 67) return '#FFD93D';
    return '#6BCB77';
  };

  const galleryImages = [
    { uri: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { uri: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { uri: 'https://images.unsplash.com/photo-1539125530496-3ca408f9c2d9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { uri: 'https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Edit Button Positioned at the Top Left */}
      <TouchableOpacity style={styles.editButtonTopLeft} onPress={handleEditClick}>
        <Ionicons name="create-outline" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.headerWrapper}>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://plus.unsplash.com/premium_photo-1673734626655-0c1dc4be0e9c?q=80&w=1887' }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.subText}>Active since - Jul, 2019</Text>
      </View>

      <View style={styles.completionContainer}>
        <View style={styles.strengthHeader}>
          <View style={styles.strengthTitleRow}>
            <Text style={styles.completionText}>PROFILE STRENGTH:</Text>
            <View style={styles.strengthLevelContainer}>
              <Text style={[styles.currentStrengthLevel, { color: getCompletionColor() }]}>
                {profileCompletion}%
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBar, { width: `${profileCompletion}%`, backgroundColor: getCompletionColor() }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Gallery Heading */}
      <View style={styles.galleryHeadingContainer}>
        <Text style={styles.galleryHeading}>Image Gallery</Text>
      </View>

      {/* Gallery Container */}
      <View style={styles.galleryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {galleryImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.galleryImage} />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionHeading}>Personal Information</Text>
      </View>

      <View style={styles.infoCard}>
        {Object.keys(profileData).map((key) => (
          key !== 'name' && (
            <View
              key={key}
              style={[styles.infoRow, selectedField === key && styles.selectedRow]}
            >
              <TouchableOpacity
                style={styles.infoContent}
                onPress={() => setSelectedField(key)}
              >
                <Text style={styles.label}>
                  {key.replace(/([A-Z])/g, ' $1').toUpperCase()}:
                </Text>
                <Text style={styles.infoText}>{profileData[key]}</Text>
              </TouchableOpacity>
            </View>
          )
        ))}
      </View>

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
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    alignItems: 'center'
  },
  editButtonTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25, // Same as the original button
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5, // Slightly adjusted for consistency
    elevation: 2,
    zIndex: 10,
  },
  
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25, // Same as the original button
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    zIndex: 10,
  },
  
  headerWrapper: {
    width: '100%',
    height: 250,
    backgroundColor: '#',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#000',
    marginTop: 50
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10
  },
  subText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20
  },
  completionContainer: {
    width: '90%',
    marginTop: 20,
    marginBottom: 20,
  },
  strengthHeader: {
    width: '100%',
  },
  strengthTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  completionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 1,
  },
  strengthLevelContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentStrengthLevel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  galleryHeadingContainer: {
    width: '90%',
    marginTop: 20,
  },
  galleryHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  galleryContainer: {
    width: '90%',
    marginTop: 20,
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  infoSection: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
  },
  infoCard: {
    width: '90%',
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  selectedRow: {
    backgroundColor: '#f0f0f0',
  },
  infoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  input: {
    width: 250,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#2e74b5',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileScreen;
