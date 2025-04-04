import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Dimensions, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  education: string;
  occupation: string;
  location: string;
  income: string;
  age: string;
  height: string;
  clanGotra: string;
  gan: string;
  nakshatra: string;
  interests: string;
  isVerified: boolean;
  verificationDate?: string;
  [key: string]: string | boolean | undefined;
}

interface GalleryImage {
  uri: string;
}

interface SettingsData {
  notifications: {
    messages: boolean;
    matches: boolean;
    profileViews: boolean;
    [key: string]: boolean;
  };
  privacy: {
    profileVisibility: boolean;
    showOnline: boolean;
    showLastSeen: boolean;
    [key: string]: boolean;
  };
  account: {
    emailNotifications: boolean;
    darkMode: boolean;
    [key: string]: boolean;
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// More precise responsive scaling
const scale = Math.min(screenWidth / 390, 1.2); // Using iPhone 14 as base width with a cap of 1.2
const normalizeFont = (size: number) => Math.round(size * Math.min(scale, 1)); // Cap font scaling at 1
const normalizeSpacing = (size: number) => Math.round(size * scale);

// Calculate dynamic sizes based on screen dimensions
const dynamicImageSize = Math.min(screenWidth * 0.28, 120); // Cap profile image size
const dynamicGalleryImageSize = Math.min(screenWidth * 0.2, 100); // Cap gallery image size
const dynamicHeaderHeight = Math.min(screenHeight * 0.28, 280); // Cap header height

const ProfileScreen = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState<keyof ProfileData | null>(null);
  const [selectedField, setSelectedField] = useState<keyof ProfileData | null>(null);
  const [profileImage, setProfileImage] = useState('https://plus.unsplash.com/premium_photo-1673734626655-0c1dc4be0e9c?q=80&w=1887');
  const [profileData, setProfileData] = useState<ProfileData>({
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
    interests: 'Coding, Biking, Sci-Fi Movies',
    isVerified: true,
    verificationDate: '2024-03-15'
  });

  const [inputValue, setInputValue] = useState('');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([
    { uri: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { uri: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { uri: 'https://images.unsplash.com/photo-1539125530496-3ca408f9c2d9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { uri: 'https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
  ]);

  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [editMode, setEditMode] = useState<'none' | 'profile' | 'gallery'>('none');

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsData, setSettingsData] = useState<SettingsData>({
    notifications: {
      messages: true,
      matches: true,
      profileViews: false,
    },
    privacy: {
      profileVisibility: true,
      showOnline: true,
      showLastSeen: true,
    },
    account: {
      emailNotifications: true,
      darkMode: false,
    },
  });

  const [currentSettingsTab, setCurrentSettingsTab] = useState<'notifications' | 'privacy' | 'account'>('notifications');

  const [orientation, setOrientation] = useState('portrait');

  const [editOptionsVisible, setEditOptionsVisible] = useState(false);

  useEffect(() => {
    // Handle orientation changes
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription.remove();
  }, []);

  // Adjust layout based on orientation
  const containerStyle = [
    styles.container,
    orientation === 'landscape' && styles.containerLandscape
  ];

  const headerStyle = [
    styles.headerWrapper,
    orientation === 'landscape' && styles.headerWrapperLandscape
  ];

  const galleryStyle = [
    styles.galleryContainer,
    orientation === 'landscape' && styles.galleryContainerLandscape
  ];

  const handleEditClick = () => {
    if (editMode !== 'none') {
      // Save changes and exit edit mode
      setEditMode('none');
      setSelectedField(null);
      setModalVisible(false);
    } else {
      // Show edit options modal
      setEditOptionsVisible(true);
    }
  };

  const handleEditOptionSelect = (option: 'profile' | 'gallery') => {
    setEditMode(option);
    setIsEditing(true);
    setEditOptionsVisible(false);
  };

  const handleImagePress = (uri: string) => {
    setSelectedImage(uri);
    setImagePreviewVisible(true);
  };

  const handleFieldEdit = (field: keyof ProfileData) => {
    if (editMode === 'profile') {
      setEditField(field);
      const value = profileData[field];
      // Only allow editing string fields
      if (typeof value === 'string') {
        setInputValue(value);
        setModalVisible(true);
      }
    }
  };

  const saveEdit = () => {
    if (editField) {
      // Only update if the field is a string type
      if (typeof profileData[editField] === 'string') {
        setProfileData({ ...profileData, [editField]: inputValue });
      }
    }
    setModalVisible(false);
    setSelectedField(null);
  };

  const pickImage = async (isProfilePic = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (isProfilePic) {
        setProfileImage(result.assets[0].uri);
      } else {
        setGalleryImages([...galleryImages, { uri: result.assets[0].uri }]);
      }
    }
  };

  const removeImage = (index: number) => {
    if (editMode === 'gallery') {
      const newGalleryImages = [...galleryImages];
      newGalleryImages.splice(index, 1);
      setGalleryImages(newGalleryImages);
    }
  };

  const handleSettingsPress = () => {
    setSettingsVisible(true);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            // Handle logout logic here
            router.replace("/(auth)/login" as any);
          }
        }
      ]
    );
  };

  const toggleSetting = (category: keyof SettingsData, setting: string) => {
    setSettingsData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const renderSettingsContent = () => {
    switch (currentSettingsTab) {
      case 'notifications':
        return (
          <View style={styles.settingsSection}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>New Messages</Text>
              <Switch
                value={settingsData.notifications.messages}
                onValueChange={() => toggleSetting('notifications', 'messages')}
                trackColor={{ false: '#767577', true: '#FF6F00' }}
                thumbColor={settingsData.notifications.messages ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>New Matches</Text>
              <Switch
                value={settingsData.notifications.matches}
                onValueChange={() => toggleSetting('notifications', 'matches')}
                trackColor={{ false: '#767577', true: '#FF6F00' }}
                thumbColor={settingsData.notifications.matches ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Profile Views</Text>
              <Switch
                value={settingsData.notifications.profileViews}
                onValueChange={() => toggleSetting('notifications', 'profileViews')}
                trackColor={{ false: '#767577', true: '#FF6F00' }}
                thumbColor={settingsData.notifications.profileViews ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        );
      case 'privacy':
        return (
          <View style={styles.settingsSection}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Profile Visibility</Text>
              <Switch
                value={settingsData.privacy.profileVisibility}
                onValueChange={() => toggleSetting('privacy', 'profileVisibility')}
                trackColor={{ false: '#767577', true: '#FF6F00' }}
                thumbColor={settingsData.privacy.profileVisibility ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Show Online Status</Text>
              <Switch
                value={settingsData.privacy.showOnline}
                onValueChange={() => toggleSetting('privacy', 'showOnline')}
                trackColor={{ false: '#767577', true: '#FF6F00' }}
                thumbColor={settingsData.privacy.showOnline ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Show Last Seen</Text>
              <Switch
                value={settingsData.privacy.showLastSeen}
                onValueChange={() => toggleSetting('privacy', 'showLastSeen')}
                trackColor={{ false: '#767577', true: '#FF6F00' }}
                thumbColor={settingsData.privacy.showLastSeen ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        );
      case 'account':
        return (
          <View style={styles.settingsSection}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Switch
                value={settingsData.account.emailNotifications}
                onValueChange={() => toggleSetting('account', 'emailNotifications')}
                trackColor={{ false: '#767577', true: '#FF6F00' }}
                thumbColor={settingsData.account.emailNotifications ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={settingsData.account.darkMode}
                onValueChange={() => toggleSetting('account', 'darkMode')}
                trackColor={{ false: '#767577', true: '#FF6F00' }}
                thumbColor={settingsData.account.darkMode ? '#fff' : '#f4f3f4'}
              />
            </View>
            <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
              <Text style={styles.dangerButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const formatFieldName = (field: keyof ProfileData): string => {
    return String(field).replace(/([A-Z])/g, ' $1').toUpperCase();
  };

  const handleVerificationInfoPress = () => {
    Alert.alert(
      "Profile Verification",
      "Profile verification is done by our admin team to ensure authenticity. Verified profiles get higher visibility and trust from other users.",
      [{ text: "OK", style: "default" }]
    );
  };

  return (
    <ScrollView contentContainerStyle={containerStyle}>
      {/* Edit Button */}
      <TouchableOpacity 
        style={[
          styles.settingsButton, 
          { left: 20, right: undefined },
          editMode !== 'none' && styles.editingButton
        ]} 
        onPress={handleEditClick}
      >
        <Ionicons 
          name="create-outline" 
          size={24} 
          color={editMode !== 'none' ? "#fff" : "#333"} 
        />
      </TouchableOpacity>

      <View style={headerStyle}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => editMode === 'profile' ? pickImage(true) : handleImagePress(profileImage)} 
          style={styles.profileImageContainer}
        >
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
          />
          {editMode === 'profile' && (
            <View style={styles.editImageOverlay}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.editImageText}>Change Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.subText}>Active since - Jul, 2019</Text>

        <View style={styles.verificationWrapper}>
          <View style={[
            styles.verificationContainer,
            { backgroundColor: profileData.isVerified ? '#E8F5E9' : '#FFF3E0' }
          ]}>
            <View style={styles.verificationBadge}>
              <Ionicons 
                name={profileData.isVerified ? "shield-checkmark" : "shield-outline"} 
                size={28} 
                color={profileData.isVerified ? "#2E7D32" : "#FF8F00"} 
              />
            </View>
            <View style={styles.verificationTextContainer}>
              <Text style={[
                styles.verificationStatus,
                { color: profileData.isVerified ? "#2E7D32" : "#FF8F00" }
              ]}>
                {profileData.isVerified ? "Verified Profile" : "Verification Pending"}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={handleVerificationInfoPress}
            >
              <Ionicons 
                name="information-circle-outline" 
                size={24} 
                color={profileData.isVerified ? "#2E7D32" : "#FF8F00"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Gallery Section */}
      <View style={galleryStyle}>
        <View style={styles.galleryHeadingContainer}>
          <Text style={styles.galleryHeading}>Image Gallery</Text>
          {editMode === 'gallery' && (
            <TouchableOpacity onPress={() => pickImage(false)} style={styles.addImageButton}>
              <Ionicons name="add-circle-outline" size={24} color="#FF6F00" />
              <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.galleryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {galleryImages.map((image, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.imageContainer}
                onPress={() => handleImagePress(image.uri)}
              >
                <Image source={{ uri: image.uri }} style={styles.galleryImage} />
                {editMode === 'gallery' && (
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={28} color="#FF4D4D" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionHeading}>Personal Information</Text>
        {editMode === 'profile' && (
          <Text style={styles.editHint}>Tap any field to edit</Text>
        )}
      </View>

      <View style={styles.infoCard}>
        {Object.keys(profileData).map((key) => (
          key !== 'name' && key !== 'isVerified' && key !== 'verificationDate' && (
            <TouchableOpacity
              key={key}
              style={[
                styles.infoRow, 
                selectedField === key && styles.selectedRow,
                editMode === 'profile' && styles.editableRow
              ]}
              onPress={() => handleFieldEdit(key as keyof ProfileData)}
            >
              <View style={styles.infoContent}>
                <Text style={styles.label}>
                  {formatFieldName(key as keyof ProfileData)}:
                </Text>
                <Text style={[
                  styles.infoText, 
                  editMode === 'profile' && styles.editableText
                ]}>
                  {profileData[key as keyof ProfileData]}
                  {editMode === 'profile' && (
                    <Ionicons name="pencil" size={16} color="#FF6F00" style={styles.editIcon} />
                  )}
                </Text>
              </View>
            </TouchableOpacity>
          )
        ))}
      </View>

      {/* Edit Field Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {editField && formatFieldName(editField as keyof ProfileData)}
              </Text>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus
              placeholder={`Enter ${editField && formatFieldName(editField as keyof ProfileData)}`}
            />

            <View style={[styles.modalButtons, { marginTop: 20 }]}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={saveEdit}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Preview Modal */}
      <Modal visible={imagePreviewVisible} transparent animationType="fade">
        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity 
            style={styles.closePreviewButton}
            onPress={() => setImagePreviewVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.settingsModalContainer}>
          <View style={styles.settingsModalContent}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Settings</Text>
              <TouchableOpacity 
                style={styles.closeSettingsButton}
                onPress={() => setSettingsVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingsTabs}>
              <TouchableOpacity 
                style={[
                  styles.settingsTab,
                  currentSettingsTab === 'notifications' && styles.activeSettingsTab
                ]}
                onPress={() => setCurrentSettingsTab('notifications')}
              >
                <Text style={[
                  styles.settingsTabText,
                  currentSettingsTab === 'notifications' && styles.activeSettingsTabText
                ]}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.settingsTab,
                  currentSettingsTab === 'privacy' && styles.activeSettingsTab
                ]}
                onPress={() => setCurrentSettingsTab('privacy')}
              >
                <Text style={[
                  styles.settingsTabText,
                  currentSettingsTab === 'privacy' && styles.activeSettingsTabText
                ]}>Privacy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.settingsTab,
                  currentSettingsTab === 'account' && styles.activeSettingsTab
                ]}
                onPress={() => setCurrentSettingsTab('account')}
              >
                <Text style={[
                  styles.settingsTabText,
                  currentSettingsTab === 'account' && styles.activeSettingsTabText
                ]}>Account</Text>
              </TouchableOpacity>
            </View>

            {renderSettingsContent()}
          </View>
        </View>
      </Modal>

      {/* Edit Options Modal */}
      <Modal
        visible={editOptionsVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.settingsModalContainer}>
          <View style={styles.settingsModalContent}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Edit Profile</Text>
              <TouchableOpacity 
                style={styles.closeSettingsButton}
                onPress={() => setEditOptionsVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.editOptionsContainer}>
              <TouchableOpacity 
                style={styles.editOptionButton}
                onPress={() => handleEditOptionSelect('profile')}
              >
                <View style={styles.editOptionIcon}>
                  <Ionicons name="person-outline" size={24} color="#FF6F00" />
                </View>
                <View style={styles.editOptionContent}>
                  <Text style={styles.editOptionTitle}>Profile Information</Text>
                  <Text style={styles.editOptionDescription}>Edit your personal details and information</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.editOptionButton}
                onPress={() => handleEditOptionSelect('gallery')}
              >
                <View style={styles.editOptionIcon}>
                  <Ionicons name="images-outline" size={24} color="#FF6F00" />
                </View>
                <View style={styles.editOptionContent}>
                  <Text style={styles.editOptionTitle}>Photo Gallery</Text>
                  <Text style={styles.editOptionDescription}>Manage your profile photos and gallery</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
  },
  editingButton: {
    backgroundColor: '#FF6F00',
    borderColor: '#FF6F00',
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
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
    minHeight: dynamicHeaderHeight,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    paddingTop: normalizeSpacing(12),
    paddingBottom: normalizeSpacing(16),
  },
  profileImageContainer: {
    position: 'relative',
    marginTop: normalizeSpacing(32)
  },
  profileImage: {
    width: dynamicImageSize,
    height: dynamicImageSize,
    borderRadius: dynamicImageSize / 2,
    borderWidth: 3,
    borderColor: '#000',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    height: dynamicImageSize * 0.4,
    borderBottomLeftRadius: dynamicImageSize / 2,
    borderBottomRightRadius: dynamicImageSize / 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  name: {
    fontSize: normalizeFont(22),
    fontWeight: 'bold',
    color: '#000',
    marginTop: normalizeSpacing(8)
  },
  subText: {
    fontSize: normalizeFont(14),
    color: '#555',
    marginBottom: normalizeSpacing(10)
  },
  verificationWrapper: {
    width: '92%',
    maxWidth: 400,
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'center',
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalizeSpacing(12),
    paddingVertical: normalizeSpacing(8),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verificationBadge: {
    width: normalizeSpacing(32),
    height: normalizeSpacing(32),
    borderRadius: normalizeSpacing(16),
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  verificationTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  verificationStatus: {
    fontSize: normalizeFont(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoButton: {
    padding: 6,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  galleryHeadingContainer: {
    width: '90%',
    marginTop: 6,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryHeading: {
    fontSize: normalizeFont(18),
    fontWeight: 'bold',
    color: '#333',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addImageText: {
    color: '#FF6F00',
    marginLeft: 5,
    fontWeight: '600',
  },
  galleryContainer: {
    width: '100%',
    marginTop: normalizeSpacing(6),
    marginBottom: normalizeSpacing(12),
    paddingHorizontal: normalizeSpacing(10),
  },
  imageContainer: {
    position: 'relative',
    marginRight: normalizeSpacing(12),
    marginBottom: normalizeSpacing(6),
    marginLeft: normalizeSpacing(4),
    marginTop: normalizeSpacing(8),
  },
  galleryImage: {
    width: dynamicGalleryImageSize,
    height: dynamicGalleryImageSize,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  infoSection: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20
  },
  sectionHeading: {
    fontSize: normalizeFont(18),
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
    paddingVertical: normalizeSpacing(12),
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
    alignItems: 'center',
  },
  label: {
    fontSize: normalizeFont(14),
    fontWeight: 'bold',
    color: '#555',
    flex: 1,
  },
  infoText: {
    fontSize: normalizeFont(14),
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  editableText: {
    color: '#FF6F00',
  },
  editIcon: {
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: normalizeFont(20),
    fontWeight: 'bold',
    color: '#333',
  },
  closeModalButton: {
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: normalizeFont(16),
    backgroundColor: '#F8F8F8',
    width: '100%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#FF6F00',
  },
  modalButtonText: {
    fontSize: normalizeFont(16),
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButtonText: {
    color: '#fff',
  },
  editHint: {
    fontSize: 12,
    color: '#FF6F00',
    fontStyle: 'italic',
  },
  editableRow: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editImageText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  closePreviewButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  settingsModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
    maxHeight: '90%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: normalizeFont(24),
    fontWeight: 'bold',
    color: '#333',
  },
  closeSettingsButton: {
    padding: 5,
  },
  settingsTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingsTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeSettingsTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6F00',
  },
  settingsTabText: {
    color: '#666',
    fontSize: normalizeFont(14),
    fontWeight: '600',
  },
  activeSettingsTabText: {
    color: '#FF6F00',
  },
  settingsSection: {
    flex: 1,
    paddingTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: normalizeFont(16),
    color: '#333',
  },
  dangerButton: {
    backgroundColor: '#FF4D4D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: normalizeFont(16),
    fontWeight: 'bold',
  },
  containerLandscape: {
    paddingHorizontal: '5%',
  },
  headerWrapperLandscape: {
    flexDirection: 'row',
    minHeight: screenHeight * 0.5,
    paddingHorizontal: normalizeSpacing(20),
  },
  galleryContainerLandscape: {
    width: '95%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  editOptionsContainer: {
    marginTop: 10,
  },
  editOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  editOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  editOptionContent: {
    flex: 1,
  },
  editOptionTitle: {
    fontSize: normalizeFont(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  editOptionDescription: {
    fontSize: normalizeFont(14),
    color: '#666',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default ProfileScreen;
