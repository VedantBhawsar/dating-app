import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Dimensions, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService, authService } from '../../../services/api';
// --- API Configuration ---
// !!! REPLACE WITH YOUR ACTUAL API BASE URL !!!
const API_BASE_URL = 'https://60d6-223-185-38-78.ngrok-free.app/api'; // Example: 'http://localhost:3000/api'

interface ProfileData {
  name: string; // maps to backend profile.displayName
  email: string; // Potentially from /auth/me, not directly in /profile GET
  phone: string; // Potentially from basicInfo.phone (if backend adds it)
  education: string; // maps to backend occupationInfo.education
  occupation: string; // maps to backend occupationInfo.occupation
  location: string; // maps to backend basicInfo.location (needs transformation)
  income: string; // maps to backend occupationInfo.annualIncome
  age: string; // Calculated from backend basicInfo.birthDate
  height: string; // maps to backend basicInfo.height (needs transformation)
  clanGotra: string; // maps to backend casteInfo.caste or subCaste
  gan: string; // Not in provided API spec
  nakshatra: string; // Not in provided API spec
  interests: string; // maps to backend personalityInfo.interests (needs transformation)
  isVerified: boolean; // Assuming this comes from backend, read-only by user
  verificationDate?: string; // Assuming this comes from backend
  // Internal field for birthDate to help with age calculation and potential updates
  _birthDate?: string; // Store original birthDate from backend
  [key: string]: string | boolean | undefined;
}

interface GalleryImage {
  id?: string; // Optional: if backend provides IDs for gallery images
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

// --- Backend Data Structure (Simplified based on Swagger) ---
interface BackendProfileResponse {
  profile: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string; // Assumed field for profile picture
    galleryUrls?: { id?: string, url: string }[]; // Assumed field for gallery images
    // ... other fields from Profile schema
  };
  basicInfo?: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    birthDate?: string; // "YYYY-MM-DD"
    location?: { city?: string; country?: string; fullAddress?: string }; // Assumed structure
    height?: number; // e.g., in cm
    maritalStatus?: string;
    phone?: string; // Assuming phone might be here
    // ...
  };
  casteInfo?: {
    religion?: string;
    caste?: string;
    subCaste?: string;
    // ...
  };
  occupationInfo?: {
    education?: string;
    highestDegree?: string;
    occupation?: string;
    employedIn?: string;
    companyName?: string;
    jobTitle?: string;
    annualIncome?: string;
    // ...
  };
  personalityInfo?: {
    hobbies?: string[];
    interests?: string[];
    // ...
  };
  // Placeholder for verification status if it comes from a specific part of API response
  verificationStatus?: {
    isVerified: boolean;
    verifiedOn?: string;
  };
  // ... other sections like lifestyleInfo, relationshipPrefs, valuesPlan
}


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const scale = Math.min(screenWidth / 390, 1.2);
const normalizeFont = (size: number) => Math.round(size * Math.min(scale, 1));
const normalizeSpacing = (size: number) => Math.round(size * scale);

const dynamicImageSize = Math.min(screenWidth * 0.28, 120);
const dynamicGalleryImageSize = Math.min(screenWidth * 0.2, 100);
const dynamicHeaderHeight = Math.min(screenHeight * 0.28, 280);

// Helper to calculate age from birthDate string (YYYY-MM-DD)
const calculateAge = (birthDateString?: string): string => {
  if (!birthDateString) return 'N/A';
  try {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  } catch (e) {
    return 'N/A';
  }
};

// Helper to format height (e.g., 175cm to "5'9\"") - This is a simplified example
const formatHeight = (cm?: number): string => {
  if (cm === undefined || cm === null) return 'N/A';
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}'${remainingInches}"`;
};

// Helper to format field names for display
const formatFieldName = (field: keyof ProfileData): string => {
  return String(field).replace(/([A-Z])/g, ' $1').toUpperCase();
};

function saveEdit(){
  return 
}

// Helper to parse height string (e.g., "5'9\"" or "175") to number (cm)
const parseHeightToCm = (heightStr: string): number | undefined => {
    // Try parsing as a direct number (assuming cm)
    const numCm = parseFloat(heightStr);
    if (!isNaN(numCm) && heightStr.match(/^\d+(\.\d+)?$/)) {
      return numCm;
    }
    // Try parsing "X'Y\"" format
    const feetInchesMatch = heightStr.match(/(\d+)'(\d+)"?/);
    if (feetInchesMatch) {
      const feet = parseInt(feetInchesMatch[1], 10);
      const inches = parseInt(feetInchesMatch[2], 10);
      if (!isNaN(feet) && !isNaN(inches)) {
        return Math.round((feet * 12 + inches) * 2.54);
      }
    }
    return undefined; // Or throw an error for invalid format
};


// Mapping frontend ProfileData keys to backend update specifics
type ProfileSectionKey = 'profile' | 'basic' | 'caste' | 'occupation' | 'lifestyle' | 'personality' | 'preferences' | 'values';
interface FieldUpdateMapping {
  section: ProfileSectionKey;
  backendKey: string;
  transformToBackend?: (value: string, originalProfileData: ProfileData) => any;
}

const fieldToBackendUpdateMapping: Partial<Record<keyof ProfileData, FieldUpdateMapping>> = {
  name: { section: 'profile', backendKey: 'displayName' },
  education: { section: 'occupation', backendKey: 'education' },
  occupation: { section: 'occupation', backendKey: 'occupation' },
  income: { section: 'occupation', backendKey: 'annualIncome' },
  location: {
    section: 'basic',
    backendKey: 'location',
    transformToBackend: (value: string) => {
      const parts = value.split(',').map(s => s.trim());
      return { city: parts[0] || '', country: parts[1] || '' }; // Adjust as per backend needs
    }
  },
  height: {
    section: 'basic',
    backendKey: 'height',
    transformToBackend: (value: string) => parseHeightToCm(value)
  },
  clanGotra: { section: 'caste', backendKey: 'caste' }, // Or 'subCaste' depending on backend logic
  interests: {
    section: 'personality',
    backendKey: 'interests',
    transformToBackend: (value: string) => value.split(',').map(s => s.trim()).filter(s => s.length > 0)
  },
  // Note: 'age' is derived. To update age, backend expects 'birthDate'.
  // This would require editing 'birthDate' directly (e.g., with a date picker).
  // 'email', 'phone', 'gan', 'nakshatra' are not mapped here as their update endpoints are unclear from spec.
};


const ProfileScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState<keyof ProfileData>('name');
  const [selectedField, setSelectedField] = useState<keyof ProfileData | null>(null); // For UI highlight
  
  const [profileImage, setProfileImage] = useState('https://plus.unsplash.com/premium_photo-1673734626655-0c1dc4be0e9c?q=80&w=1887'); // Default
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Loading...',
    email: 'loading@example.com',
    phone: 'N/A',
    education: 'N/A',
    occupation: 'N/A',
    location: 'N/A',
    income: 'N/A',
    age: 'N/A',
    height: "N/A",
    clanGotra: 'N/A',
    gan: 'N/A',
    nakshatra: 'N/A',
    interests: 'N/A',
    isVerified: false,
    // verificationDate: undefined // Handled by API response
  });

  const [inputValue, setInputValue] = useState('');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [editMode, setEditMode] = useState<'none' | 'profile' | 'gallery'>('none');

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsData, setSettingsData] = useState<SettingsData>({ /* initial settings */
    notifications: { messages: true, matches: true, profileViews: false },
    privacy: { profileVisibility: true, showOnline: true, showLastSeen: true },
    account: { emailNotifications: true, darkMode: false },
  });
  const [currentSettingsTab, setCurrentSettingsTab] = useState<'notifications' | 'privacy' | 'account'>('notifications');
  const [orientation, setOrientation] = useState('portrait');
  const [editOptionsVisible, setEditOptionsVisible] = useState(false);

  // --- Handle Authentication Errors ---
  const handleAuthError = (error: any) => {
    console.error('Authentication error:', error);
    Alert.alert(
      "Authentication Error", 
      "Your session has expired or is invalid. Please login again."
    );
    router.replace("/auth/login");
  };
  
  // --- Fetch Profile Data ---
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Use the profileService instead of custom fetch
      const data = await profileService.getProfile();
      
      // Transform backend data to frontend ProfileData
      const newProfileData: ProfileData = {
        name: data.profile?.displayName || 'N/A',
        email: data.profile?.email || 'N/A', // Should come from profile or auth endpoint
        phone: data.basicInfo?.phone || 'N/A',
        education: data.occupationInfo?.education || 'N/A',
        occupation: data.occupationInfo?.occupation || 'N/A',
        location: data.basicInfo?.location 
            ? (typeof data.basicInfo.location === 'string' 
               ? data.basicInfo.location 
               : `${data.basicInfo.location.city || ''}${data.basicInfo.location.city && data.basicInfo.location.country ? ', ' : ''}${data.basicInfo.location.country || ''}`.trim() || 'N/A')
            : 'N/A',
        income: data.occupationInfo?.annualIncome || 'N/A',
        age: calculateAge(data.basicInfo?.birthDate),
        _birthDate: data.basicInfo?.birthDate,
        height: formatHeight(data.basicInfo?.height),
        clanGotra: data.casteInfo?.caste || data.casteInfo?.subCaste || 'N/A',
        gan: data.casteInfo?.subCaste || 'N/A', // Map to appropriate field
        nakshatra: data.casteInfo?.motherTongue || 'N/A', // Map to appropriate field
        interests: Array.isArray(data.personalityInfo?.interests) 
          ? data.personalityInfo.interests.join(', ') 
          : (data.personalityInfo?.interests || 'N/A'),
        isVerified: data.verificationStatus?.isVerified || false,
        verificationDate: data.verificationStatus?.verifiedOn,
      };
      
      console.log('Profile data fetched successfully:', data);
      setProfileData(newProfileData);

      // Handle profile image
      if (data.profile?.avatarUrl) {
        setProfileImage(data.profile.avatarUrl);
      }
      
      // Handle gallery images
      if (data.profile?.galleryUrls && Array.isArray(data.profile.galleryUrls)) {
        setGalleryImages(data.profile.galleryUrls.map((img: any) => ({
          uri: typeof img === 'string' ? img : (img.url || ''),
          id: typeof img === 'string' ? undefined : (img.id || undefined)
        })));
      } else {
        // Fallback to default gallery image
        setGalleryImages([
          { uri: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        ]);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      // Handle authentication errors
      if (error.status === 401 || error.message?.includes('Unauthorized') || error.message?.includes('auth')) {
        handleAuthError(error);
        return;
      }
      
      setApiError(error.message || "Failed to fetch profile data.");
      Alert.alert("Error", error.message || "Failed to fetch profile data.");
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies to avoid stale data

  useEffect(() => {
    fetchProfile();
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'landscape' : 'portrait');
    };
    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => {
      subscription.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch profile on mount


  const containerStyle = [styles.container, orientation === 'landscape' && styles.containerLandscape];
  const headerStyle = [styles.headerWrapper, orientation === 'landscape' && styles.headerWrapperLandscape];
  const galleryStyle = [styles.galleryContainer, orientation === 'landscape' && styles.galleryContainerLandscape];

  const handleEditClick = () => {
    if (editMode !== 'none') {
      setEditMode('none');
      setIsEditing(false); // Ensure isEditing is also reset
      setSelectedField(null);
      setModalVisible(false);
      // Optionally, re-fetch profile to discard any uncommitted local changes or show saved state
      // fetchProfile(); 
    } else {
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
      if (typeof value === 'string') { // Only allow editing string fields directly in this modal
        setInputValue(value);
        setModalVisible(true);
      } else if (field === 'age' && profileData._birthDate) {
        // For age, we'd ideally edit birthDate.
        // This example keeps it simple by editing the age string, but saving birthDate is preferred.
        Alert.alert("Info", "Age is calculated from birth date. To change age, please edit your birth date (feature not fully implemented in this UI).");
        // Or setInputValue(profileData.age) and handle it specially in saveEdit
      } else {
        Alert.alert("Info", `Editing for '${formatFieldName(field)}' is not directly supported in this way.`);
      }
    }
  };

  const handleSaveField = async () => {
    if (!inputValue.trim()) {
      Alert.alert("Input Required", "Please enter a value.");
      return;
    }

    const mapping = fieldToBackendUpdateMapping[editField];
    if (!mapping) {
      Alert.alert("Cannot Save", `No update configuration for ${formatFieldName(editField as keyof ProfileData)}.`);
      setModalVisible(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get the field mapping details
      const { section, backendKey, transformToBackend } = mapping;
      
      // Transform the value if needed
      let transformedValue = inputValue;
      if (transformToBackend) {
        try {
          transformedValue = transformToBackend(inputValue, profileData);
          if (transformedValue === undefined && editField === 'height') {
            Alert.alert("Invalid Format", "Please enter height in numbers (e.g., 175 for cm) or format like 5'9\".");
            setIsLoading(false);
            return;
          }
        } catch (e: any) {
          Alert.alert("Input Error", e.message || "Invalid format for this field.");
          setIsLoading(false);
          return;
        }
      }
      
      // Prepare the update data
      const updateData = { [backendKey]: transformedValue };
      
      // Use the appropriate profile service method based on section
      switch(section) {
        case 'profile':
          await profileService.updateProfile(updateData);
          break;
        case 'basic':
          await profileService.updateBasicInfo(updateData);
          break;
        case 'caste':
          await profileService.updateCasteInfo(updateData);
          break;
        case 'occupation':
          await profileService.updateOccupationInfo(updateData);
          break;
        case 'lifestyle':
          await profileService.updateLifestyleInfo(updateData);
          break;
        case 'personality':
          await profileService.updatePersonalityInfo(updateData);
          break;
        case 'preferences':
          await profileService.updateRelationshipPrefs(updateData);
          break;
        case 'values':
          await profileService.updateValuesPlan(updateData);
          break;
        default:
          throw new Error(`Unknown section: ${section}`);
      }
      
      // Optimistic update of the UI
      setProfileData(prev => ({ ...prev, [editField]: inputValue }));
      Alert.alert("Success", `${formatFieldName(editField as keyof ProfileData)} updated successfully.`);
      
      // Optionally re-fetch the entire profile to ensure consistency
      // await fetchProfile();
    } catch (error: any) {
      console.error('Error updating field:', error);
      Alert.alert("Update Failed", error.message || `Could not update ${formatFieldName(editField as keyof ProfileData)}.`);
    } finally {
      setIsLoading(false);
      setModalVisible(false);
      setSelectedField(null);
    }
  };

  const pickImage = async (isProfilePic = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: isProfilePic ? [1, 1] : [4, 3], // Profile pics often square
      quality: 0.8, // Slightly reduce quality for faster uploads
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      
      // TODO: Implement API call to upload image
      // For FormData, you'll need to adjust authenticatedFetch or use a library like axios
      // const formData = new FormData();
      // formData.append('image', { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' } as any);

      if (isProfilePic) {
        setProfileImage(imageUri); // Optimistic update
        Alert.alert("Profile Picture", "TODO: Call API to upload profile picture.");
        // Example:
        // try {
        //   setIsLoading(true);
        //   await authenticatedFetch(`${API_BASE_URL}/profile/avatar`, { // Assuming this endpoint
        //     method: 'PUT', // Or POST
        //     body: formData,
        //     headers: { 'Content-Type': 'multipart/form-data' }, // Override Content-Type
        //   });
        //   fetchProfile(); // Refresh profile data
        // } catch (e) { setApiError('Failed to upload profile picture.'); setProfileImage(PREVIOUS_IMAGE_URI); }
        // finally { setIsLoading(false); }

      } else { // Gallery image
        const newImage: GalleryImage = { uri: imageUri };
        setGalleryImages(prev => [...prev, newImage]); // Optimistic update
        Alert.alert("Gallery Image", "TODO: Call API to add image to gallery.");
        // Example:
        // try {
        //   setIsLoading(true);
        //   const response = await authenticatedFetch(`${API_BASE_URL}/profile/gallery`, { // Assuming this endpoint
        //     method: 'POST',
        //     body: formData,
        //     headers: { 'Content-Type': 'multipart/form-data' },
        //   });
        //   // Assuming response contains the new image with an ID
        //   // setGalleryImages(prev => prev.map(img => img.uri === imageUri ? { ...img, id: response.id } : img));
        //   fetchProfile(); // Refresh to get all gallery images with IDs
        // } catch (e) { setApiError('Failed to add image to gallery.'); /* remove optimistically added image */ }
        // finally { setIsLoading(false); }
      }
    }
  };

  const removeImage = (index: number) => {
    if (editMode === 'gallery') {
      const imageToRemove = galleryImages[index];
      // Optimistic update
      const newGalleryImages = galleryImages.filter((_, i) => i !== index);
      setGalleryImages(newGalleryImages);

      Alert.alert("Remove Image", `TODO: Call API to remove image (ID: ${imageToRemove.id || 'N/A'}).`);
      // Example:
      // if (imageToRemove.id) {
      //   try {
      //     setIsLoading(true);
      //     await authenticatedFetch(`${API_BASE_URL}/profile/gallery/${imageToRemove.id}`, { method: 'DELETE' });
      //     // No need to fetchProfile if optimistic update is trusted, or fetch if needed.
      //   } catch (e) { setApiError('Failed to remove image.'); setGalleryImages(PREVIOUS_GALLERY_IMAGES_STATE); }
      //   finally { setIsLoading(false); }
      // } else {
      //   Alert.alert("Error", "Cannot remove image without an ID from the backend.");
      //   setGalleryImages(PREVIOUS_GALLERY_IMAGES_STATE); // Revert optimistic update
      // }
    }
  };

  const handleSettingsPress = () => setSettingsVisible(true);
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await authService.logout();
              router.replace("/auth/login");
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Logout Error', 'There was a problem logging out. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  const toggleSetting = (category: keyof SettingsData, setting: string) => { 
    setSettingsData(prev => ({
      ...prev,
      [category]: { ...prev[category], [setting]: !prev[category][setting] }
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
            {/* ... other notification settings ... */}
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
            {/* ... other privacy settings ... */}
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
            {/* ... other account settings ... */}
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
      default: return null;
    }
  };
  const handleVerificationInfoPress = () => {
    Alert.alert(
      "Verification Status",
      profileData.isVerified
        ? `Your profile was verified on ${profileData.verificationDate || 'N/A'}.`
        : "Your profile is not verified. Please complete the verification process."
    );
  };

  if (apiError && profileData.name === 'Loading...') { // Show error if initial load failed
     return (
      <View style={styles.loadingContainer}>
        <Ionicons name="cloud-offline-outline" size={60} color="#FF6F00" />
        <Text style={styles.errorText}>Error: {apiError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <ScrollView contentContainerStyle={containerStyle}>
      {/* Global loading indicator for subsequent calls */}
      {isLoading && profileData.name !== 'Loading...' && (
          <View style={styles.inlineLoadingIndicator}>
              <ActivityIndicator size="small" color="#FF6F00" />
          </View>
      )}

      {/* Edit Button */}
      <TouchableOpacity 
        style={[styles.settingsButton, { left: 20, right: undefined }, editMode !== 'none' && styles.editingButton]} 
        onPress={handleEditClick}
      >
        <Ionicons name={editMode !== 'none' ? "checkmark-done-outline" : "create-outline"} size={24} color={editMode !== 'none' ? "#fff" : "#333"} />
      </TouchableOpacity>

      <View style={headerStyle}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => editMode === 'profile' ? pickImage(true) : handleImagePress(profileImage)} 
          style={styles.profileImageContainer}
          disabled={editMode !== 'profile' && !profileImage} // Disable if no image and not in edit mode
        >
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
            onError={() => setProfileImage('https://via.placeholder.com/120/CCCCCC/FFFFFF?text=No+Image')} // Fallback for broken image URI
          />
          {editMode === 'profile' && (
            <View style={styles.editImageOverlay}>
              <Ionicons name="camera" size={normalizeFont(18)} color="white" />
              <Text style={styles.editImageText}>Change</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.name}>{profileData.name}</Text>
        {/* TODO: 'Active since' should come from backend user creation date */}
        <Text style={styles.subText}>Active since - Jul, 2019</Text> 

        <View style={styles.verificationWrapper}>
           {/* ... verification badge ... unchanged */}
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
                {profileData.isVerified ? `Verified${profileData.verificationDate ? ` on ${new Date(profileData.verificationDate).toLocaleDateString()}` : ''}` : "Verification Pending"}
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

        <View style={styles.galleryContainerInternal}> {/* Renamed to avoid conflict */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {galleryImages.length > 0 ? galleryImages.map((image, index) => (
              <TouchableOpacity 
                key={image.id || index} 
                style={styles.imageContainer}
                onPress={() => handleImagePress(image.uri)}
                disabled={!image.uri}
              >
                <Image 
                    source={{ uri: image.uri }} 
                    style={styles.galleryImage} 
                    onError={() => { // Handle broken gallery image URI
                        const updated = [...galleryImages];
                        updated[index].uri = 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=Error';
                        setGalleryImages(updated);
                    }}
                />
                {editMode === 'gallery' && (
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={28} color="#FF4D4D" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )) : (
                <Text style={styles.emptyGalleryText}>
                    {editMode === 'gallery' ? "Click 'Add Image' to start your gallery." : "No images in gallery yet."}
                </Text>
            )}
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
        {Object.keys(profileData).filter(key => 
            key !== 'name' && 
            key !== 'isVerified' && 
            key !== 'verificationDate' && 
            key !== '_birthDate' // Don't show internal _birthDate field
        ).map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.infoRow, 
              selectedField === key && styles.selectedRow,
              editMode === 'profile' && fieldToBackendUpdateMapping[key as keyof ProfileData] && styles.editableRow // Only make editable if mappable
            ]}
            onPress={() => fieldToBackendUpdateMapping[key as keyof ProfileData] ? handleFieldEdit(key as keyof ProfileData) : Alert.alert("Info", "This field is not directly editable here.")}
            disabled={editMode !== 'profile' || !fieldToBackendUpdateMapping[key as keyof ProfileData]}
          >
            <View style={styles.infoContent}>
              <Text style={styles.label}>
                {formatFieldName(key as keyof ProfileData)}:
              </Text>
              <Text style={[
                styles.infoText, 
                editMode === 'profile' && fieldToBackendUpdateMapping[key as keyof ProfileData] && styles.editableText
              ]}>
                {String(profileData[key as keyof ProfileData])}
                {editMode === 'profile' && fieldToBackendUpdateMapping[key as keyof ProfileData] && (
                  <Ionicons name="pencil" size={normalizeFont(13)} color="#FF6F00" style={styles.editIcon} />
                )}
              </Text>
            </View>
          </TouchableOpacity>
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
          onPress={() => setModalVisible(false)} // Close on backdrop press
        >
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true} // Prevents backdrop press through modal
            onTouchEnd={(e) => e.stopPropagation()} // Prevents backdrop press through modal
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
              placeholder={`Enter new ${editField && formatFieldName(editField as keyof ProfileData).toLowerCase()}`}
              // Consider multiline for fields like 'interests' or 'bio' if added
              // multiline={editField === 'interests'} 
              // numberOfLines={editField === 'interests' ? 3 : 1}
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
                disabled={isLoading} // Disable save button while loading
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.modalButtonText, styles.saveButtonText]}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Preview Modal (unchanged) */}
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

      {/* Settings Modal (unchanged structure, content rendering uses existing logic) */}
      <Modal visible={settingsVisible} animationType="slide" transparent={true} onRequestClose={() => setSettingsVisible(false)}>
        <View style={styles.settingsModalContainer}>
          <View style={styles.settingsModalContent}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Settings</Text>
              <TouchableOpacity style={styles.closeSettingsButton} onPress={() => setSettingsVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.settingsTabs}>
              {/* ... tabs ... unchanged */}
               <TouchableOpacity 
                style={[styles.settingsTab, currentSettingsTab === 'notifications' && styles.activeSettingsTab]}
                onPress={() => setCurrentSettingsTab('notifications')}
              >
                <Text style={[styles.settingsTabText, currentSettingsTab === 'notifications' && styles.activeSettingsTabText]}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.settingsTab, currentSettingsTab === 'privacy' && styles.activeSettingsTab]}
                onPress={() => setCurrentSettingsTab('privacy')}
              >
                <Text style={[styles.settingsTabText, currentSettingsTab === 'privacy' && styles.activeSettingsTabText]}>Privacy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.settingsTab, currentSettingsTab === 'account' && styles.activeSettingsTab]}
                onPress={() => setCurrentSettingsTab('account')}
              >
                <Text style={[styles.settingsTabText, currentSettingsTab === 'account' && styles.activeSettingsTabText]}>Account</Text>
              </TouchableOpacity>
            </View>
            {renderSettingsContent()}
          </View>
        </View>
      </Modal>

      {/* Edit Options Modal (unchanged) */}
      <Modal visible={editOptionsVisible} animationType="slide" transparent={true} onRequestClose={() => setEditOptionsVisible(false)}>
        <View style={styles.settingsModalContainer}>
           <View style={styles.settingsModalContent}>
            {/* ... content ... unchanged */}
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
  // ... (Keep your existing styles)
  // Add styles for loading/error states:
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: normalizeFont(16),
    color: '#555',
  },
  errorText: {
    marginTop: 10,
    fontSize: normalizeFont(16),
    color: 'red',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FF6F00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: normalizeFont(16),
    fontWeight: 'bold',
  },
  inlineLoadingIndicator: { // For loading during updates, not initial load
    position: 'absolute',
    top: dynamicHeaderHeight / 2, // Adjust as needed
    left: screenWidth / 2 - 15, // Center it
    zIndex: 20, // Above other content
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 5,
    borderRadius: 20,
  },
  galleryContainerInternal: { // Added to avoid style name conflict if 'galleryContainer' is used differently
    width: '100%',
    // paddingHorizontal: normalizeSpacing(10), // Already in parent galleryStyle
  },
  emptyGalleryText: {
    fontSize: normalizeFont(14),
    color: '#777',
    textAlign: 'center',
    paddingVertical: normalizeSpacing(20),
    width: screenWidth - normalizeSpacing(40), // Ensure it takes up some space
  },
  editImageText: {
    color: 'white',
    fontSize: normalizeFont(10), // Smaller font for "Change"
    marginTop: 2,
  },
  // Ensure all existing styles are here
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
    top: normalizeSpacing(15), // Adjusted for consistency
    right: normalizeSpacing(15), // Adjusted
    backgroundColor: '#fff',
    padding: normalizeSpacing(8), // Adjusted
    borderRadius: normalizeSpacing(20), // Adjusted
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
    justifyContent: 'flex-start', // Changed to flex-start for better control with paddingTop
    position: 'relative',
    paddingTop: normalizeSpacing(50), // Increased paddingTop to make space for buttons
    paddingBottom: normalizeSpacing(16),
  },
  profileImageContainer: {
    position: 'relative',
    // marginTop: normalizeSpacing(32) // Removed, controlled by headerWrapper padding
  },
  profileImage: {
    width: dynamicImageSize,
    height: dynamicImageSize,
    borderRadius: dynamicImageSize / 2,
    borderWidth: 3,
    borderColor: '#FF6F00', // Changed to theme color
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    height: dynamicImageSize * 0.3, // Reduced height a bit
    borderBottomLeftRadius: dynamicImageSize / 2,
    borderBottomRightRadius: dynamicImageSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column', // To stack icon and text
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
    marginTop: normalizeSpacing(8), // Adjusted
    marginBottom: normalizeSpacing(4), // Adjusted
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
    marginLeft: normalizeSpacing(10), // Adjusted
    marginRight: normalizeSpacing(5), // Adjusted
  },
  verificationStatus: {
    fontSize: normalizeFont(15), // Adjusted
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoButton: {
    padding: normalizeSpacing(5), // Adjusted
    backgroundColor: 'white',
    borderRadius: normalizeSpacing(12), // Adjusted
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  galleryHeadingContainer: {
    width: '90%',
    marginTop: normalizeSpacing(10), // Adjusted
    marginBottom: normalizeSpacing(6), // Adjusted
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
    paddingVertical: normalizeSpacing(4), // Add some padding for easier tap
    paddingHorizontal: normalizeSpacing(8),
    backgroundColor: '#FFF5E6',
    borderRadius: 20,
  },
  addImageText: {
    color: '#FF6F00',
    marginLeft: normalizeSpacing(4), // Adjusted
    fontWeight: '600',
    fontSize: normalizeFont(13),
  },
  galleryContainer: { // This is the outer wrapper for the gallery section
    width: '100%',
    marginTop: normalizeSpacing(6),
    marginBottom: normalizeSpacing(12),
    paddingHorizontal: normalizeSpacing(10), // Horizontal padding for the ScrollView
  },
  imageContainer: {
    position: 'relative',
    marginRight: normalizeSpacing(12),
    marginBottom: normalizeSpacing(6),
    marginLeft: normalizeSpacing(4),
    marginTop: normalizeSpacing(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3, // For Android shadow
    backgroundColor: '#FFF', // Needed for iOS shadow to appear correctly on rounded corners
    borderRadius: 12, // Match image borderRadius
  },
  galleryImage: {
    width: dynamicGalleryImageSize,
    height: dynamicGalleryImageSize,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -normalizeSpacing(8), // Adjusted
    right: -normalizeSpacing(8), // Adjusted
    backgroundColor: 'white',
    borderRadius: normalizeSpacing(14), // Adjusted
    width: normalizeSpacing(28), // Adjusted
    height: normalizeSpacing(28), // Adjusted
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
    marginTop: normalizeSpacing(20), // Adjusted
    marginBottom: normalizeSpacing(5), // Added margin bottom
  },
  sectionHeading: {
    fontSize: normalizeFont(18),
    fontWeight: 'bold',
    color: '#000'
  },
  infoCard: {
    width: '90%',
    marginTop: normalizeSpacing(10), // Reduced top margin
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 3,
    // elevation: 1,
    paddingBottom: normalizeSpacing(10), // Padding at the bottom of the card
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: normalizeSpacing(14), // Increased padding
    borderBottomWidth: 1,
    borderColor: '#F0F0F0', // Lighter border
  },
  selectedRow: { // This style might not be used anymore if modal opens directly
    backgroundColor: '#FFF5E6', // Light orange for selection
  },
  infoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: normalizeFont(14),
    fontWeight: '600', // Slightly bolder
    color: '#444', // Darker grey
    flex: 0.45, // Give more space to value
  },
  infoText: {
    fontSize: normalizeFont(14),
    color: '#333',
    flex: 0.55, // Take remaining space
    textAlign: 'right',
  },
  editableText: {
    color: '#FF6F00',
    fontWeight: '500',
  },
  editIcon: {
    marginLeft: normalizeSpacing(5), // Adjusted
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
    paddingHorizontal: normalizeSpacing(20), // Adjusted
    paddingTop: normalizeSpacing(20), // Adjusted
    paddingBottom: normalizeSpacing(30), // Extra padding for buttons esp. on iOS with home indicator
    minHeight: '35%', // Adjusted
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalizeSpacing(20), // Adjusted
  },
  modalTitle: {
    fontSize: normalizeFont(18), // Adjusted
    fontWeight: 'bold',
    color: '#333',
  },
  closeModalButton: {
    padding: normalizeSpacing(6), // Adjusted
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10, // Adjusted
    paddingHorizontal: normalizeSpacing(12), // Adjusted
    paddingVertical: normalizeSpacing(10), // Adjusted
    fontSize: normalizeFont(15), // Adjusted
    backgroundColor: '#F9F9F9', // Slightly off-white
    width: '100%',
    marginBottom: normalizeSpacing(20), // Adjusted
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: normalizeSpacing(10), // Adjusted
  },
  modalButton: {
    flex: 1,
    paddingVertical: normalizeSpacing(12), // Adjusted
    borderRadius: 10, // Adjusted
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Softer shadow
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0', // Darker grey for better contrast
  },
  saveButton: {
    backgroundColor: '#FF6F00',
  },
  modalButtonText: {
    fontSize: normalizeFont(15), // Adjusted
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#333', // Darker text
  },
  saveButtonText: {
    color: '#fff',
  },
  editHint: {
    fontSize: normalizeFont(12), // Adjusted
    color: '#FF6F00',
    fontStyle: 'italic',
  },
  editableRow: { // Style for rows that are editable
    backgroundColor: '#FFF9F2', // Very light orange tint
    borderRadius: 8,
    // No margin/padding overrides here, rely on infoRow
    // Shadow is removed as infoCard can have its own shadow
  },
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: screenWidth, // Use full width
    height: screenHeight * 0.7, // Adjust height as preferred
  },
  closePreviewButton: {
    position: 'absolute',
    top: normalizeSpacing(40), // Adjusted for safe area
    right: normalizeSpacing(20), // Adjusted
    zIndex: 10,
    padding: normalizeSpacing(8), // Adjusted
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
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
    paddingHorizontal: normalizeSpacing(15), // Adjusted
    paddingTop: normalizeSpacing(15), // Adjusted
    paddingBottom: normalizeSpacing(25), // Adjusted
    minHeight: '50%',
    maxHeight: '90%', // Allow more height if content is long
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalizeSpacing(15), // Adjusted
  },
  settingsTitle: {
    fontSize: normalizeFont(20), // Adjusted
    fontWeight: 'bold',
    color: '#333',
  },
  closeSettingsButton: {
    padding: normalizeSpacing(5), // Adjusted
  },
  settingsTabs: {
    flexDirection: 'row',
    marginBottom: normalizeSpacing(15), // Adjusted
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingsTab: {
    flex: 1,
    paddingVertical: normalizeSpacing(10), // Adjusted
    alignItems: 'center',
  },
  activeSettingsTab: {
    borderBottomWidth: 2.5, // Slightly thicker
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
    flexGrow: 1, // Changed to flexGrow to allow scrolling if content overflows
    paddingTop: normalizeSpacing(8), // Adjusted
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalizeSpacing(12), // Adjusted
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5', // Lighter border
  },
  settingLabel: {
    fontSize: normalizeFont(15), // Adjusted
    color: '#333',
    flexShrink: 1, // Allow text to shrink if needed
    marginRight: normalizeSpacing(8),
  },
  dangerButton: {
    backgroundColor: '#FF4D4D',
    paddingVertical: normalizeSpacing(12), // Adjusted
    paddingHorizontal: normalizeSpacing(15),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: normalizeSpacing(20), // Adjusted
  },
  dangerButtonText: {
    color: 'white',
    fontSize: normalizeFont(15), // Adjusted
    fontWeight: 'bold',
  },
  containerLandscape: {
    paddingHorizontal: '5%',
  },
  headerWrapperLandscape: {
    flexDirection: 'row', // Keep as row for landscape
    alignItems: 'center', // Align items center
    justifyContent: 'space-around', // Space out elements
    minHeight: screenHeight * 0.4, // Reduced height for landscape
    paddingHorizontal: normalizeSpacing(20),
    paddingTop: normalizeSpacing(20), // Add top padding for landscape
  },
  galleryContainerLandscape: {
    width: '95%',
    // flexDirection: 'row', // ScrollView handles horizontal layout
    // flexWrap: 'wrap', // Not needed for horizontal ScrollView
    // justifyContent: 'space-between', // Not needed for horizontal ScrollView
  },
  editOptionsContainer: {
    marginTop: normalizeSpacing(10), // Adjusted
  },
  editOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalizeSpacing(12), // Adjusted
    backgroundColor: '#FAFAFA', // Lighter background
    borderRadius: 10, // Adjusted
    marginBottom: normalizeSpacing(10), // Adjusted
    borderWidth: 1,
    borderColor: '#EEEEEE',
    // Removed shadow for a flatter design, or reduce it
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 1,
  },
  editOptionIcon: {
    width: normalizeSpacing(36), // Adjusted
    height: normalizeSpacing(36), // Adjusted
    borderRadius: normalizeSpacing(18), // Adjusted
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalizeSpacing(10), // Adjusted
  },
  editOptionContent: {
    flex: 1,
  },
  editOptionTitle: {
    fontSize: normalizeFont(15), // Adjusted
    fontWeight: '600',
    color: '#333',
    marginBottom: normalizeSpacing(3), // Adjusted
  },
  editOptionDescription: {
    fontSize: normalizeFont(13), // Adjusted
    color: '#666',
  },
  saveButtonContent: { // Not used directly in this version but good for future
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalizeSpacing(6),
  },
});

export default ProfileScreen;