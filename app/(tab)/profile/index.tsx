import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Dimensions, Switch, ActivityIndicator, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { profileService, authService, settingsService } from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, NotificationSettings, PrivacySettings, AccountSettings, defaultUserSettings } from '../../../models/settings';
import { API_URL } from '@/constants/config';

// --- Frontend Data Structure ---
interface ProfileData {
  // From 'profile' section
  name: string; // maps to backend profile.displayName
  bio: string;
  isHidden: boolean; // Display only for now
  email: string; // Likely from auth/me or merged into GET /profile

  // From 'basicInfo' section
  firstName: string; // May be part of 'name' logic or separate
  lastName: string;  // May be part of 'name' logic or separate
  gender: string;
  phone: string;
  location: string; // Transformed from { city, state, country }
  age: string; // Calculated from birthDate
  height: string; // Transformed from number (cm)
  maritalStatus: string;
  children: string;
  _birthDate?: string; // Internal for age calculation and potential updates

  // From 'casteInfo' section
  religion: string;
  clanGotra: string; // maps to backend casteInfo.caste
  gan: string;       // maps to backend casteInfo.subCaste (as per original code's intent)
  nakshatra: string; // maps to backend casteInfo.motherTongue (as per original code's intent)
  community: string;

  // From 'occupationInfo' section
  education: string;
  highestDegree: string;
  occupation: string;
  employedIn: string;
  companyName: string;
  jobTitle: string;
  income: string; // maps to backend occupationInfo.annualIncome

  // From 'lifestyleInfo' section
  diet: string;
  smoking: string;
  drinking: string;
  livingArrangement: string;
  hasDisability: boolean; // Display only
  disabilityDetails: string;

  // From 'personalityInfo' section
  hobbies: string; // Comma-separated
  interests: string; // Comma-separated
  personalityTraits: string; // Comma-separated
  musicTaste: string; // Comma-separated
  movieTaste: string; // Comma-separated
  sportsInterest: string; // Comma-separated
  travelStyle: string;

  // Verification (Assuming this comes from backend, possibly separate or merged)
  isVerified: boolean;
  verificationDate?: string;
}

interface GalleryImage {
  id?: string;
  uri: string;
}

// Using the real settings model from models/settings.ts

// --- Backend Data Structure (Based on API Docs for GET /profile) ---
interface BackendProfileResponse {
  profile?: { // Matches PUT /profile
    id?: string;
    userId?: string;
    displayName?: string;
    bio?: string;
    isHidden?: boolean;
    avatarUrl?: string;
    galleryUrls?: { id?: string, url: string }[];
    email?: string; // Assuming email is part of the main profile object or user object
  };
  basicInfo?: { // Matches PUT /profile/basic
    firstName?: string;
    lastName?: string;
    gender?: string; // e.g., "MALE"
    birthDate?: string; // "YYYY-MM-DD"
    location?: { city?: string; state?: string; country?: string; fullAddress?: string }; // fullAddress is my assumed addition for convenience from backend
    height?: number; // cm
    maritalStatus?: string;
    children?: string;
    phone?: string;
  };
  casteInfo?: { // Matches PUT /profile/caste
    religion?: string;
    caste?: string;
    subCaste?: string;
    motherTongue?: string;
    community?: string;
  };
  occupationInfo?: { // Matches PUT /profile/occupation
    education?: string;
    highestDegree?: string;
    occupation?: string;
    employedIn?: string;
    companyName?: string;
    jobTitle?: string;
    annualIncome?: string;
  };
  lifestyleInfo?: { // Matches PUT /profile/lifestyle
    diet?: string;
    smoking?: string;
    drinking?: string;
    livingArrangement?: string;
    hasDisability?: boolean;
    disabilityDetails?: string;
  };
  personalityInfo?: { // Matches PUT /profile/personality
    hobbies?: string[];
    interests?: string[];
    personalityTraits?: string[];
    musicTaste?: string[];
    movieTaste?: string[];
    sportsInterest?: string[];
    travelStyle?: string;
  };
  // relationshipPrefs and valuesPlan sections could also be here.
  // For now, focusing on fields already somewhat handled by the UI.
  verificationStatus?: { // This structure might be custom or part of a user object
    isVerified: boolean;
    verifiedOn?: string;
  };
}


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const scale = Math.min(screenWidth / 390, 1.2);
const normalizeFont = (size: number) => Math.round(size * Math.min(scale, 1));
const normalizeSpacing = (size: number) => Math.round(size * scale);

const dynamicImageSize = Math.min(screenWidth * 0.28, 120);
const dynamicGalleryImageSize = Math.min(screenWidth * 0.2, 100);
const dynamicHeaderHeight = Math.min(screenHeight * 0.28, 280);

// STYLES (styles object is defined at the end of the file and is quite large, keeping it there for brevity here)
// Assume 'styles' is available as defined in the original problem.
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', },
  loadingText: { marginTop: 10, fontSize: normalizeFont(16), color: '#555', },
  errorText: { marginTop: 10, fontSize: normalizeFont(16), color: 'red', textAlign: 'center', paddingHorizontal: 20, },
  retryButton: { marginTop: 20, backgroundColor: '#FF6F00', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, },
  retryButtonText: { color: '#fff', fontSize: normalizeFont(16), fontWeight: 'bold', },
  inlineLoadingIndicator: { position: 'absolute', top: dynamicHeaderHeight / 2, left: screenWidth / 2 - 15, zIndex: 20, backgroundColor: 'rgba(255,255,255,0.7)', padding: 5, borderRadius: 20, },
  galleryContainerInternal: { /*width: '100%',*/ }, // contentContainerStyle for horizontal scroll
  emptyGalleryText: { fontSize: normalizeFont(14), color: '#777', textAlign: 'center', paddingVertical: normalizeSpacing(20), width: screenWidth - normalizeSpacing(40), },
  editImageText: { color: 'white', fontSize: normalizeFont(10), marginTop: 2, },
  container: { flexGrow: 1, backgroundColor: '#FFF', alignItems: 'center' },
  editingButton: { backgroundColor: '#FF6F00', borderColor: '#FF6F00', },
  settingsButton: { position: 'absolute', top: normalizeSpacing(15) + (Dimensions.get('window').height > 800 ? 20 : 0), backgroundColor: '#fff', padding: normalizeSpacing(8), borderRadius: normalizeSpacing(20), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2, zIndex: 10, },
  headerWrapper: { width: '100%', minHeight: dynamicHeaderHeight, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', paddingTop: normalizeSpacing(65), paddingBottom: normalizeSpacing(16), },
  profileImageContainer: { position: 'relative', },
  profileImage: { width: dynamicImageSize, height: dynamicImageSize, borderRadius: dynamicImageSize / 2, borderWidth: 3, borderColor: '#FF6F00', },
  editImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', height: dynamicImageSize * 0.3, borderBottomLeftRadius: dynamicImageSize / 2, borderBottomRightRadius: dynamicImageSize / 2, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', },
  name: { fontSize: normalizeFont(22), fontWeight: 'bold', color: '#000', marginTop: normalizeSpacing(8) },
  subText: { fontSize: normalizeFont(14), color: '#555', marginBottom: normalizeSpacing(10) },
  verificationWrapper: { width: '92%', maxWidth: 400, marginTop: normalizeSpacing(8), marginBottom: normalizeSpacing(4), alignSelf: 'center', },
  verificationContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalizeSpacing(12), paddingVertical: normalizeSpacing(8), borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, },
  verificationBadge: { width: normalizeSpacing(32), height: normalizeSpacing(32), borderRadius: normalizeSpacing(16), backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1, },
  verificationTextContainer: { flex: 1, marginLeft: normalizeSpacing(10), marginRight: normalizeSpacing(5), },
  verificationStatus: { fontSize: normalizeFont(15), fontWeight: '700', letterSpacing: 0.3, },
  infoButton: { padding: normalizeSpacing(5), backgroundColor: 'white', borderRadius: normalizeSpacing(12), shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1, },
  galleryHeadingContainer: { width: '90%', marginTop: normalizeSpacing(10), marginBottom: normalizeSpacing(6), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
  galleryHeading: { fontSize: normalizeFont(18), fontWeight: 'bold', color: '#333', },
  addImageButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: normalizeSpacing(4), paddingHorizontal: normalizeSpacing(8), backgroundColor: '#FFF5E6', borderRadius: 20, },
  addImageText: { color: '#FF6F00', marginLeft: normalizeSpacing(4), fontWeight: '600', fontSize: normalizeFont(13), },
  galleryContainer: { width: '100%', marginTop: normalizeSpacing(6), marginBottom: normalizeSpacing(12), paddingHorizontal: normalizeSpacing(10), },
  imageContainer: { position: 'relative', marginRight: normalizeSpacing(12), marginBottom: normalizeSpacing(6), marginLeft: normalizeSpacing(4), marginTop: normalizeSpacing(8), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3, backgroundColor: '#FFF', borderRadius: 12, },
  galleryImage: { width: dynamicGalleryImageSize, height: dynamicGalleryImageSize, borderRadius: 12, },
  removeImageButton: { position: 'absolute', top: -normalizeSpacing(8), right: -normalizeSpacing(8), backgroundColor: 'white', borderRadius: normalizeSpacing(14), width: normalizeSpacing(28), height: normalizeSpacing(28), alignItems: 'center', justifyContent: 'center', padding: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6, zIndex: 10, },
  infoSection: { flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: normalizeSpacing(20), marginBottom: normalizeSpacing(5), },
  sectionHeading: { fontSize: normalizeFont(18), fontWeight: 'bold', color: '#000' },
  infoCard: { width: '90%', marginTop: normalizeSpacing(10), backgroundColor: '#FFFFFF', borderRadius: 12, paddingBottom: normalizeSpacing(10), },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: normalizeSpacing(14), borderBottomWidth: 1, borderColor: '#F0F0F0', },
  selectedRow: { backgroundColor: '#FFF5E6', },
  infoContent: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingHorizontal: normalizeSpacing(12), },
  label: { fontSize: normalizeFont(14), fontWeight: '600', color: '#444', flex: 0.45, },
  infoText: { fontSize: normalizeFont(14), color: '#333', flex: 0.55, textAlign: 'right', },
  editableText: { color: '#FF6F00', fontWeight: '500', },
  editIcon: { marginLeft: normalizeSpacing(5), },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: normalizeSpacing(20), paddingTop: normalizeSpacing(20), paddingBottom: normalizeSpacing(30), minHeight: '35%', maxHeight: '60%', },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalizeSpacing(20), },
  modalTitle: { fontSize: normalizeFont(18), fontWeight: 'bold', color: '#333', },
  closeModalButton: { padding: normalizeSpacing(6), },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: normalizeSpacing(12), paddingVertical: normalizeSpacing(10), fontSize: normalizeFont(15), backgroundColor: '#F9F9F9', width: '100%', marginBottom: normalizeSpacing(20), minHeight: normalizeSpacing(45) }, // Added minHeight
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: normalizeSpacing(10), },
  modalButton: { flex: 1, paddingVertical: normalizeSpacing(12), borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, },
  cancelButton: { backgroundColor: '#E0E0E0', },
  saveButton: { backgroundColor: '#FF6F00', },
  modalButtonText: { fontSize: normalizeFont(15), fontWeight: '600', },
  cancelButtonText: { color: '#333', },
  saveButtonText: { color: '#fff', },
  editHint: { fontSize: normalizeFont(12), color: '#FF6F00', fontStyle: 'italic', },
  editableRow: { backgroundColor: '#FFF9F2', borderRadius: 8, },
  imagePreviewContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center', },
  previewImage: { width: screenWidth, height: screenHeight * 0.7, },
  closePreviewButton: { position: 'absolute', top: normalizeSpacing(40), right: normalizeSpacing(20), zIndex: 10, padding: normalizeSpacing(8), backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, },
  settingsModalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', },
  settingsModalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: normalizeSpacing(15), paddingTop: normalizeSpacing(15), paddingBottom: normalizeSpacing(25), minHeight: '50%', maxHeight: '90%', },
  settingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalizeSpacing(15), },
  settingsTitle: { fontSize: normalizeFont(20), fontWeight: 'bold', color: '#333', },
  closeSettingsButton: { padding: normalizeSpacing(5), },
  settingsTabs: { flexDirection: 'row', marginBottom: normalizeSpacing(15), borderBottomWidth: 1, borderBottomColor: '#eee', },
  settingsTab: { flex: 1, paddingVertical: normalizeSpacing(10), alignItems: 'center', },
  activeSettingsTab: { borderBottomWidth: 2.5, borderBottomColor: '#FF6F00', },
  settingsTabText: { color: '#666', fontSize: normalizeFont(14), fontWeight: '600', },
  activeSettingsTabText: { color: '#FF6F00', },
  settingsSection: { flexGrow: 1, paddingTop: normalizeSpacing(8), },
  permissionContainer: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 15, marginBottom: 15, },
  permissionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, },
  permissionTitle: { fontSize: normalizeFont(16), fontWeight: 'bold', marginLeft: 8, color: '#333', },
  permissionStatus: { fontSize: normalizeFont(14), color: '#666', marginBottom: 10, },
  permissionButton: { backgroundColor: '#FF6F00', borderRadius: 4, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start', },
  permissionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: normalizeFont(14), },
  settingsDivider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 15, },
  permissionNote: { fontSize: normalizeFont(14), color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 15, paddingHorizontal: 20, },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: normalizeSpacing(12), borderBottomWidth: 1, borderBottomColor: '#f5f5f5', },
  settingLabel: { fontSize: normalizeFont(15), color: '#333', flexShrink: 1, marginRight: normalizeSpacing(8), },
  dangerButton: { backgroundColor: '#FF4D4D', paddingVertical: normalizeSpacing(12), paddingHorizontal: normalizeSpacing(15), borderRadius: 8, alignItems: 'center', marginTop: normalizeSpacing(20), },
  dangerButtonText: { color: 'white', fontSize: normalizeFont(15), fontWeight: 'bold', },
  containerLandscape: { paddingHorizontal: '5%', },
  headerWrapperLandscape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', minHeight: screenHeight * 0.4, paddingHorizontal: normalizeSpacing(20), paddingTop: normalizeSpacing(20), },
  galleryContainerLandscape: { width: '95%', },
  editOptionsContainer: { marginTop: normalizeSpacing(10), },
  editOptionButton: { flexDirection: 'row', alignItems: 'center', padding: normalizeSpacing(12), backgroundColor: '#FAFAFA', borderRadius: 10, marginBottom: normalizeSpacing(10), borderWidth: 1, borderColor: '#EEEEEE', },
  editOptionIcon: { width: normalizeSpacing(36), height: normalizeSpacing(36), borderRadius: normalizeSpacing(18), backgroundColor: '#FFF5E6', alignItems: 'center', justifyContent: 'center', marginRight: normalizeSpacing(10), },
  editOptionContent: { flex: 1, },
  editOptionTitle: { fontSize: normalizeFont(15), fontWeight: '600', color: '#333', marginBottom: normalizeSpacing(3), },
  editOptionDescription: { fontSize: normalizeFont(13), color: '#666', },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000, },
  errorContainer: { padding: normalizeSpacing(15), backgroundColor: '#FFEBEE', borderRadius: 8, marginHorizontal: normalizeSpacing(15), marginBottom: normalizeSpacing(15), },
  errorTextInContainer: { color: '#D32F2F', fontSize: normalizeFont(14),},
});

// --- Helper Functions ---
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
    return age >= 0 ? age.toString() : 'N/A';
  } catch (e) { return 'N/A'; }
};

const formatHeight = (cm?: number): string => {
  if (cm === undefined || cm === null || isNaN(cm) || cm <= 0) return 'N/A';
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}'${remainingInches}"`;
};

const formatFieldName = (field: keyof ProfileData | string): string => {
  const spaced = String(field).replace(/([A-Z])/g, ' $1');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const parseHeightToCm = (heightStr: string): number | undefined => {
  const numCm = parseFloat(heightStr);
  if (!isNaN(numCm) && /^\d+(\.\d+)?$/.test(heightStr.trim())) { return numCm; }
  const feetInchesMatch = heightStr.match(/(\d+)'\s*(\d+)"?/);
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1], 10);
    const inches = parseInt(feetInchesMatch[2], 10);
    if (!isNaN(feet) && !isNaN(inches)) { return Math.round((feet * 12 + inches) * 2.54); }
  }
  return undefined;
};

const arrayToString = (arr?: string[]): string => arr && arr.length > 0 ? arr.join(', ') : 'N/A';
const stringToArray = (str?: string): string[] => str && str !== 'N/A' ? str.split(',').map(s => s.trim()).filter(s => s) : [];

// --- Field Mapping for Updates ---
type ProfileSectionKey = 'profile' | 'basic' | 'caste' | 'occupation' | 'lifestyle' | 'personality' | 'preferences' | 'values';
interface FieldUpdateMapping {
  section: ProfileSectionKey;
  backendKey: string;
  transformToBackend?: (value: string, originalProfileData: ProfileData) => any;
}

const fieldToBackendUpdateMapping: Partial<Record<keyof ProfileData, FieldUpdateMapping>> = {
  name: { section: 'profile', backendKey: 'displayName' },
  bio: { section: 'profile', backendKey: 'bio' },
  // isHidden: { section: 'profile', backendKey: 'isHidden', transformToBackend: (value) => value === 'true' }, // Needs switch UI

  firstName: { section: 'basic', backendKey: 'firstName' }, // Requires careful handling if 'name' is also 'displayName'
  lastName: { section: 'basic', backendKey: 'lastName' },   // Requires careful handling
  phone: { section: 'basic', backendKey: 'phone' },
  location: {
    section: 'basic',
    backendKey: 'location',
    transformToBackend: (value: string) => {
      const parts = value.split(',').map(s => s.trim());
      // Assuming "City, State, Country" or "City, Country" or just "City"
      return { city: parts[0] || undefined, state: parts.length > 2 ? parts[1] : undefined, country: parts.length > 1 ? parts[parts.length -1] : undefined, fullAddress: value };
    }
  },
  height: { section: 'basic', backendKey: 'height', transformToBackend: (value: string) => parseHeightToCm(value) },
  // Enums like gender, maritalStatus, children would need pickers, not text input.
  
  // religion: { section: 'caste', backendKey: 'religion' }, // Enum
  clanGotra: { section: 'caste', backendKey: 'caste' },
  gan: { section: 'caste', backendKey: 'subCaste' },
  nakshatra: { section: 'caste', backendKey: 'motherTongue' },
  community: { section: 'caste', backendKey: 'community' },

  // education: { section: 'occupation', backendKey: 'education' }, // Enum
  highestDegree: { section: 'occupation', backendKey: 'highestDegree' },
  // occupation: { section: 'occupation', backendKey: 'occupation' }, // Enum
  // employedIn: { section: 'occupation', backendKey: 'employedIn' }, // Enum
  companyName: { section: 'occupation', backendKey: 'companyName' },
  jobTitle: { section: 'occupation', backendKey: 'jobTitle' },
  // income: { section: 'occupation', backendKey: 'annualIncome' }, // Enum

  // Lifestyle enums (diet, smoking, drinking, livingArrangement) need pickers
  disabilityDetails: { section: 'lifestyle', backendKey: 'disabilityDetails' },
  // hasDisability: { section: 'lifestyle', backendKey: 'hasDisability', transformToBackend: (value) => value === 'true' }, // Needs switch UI

  hobbies: { section: 'personality', backendKey: 'hobbies', transformToBackend: (value) => stringToArray(value) },
  interests: { section: 'personality', backendKey: 'interests', transformToBackend: (value) => stringToArray(value) },
  personalityTraits: { section: 'personality', backendKey: 'personalityTraits', transformToBackend: (value) => stringToArray(value) },
  musicTaste: { section: 'personality', backendKey: 'musicTaste', transformToBackend: (value) => stringToArray(value) },
  movieTaste: { section: 'personality', backendKey: 'movieTaste', transformToBackend: (value) => stringToArray(value) },
  sportsInterest: { section: 'personality', backendKey: 'sportsInterest', transformToBackend: (value) => stringToArray(value) },
  // travelStyle: { section: 'personality', backendKey: 'travelStyle' }, // Enum
};


// --- Profile Screen Component ---
const ProfileScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState<keyof ProfileData>('name');
  const [selectedField, setSelectedField] = useState<keyof ProfileData | null>(null);
  
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/120/FF6F00/FFFFFF?text=M');
  const initialProfileData: ProfileData = {
    name: 'Loading...', bio: 'N/A', isHidden: false, email: 'N/A',
    firstName: 'N/A', lastName: 'N/A', gender: 'N/A', phone: 'N/A', location: 'N/A', age: 'N/A', height: "N/A", maritalStatus: 'N/A', children: 'N/A',
    religion: 'N/A', clanGotra: 'N/A', gan: 'N/A', nakshatra: 'N/A', community: 'N/A',
    education: 'N/A', highestDegree: 'N/A', occupation: 'N/A', employedIn: 'N/A', companyName: 'N/A', jobTitle: 'N/A', income: 'N/A',
    diet: 'N/A', smoking: 'N/A', drinking: 'N/A', livingArrangement: 'N/A', hasDisability: false, disabilityDetails: 'N/A',
    hobbies: 'N/A', interests: 'N/A', personalityTraits: 'N/A', musicTaste: 'N/A', movieTaste: 'N/A', sportsInterest: 'N/A', travelStyle: 'N/A',
    isVerified: false,
  };
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);

  const [inputValue, setInputValue] = useState('');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [editMode, setEditMode] = useState<'none' | 'profile' | 'gallery'>('none');

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsData, setSettingsData] = useState<Partial<UserSettings>>(defaultUserSettings);
  const [currentSettingsTab, setCurrentSettingsTab] = useState<'notifications' | 'privacy' | 'account'>('notifications');
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [editOptionsVisible, setEditOptionsVisible] = useState(false);

  const handleAuthError = useCallback((error: any) => {
    console.error('Authentication error:', error);
    Alert.alert("Authentication Error", "Your session has expired or is invalid. Please login again.");
    AsyncStorage.removeItem('accessToken');
    router.replace("/auth/login");
  }, [router]);
  
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data: BackendProfileResponse = await profileService.getProfile();
      
      const newProfileData: ProfileData = {
        name: data.profile?.displayName || 'N/A',
        bio: data.profile?.bio || 'N/A',
        isHidden: data.profile?.isHidden || false,
        email: data.profile?.email || 'N/A',

        firstName: data.basicInfo?.firstName || 'N/A',
        lastName: data.basicInfo?.lastName || 'N/A',
        gender: data.basicInfo?.gender || 'N/A',
        phone: data.basicInfo?.phone || 'N/A',
        _birthDate: data.basicInfo?.birthDate,
        age: calculateAge(data.basicInfo?.birthDate),
        height: formatHeight(data.basicInfo?.height),
        location: data.basicInfo?.location
          ? `${data.basicInfo.location.city || ''}${data.basicInfo.location.city && (data.basicInfo.location.state || data.basicInfo.location.country) ? ', ' : ''}${data.basicInfo.location.state || ''}${data.basicInfo.location.state && data.basicInfo.location.country ? ', ' : ''}${data.basicInfo.location.country || ''}`.trim() || 'N/A'
          : 'N/A',
        maritalStatus: data.basicInfo?.maritalStatus || 'N/A',
        children: data.basicInfo?.children || 'N/A',
        
        religion: data.casteInfo?.religion || 'N/A',
        clanGotra: data.casteInfo?.caste || 'N/A',
        gan: data.casteInfo?.subCaste || 'N/A',
        nakshatra: data.casteInfo?.motherTongue || 'N/A',
        community: data.casteInfo?.community || 'N/A',
        
        education: data.occupationInfo?.education || 'N/A',
        highestDegree: data.occupationInfo?.highestDegree || 'N/A',
        occupation: data.occupationInfo?.occupation || 'N/A',
        employedIn: data.occupationInfo?.employedIn || 'N/A',
        companyName: data.occupationInfo?.companyName || 'N/A',
        jobTitle: data.occupationInfo?.jobTitle || 'N/A',
        income: data.occupationInfo?.annualIncome || 'N/A',

        diet: data.lifestyleInfo?.diet || 'N/A',
        smoking: data.lifestyleInfo?.smoking || 'N/A',
        drinking: data.lifestyleInfo?.drinking || 'N/A',
        livingArrangement: data.lifestyleInfo?.livingArrangement || 'N/A',
        hasDisability: data.lifestyleInfo?.hasDisability || false,
        disabilityDetails: data.lifestyleInfo?.disabilityDetails || 'N/A',

        hobbies: arrayToString(data.personalityInfo?.hobbies),
        interests: arrayToString(data.personalityInfo?.interests),
        personalityTraits: arrayToString(data.personalityInfo?.personalityTraits),
        musicTaste: arrayToString(data.personalityInfo?.musicTaste),
        movieTaste: arrayToString(data.personalityInfo?.movieTaste),
        sportsInterest: arrayToString(data.personalityInfo?.sportsInterest),
        travelStyle: data.personalityInfo?.travelStyle || 'N/A',
        
        isVerified: data.verificationStatus?.isVerified || false,
        verificationDate: data.verificationStatus?.verifiedOn,
      };
      
      setProfileData(newProfileData);

      if (data.profile?.avatarUrl) setProfileImage(data.profile.avatarUrl);
      
      if (data.profile?.galleryUrls && Array.isArray(data.profile.galleryUrls)) {
        setGalleryImages(data.profile.galleryUrls.map(img => ({ uri: img.url, id: img.id })).filter(img => img.uri));
      } else {
        setGalleryImages([]); // Default to empty if not provided
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      if (error.status === 401 || error.response?.status === 401 || error.message?.toLowerCase().includes('unauthorized')) {
        handleAuthError(error);
        return;
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to fetch profile data.";
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthError]);

  // Check and request notification permissions
  const checkNotificationPermissions = useCallback(async () => {
    if (Platform.OS === 'web') {
      return 'web';
    }
    
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }, []);

  const requestNotificationPermissions = useCallback(async () => {
    if (Platform.OS === 'web') {
      return 'web';
    }
    
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }, []);

  const handleNotificationPermission = useCallback(async () => {
    try {
      // Check current permission status
      const currentStatus = await checkNotificationPermissions();
      
      // Update settings with current status
      if (currentStatus !== 'web') {
        await settingsService.updateNotificationSettings({
          permissionStatus: currentStatus as 'granted' | 'denied' | 'undetermined'
        });
      }
      
      return currentStatus;
    } catch (error) {
      console.error('Error handling notification permissions:', error);
      return 'error';
    }
  }, [checkNotificationPermissions]);

  const openAppSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    try {
      const settings = await settingsService.getSettings();
      setSettingsData(settings);
      
      // Check notification permissions and update if needed
      const permissionStatus = await handleNotificationPermission();
      if (permissionStatus !== 'web' && permissionStatus !== 'error') {
        // If permission status changed, update the settings data
        if (settings?.notifications?.permissionStatus !== permissionStatus) {
          const updatedSettings = {
            ...settings,
            notifications: {
              ...settings.notifications,
              permissionStatus: permissionStatus as 'granted' | 'denied' | 'undetermined'
            }
          };
          setSettingsData(updatedSettings);
        }
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      if (error.status === 401 || error.response?.status === 401 || error.message?.toLowerCase().includes('unauthorized')) {
        handleAuthError(error);
        return;
      }
    } finally {
      setIsSettingsLoading(false);
    }
  }, [handleAuthError, handleNotificationPermission]);

  useEffect(() => {
    fetchProfile();
    fetchSettings();
    const updateLayout = (dims: { window: DimensionsValue }) => { // Simpler type
      const { width, height } = dims.window;
      setOrientation(width > height ? 'landscape' : 'portrait');
    };
    const subscription = Dimensions.addEventListener('change', updateLayout as any); // Cast if type mismatch
    updateLayout({ window: Dimensions.get('window')});
    return () => { subscription?.remove(); };
  }, [fetchProfile, fetchSettings]);

  const handleEditClick = () => {
    if (editMode !== 'none') {
      setEditMode('none'); setSelectedField(null); setModalVisible(false);
    } else {
      setEditOptionsVisible(true);
    }
  };

  const handleEditOptionSelect = (option: 'profile' | 'gallery') => {
    setEditMode(option); setEditOptionsVisible(false);
  };

  const handleImagePress = (uri: string) => {
    if (uri && !uri.includes('via.placeholder.com')) { setSelectedImage(uri); setImagePreviewVisible(true); }
  };

  const handleFieldEdit = (field: keyof ProfileData) => {
    if (editMode === 'profile') {
      const mapping = fieldToBackendUpdateMapping[field];
      if (!mapping) {
          Alert.alert("Info", `Editing for '${formatFieldName(field)}' is not supported with current UI elements or is display-only.`);
          return;
      }

      setEditField(field);
      const currentValue = profileData[field];
      
      if (typeof currentValue === 'string') {
        setInputValue(currentValue === 'N/A' ? '' : currentValue);
        setModalVisible(true);
        setSelectedField(field);
      } else if (typeof currentValue === 'boolean') {
        Alert.alert("Info", `Use main settings or specific UI to toggle '${formatFieldName(field)}'.`);
      } else {
         Alert.alert("Info", `Editing for '${formatFieldName(field)}' may require a different input method.`);
      }
    }
  };

  const handleSaveField = async () => {
    const mapping = fieldToBackendUpdateMapping[editField];
    if (!mapping) {
      Alert.alert("Cannot Save", `No update configuration for ${formatFieldName(editField)}.`);
      setModalVisible(false); return;
    }

    setIsLoading(true); setApiError(null);
    try {
      const { section, backendKey, transformToBackend } = mapping;
      let valueToSave: any = inputValue.trim();
      if (transformToBackend) {
        try {
          valueToSave = transformToBackend(valueToSave, profileData);
          if (valueToSave === undefined && (editField === 'height' || editField === 'location')) {
            Alert.alert("Invalid Format", `Please check the format for ${formatFieldName(editField)}.`); setIsLoading(false); return;
          }
        } catch (e: any) {
          Alert.alert("Input Error", e.message || `Invalid format for ${formatFieldName(editField)}.`); setIsLoading(false); return;
        }
      }
      
      const updateData = { [backendKey]: valueToSave };
      
      // Assuming profileService methods are set up for partial updates
      switch (section) {
        case 'profile': await profileService.updateProfile(updateData); break;
        case 'basic': await profileService.updateBasicInfo(updateData); break;
        case 'caste': await profileService.updateCasteInfo(updateData); break;
        case 'occupation': await profileService.updateOccupationInfo(updateData); break;
        case 'lifestyle': await profileService.updateLifestyleInfo(updateData); break;
        case 'personality': await profileService.updatePersonalityInfo(updateData); break;
        // 'preferences' and 'values' sections are not handled by this simple modal.
        default: throw new Error(`Unknown profile section: ${section}`);
      }
    
      Alert.alert("Success", `${formatFieldName(editField)} updated successfully.`);
      await fetchProfile(); // Re-fetch for consistency
    } catch (error: any) {
      console.error('Error updating field:', error);
      if (error.status === 401 || error.response?.status === 401 || error.message?.toLowerCase().includes('unauthorized')) {
        handleAuthError(error); return;
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || `Could not update ${formatFieldName(editField)}.`;
      setApiError(errorMessage);
      Alert.alert("Update Failed", errorMessage);
    } finally {
      setIsLoading(false); setModalVisible(false); setSelectedField(null);
    }
  };

  const pickImage = async (isProfilePic = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true,
      aspect: isProfilePic ? [1, 1] : [4, 3], quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const { uri, mimeType, fileName } = result.assets[0];
      setIsLoading(true); setApiError(null);
      try {
        const formData = new FormData();
        formData.append(isProfilePic ? 'profileImage' : 'galleryImage', {
          uri: uri, type: mimeType || 'image/jpeg', name: fileName || (isProfilePic ? 'profile.jpg' : 'gallery.jpg'),
        } as any);
        
        const token = await AsyncStorage.getItem('accessToken');
        const endpoint = isProfilePic ? `${API_URL}/profile/avatar` : `${API_URL}/profile/gallery`;
        
        const response = await fetch(endpoint, { method: 'POST', body: formData, headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Upload failed: ${response.status} ${errorData}`);
        }
        await fetchProfile();
        Alert.alert("Success", `Image uploaded successfully!`);
      } catch (e: any) {
        console.error(`Error uploading image:`, e);
        setApiError(`Failed to upload image. ${e.message || ''}`);
        Alert.alert('Upload Error', `Failed to upload image. ${e.message || ''}`);
      } finally { setIsLoading(false); }
    }
  };
  
  const removeImage = async (index: number) => {
    if (editMode === 'gallery') {
      const imageToRemove = galleryImages[index];
      if (!imageToRemove?.id) {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
        Alert.alert("Image Removed", "Image removed from local view."); return;
      }
      Alert.alert("Confirm Delete", "Delete this image from your gallery?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            setIsLoading(true); setApiError(null);
            try {
              const token = await AsyncStorage.getItem('accessToken');
              // Backend must have DELETE /profile/gallery/:imageId endpoint
              const response = await fetch(`${API_URL}/profile/gallery/${imageToRemove.id}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!response.ok) { const err = await response.text(); throw new Error(`Delete failed: ${response.status} ${err}`); }
              Alert.alert("Success", "Image deleted.");
              setGalleryImages(prev => prev.filter(img => img.id !== imageToRemove.id));
            } catch (e: any) {
              console.error('Error deleting gallery image:', e);
              setApiError(`Failed to delete image. ${e.message || ''}`);
              Alert.alert('Delete Error', `Failed to delete image. ${e.message || ''}`);
            } finally { setIsLoading(false); }
        }},
      ]);
    }
  };
  
  const handleSettingsPress = () => setSettingsVisible(true);
  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: async () => {
            setIsLoading(true);
            try { await authService.logout(); router.replace("/auth/login"); }
            catch (error) { console.error('Logout error:', error); Alert.alert('Logout Error', 'Problem logging out.'); }
            finally { setIsLoading(false); }
        }},
    ]);
  };
  
  const toggleNotificationSetting = async (setting: keyof NotificationSettings, value: boolean) => {
    try {
      setIsSettingsLoading(true);
      
      // If enabling any notification setting, check permissions first
      if (value && setting !== 'permissionStatus') {
        const currentPermission = await checkNotificationPermissions();
        
        if (currentPermission === 'undetermined') {
          // Request permission if not determined yet
          const newPermission = await requestNotificationPermissions();
          
          if (newPermission !== 'granted') {
            // If permission denied, show alert and don't enable the setting
            Alert.alert(
              'Notification Permission Required',
              'To receive notifications, you need to allow permissions in your device settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: openAppSettings }
              ]
            );
            return;
          }
        } else if (currentPermission === 'denied') {
          // If already denied, prompt to open settings
          Alert.alert(
            'Notification Permission Required',
            'Notifications are currently disabled. Please enable them in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: openAppSettings }
            ]
          );
          return;
        }
      }
      
      // Update the setting
      await settingsService.updateNotificationSettings({ [setting]: value });
      
      // Fetch updated settings after successful update
      await fetchSettings();
    } catch (error: any) {
      console.error(`Error updating ${setting} setting:`, error);
      Alert.alert('Error', `Failed to update ${setting} setting. Please try again.`);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const togglePrivacySetting = async (setting: keyof PrivacySettings, value: any) => {
    try {
      setIsSettingsLoading(true);
      await settingsService.updatePrivacySettings({ [setting]: value });
      
      // Fetch updated settings after successful update
      await fetchSettings();
    } catch (error: any) {
      console.error(`Error updating ${setting} setting:`, error);
      Alert.alert('Error', `Failed to update ${setting} setting. Please try again.`);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const toggleAccountSetting = async (setting: keyof AccountSettings, value: any) => {
    try {
      setIsSettingsLoading(true);
      await settingsService.updateAccountSettings({ [setting]: value });
      
      // Fetch updated settings after successful update
      await fetchSettings();
    } catch (error: any) {
      console.error(`Error updating ${setting} setting:`, error);
      Alert.alert('Error', `Failed to update ${setting} setting. Please try again.`);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const renderSettingsContent = () => {
    if (isSettingsLoading) {
      return (
        <View style={[styles.settingsSection, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FF6F00" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading settings...</Text>
        </View>
      );
    }

    switch (currentSettingsTab) {
      case 'notifications':
        return (
          <ScrollView style={styles.settingsSection} nestedScrollEnabled>
            {/* Notification Permission Status */}
            {settingsData.notifications?.permissionStatus && (
              <View style={styles.permissionContainer}>
                <View style={styles.permissionHeader}>
                  <Ionicons 
                    name={settingsData.notifications.permissionStatus === 'granted' ? 'checkmark-circle' : 'alert-circle'} 
                    size={normalizeFont(22)} 
                    color={settingsData.notifications.permissionStatus === 'granted' ? '#4CAF50' : '#FF9800'} 
                  />
                  <Text style={styles.permissionTitle}>Notification Permissions</Text>
                </View>
                <Text style={styles.permissionStatus}>
                  Status: <Text style={{ fontWeight: 'bold', color: settingsData.notifications.permissionStatus === 'granted' ? '#4CAF50' : '#FF9800' }}>
                    {settingsData.notifications.permissionStatus === 'granted' ? 'Granted' : 
                     settingsData.notifications.permissionStatus === 'denied' ? 'Denied' : 'Not Requested'}
                  </Text>
                </Text>
                {settingsData.notifications?.permissionStatus !== 'granted' && (
                  <TouchableOpacity 
                    style={styles.permissionButton}
                    onPress={async () => {
                      if (settingsData.notifications?.permissionStatus === 'denied') {
                        openAppSettings();
                      } else {
                        const status = await requestNotificationPermissions();
                        if (status === 'granted') {
                          await settingsService.updateNotificationSettings({ permissionStatus: 'granted' });
                          await fetchSettings();
                        }
                      }
                    }}
                  >
                    <Text style={styles.permissionButtonText}>
                      {settingsData.notifications.permissionStatus === 'denied' ? 'Open Settings' : 'Request Permission'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            <View style={styles.settingsDivider} />
            
            {/* Notification Settings */}
            {settingsData.notifications && Object.entries(settingsData.notifications).map(([key, value]) => {
              if (typeof value !== 'boolean' || key === 'permissionStatus') return null;
              return (
                <View style={styles.settingItem} key={key}>
                  <Text style={styles.settingLabel}>{formatFieldName(key)}</Text>
                  <Switch
                    value={value}
                    onValueChange={(newValue) => toggleNotificationSetting(key as keyof NotificationSettings, newValue)}
                    trackColor={{ false: '#767577', true: '#FF6F00' }}
                    thumbColor={value ? '#fff' : '#f4f3f4'}
                    disabled={isSettingsLoading || settingsData.notifications?.permissionStatus !== 'granted'}
                  />
                </View>
              );
            })}
            
            {settingsData.notifications?.permissionStatus !== 'granted' && (
              <Text style={styles.permissionNote}>
                Enable notification permissions to manage individual notification settings
              </Text>
            )}
          </ScrollView>
        );
      
      case 'privacy':
        return (
          <ScrollView style={styles.settingsSection} nestedScrollEnabled>
            {settingsData.privacy && Object.entries(settingsData.privacy).map(([key, value]) => {
              if (key === 'blockList' || typeof value === 'undefined') return null;
              if (key === 'profileVisibility') {
                return (
                  <View style={styles.settingItem} key={key}>
                    <Text style={styles.settingLabel}>Profile Visibility</Text>
                    <Text style={{ color: '#FF6F00' }}>{value}</Text>
                  </View>
                );
              }
              return (
                <View style={styles.settingItem} key={key}>
                  <Text style={styles.settingLabel}>{formatFieldName(key)}</Text>
                  <Switch
                    value={value as boolean}
                    onValueChange={(newValue) => togglePrivacySetting(key as keyof PrivacySettings, newValue)}
                    trackColor={{ false: '#767577', true: '#FF6F00' }}
                    thumbColor={(value as boolean) ? '#fff' : '#f4f3f4'}
                    disabled={isSettingsLoading}
                  />
                </View>
              );
            })}
            <TouchableOpacity style={styles.editOptionButton} onPress={() => Alert.alert('Coming Soon', 'Blocked users management will be available in a future update.')}>
              <View style={styles.editOptionIcon}>
                <Ionicons name="ban-outline" size={normalizeFont(22)} color="#FF6F00" />
              </View>
              <View style={styles.editOptionContent}>
                <Text style={styles.editOptionTitle}>Blocked Users</Text>
                <Text style={styles.editOptionDescription}>Manage your blocked users</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={normalizeFont(22)} color="#999" />
            </TouchableOpacity>
          </ScrollView>
        );
      
      case 'account':
        return (
          <ScrollView style={styles.settingsSection} nestedScrollEnabled>
            {settingsData.account && Object.entries(settingsData.account).map(([key, value]) => {
              if (key === 'email') {
                return (
                  <View style={styles.settingItem} key={key}>
                    <Text style={styles.settingLabel}>Email</Text>
                    <Text style={{ color: '#666' }}>{value}</Text>
                  </View>
                );
              }
              if (key === 'language') {
                return (
                  <View style={styles.settingItem} key={key}>
                    <Text style={styles.settingLabel}>Language</Text>
                    <Text style={{ color: '#FF6F00' }}>{value}</Text>
                  </View>
                );
              }
              if (typeof value === 'boolean') {
                return (
                  <View style={styles.settingItem} key={key}>
                    <Text style={styles.settingLabel}>{formatFieldName(key)}</Text>
                    <Switch
                      value={value}
                      onValueChange={(newValue) => toggleAccountSetting(key as keyof AccountSettings, newValue)}
                      trackColor={{ false: '#767577', true: '#FF6F00' }}
                      thumbColor={value ? '#fff' : '#f4f3f4'}
                      disabled={isSettingsLoading}
                    />
                  </View>
                );
              }
              return null;
            })}
            <TouchableOpacity style={styles.editOptionButton} onPress={() => Alert.alert('Coming Soon', 'Password change functionality will be available in a future update.')}>
              <View style={styles.editOptionIcon}>
                <Ionicons name="lock-closed-outline" size={normalizeFont(22)} color="#FF6F00" />
              </View>
              <View style={styles.editOptionContent}>
                <Text style={styles.editOptionTitle}>Change Password</Text>
                <Text style={styles.editOptionDescription}>Update your password</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={normalizeFont(22)} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
              <Text style={styles.dangerButtonText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

  const handleVerificationInfoPress = () => {
    const vDate = profileData.verificationDate ? new Date(profileData.verificationDate).toLocaleDateString() : 'N/A';
    Alert.alert("Verification Status", profileData.isVerified ? `Verified on ${vDate}.` : "Not verified.");
  };

  if (isLoading && profileData.name === 'Loading...') {
     return (<View style={styles.loadingContainer}><ActivityIndicator size="large" color="#FF6F00" /><Text style={styles.loadingText}>Loading...</Text></View>);
  }
  if (apiError && profileData.name === 'Loading...') {
     return (<View style={styles.loadingContainer}><Ionicons name="cloud-offline-outline" size={60} color="#FF6F00" /><Text style={styles.errorText}>{apiError}</Text><TouchableOpacity style={styles.retryButton} onPress={fetchProfile}><Text style={styles.retryButtonText}>Try Again</Text></TouchableOpacity></View>);
  }

  const displayableProfileKeys = (Object.keys(profileData) as Array<keyof ProfileData>)
    .filter(key => {
      // 1. Exclude specific internal, header-displayed, or boolean fields not suitable for this list
      const alwaysExclude: (keyof ProfileData)[] = [
        '_birthDate', 'isVerified', 'verificationDate',
        'isHidden', 'hasDisability', // These booleans would need different UI (e.g., Yes/No)
        'email' // Shown in header
      ];
      if (alwaysExclude.includes(key)) {
        return false;
      }

      // 2. Conditional exclusion for firstName/lastName if displayName is present and meaningful
      const displayNameIsMeaningful = profileData.name && profileData.name !== 'N/A';
      if ((key === 'firstName' || key === 'lastName') && displayNameIsMeaningful) {
        // If displayName is set, don't show firstName/lastName to avoid redundancy
        // unless displayName itself is just a concatenation of these.
        // For simplicity here, if displayName is set, we skip first/last.
        // More complex logic could check if displayName === `${firstName} ${lastName}`.
        return false;
      }
      
      // 3. For remaining keys, check if their string value is meaningful for display
      const value = profileData[key];
      if (typeof value === 'string') {
        return value.trim() !== '' && value.trim() !== 'N/A';
      }
      // If profileData could have other types like numbers, handle them here.
      // For now, we're mainly concerned with strings from the backend.
      return false; // Default: if not a non-empty, non-"N/A" string, and not handled above, don't show in this list.
    });


  return (
    <ScrollView contentContainerStyle={[styles.container, orientation === 'landscape' && styles.containerLandscape]} keyboardShouldPersistTaps="handled">
      {isLoading && profileData.name !== 'Loading...' && (<View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#FF6F00" /></View>)}
      {apiError && profileData.name !== 'Loading...' && !modalVisible && (<View style={styles.errorContainer}><Text style={styles.errorTextInContainer}>{apiError}</Text></View>)}

      <TouchableOpacity style={[styles.settingsButton, { left: normalizeSpacing(15), right: undefined }, editMode !== 'none' && styles.editingButton]} onPress={handleEditClick}>
        <Ionicons name={editMode !== 'none' ? "checkmark-done-outline" : "create-outline"} size={normalizeFont(22)} color={editMode !== 'none' ? "#fff" : "#333"} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.settingsButton, { right: normalizeSpacing(15) }]} onPress={handleSettingsPress}>
          <Ionicons name="settings-outline" size={normalizeFont(22)} color="#333" />
      </TouchableOpacity>

      <View style={[styles.headerWrapper, orientation === 'landscape' && styles.headerWrapperLandscape]}>
        <TouchableOpacity onPress={() => editMode === 'profile' ? pickImage(true) : handleImagePress(profileImage)} style={styles.profileImageContainer} disabled={editMode !== 'profile' && (!profileImage || profileImage.includes('via.placeholder.com'))}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} onError={() => setProfileImage('https://via.placeholder.com/120/CCCCCC/FFFFFF?text=Error')} />
          {editMode === 'profile' && (<View style={styles.editImageOverlay}><Ionicons name="camera-outline" size={normalizeFont(16)} color="white" /><Text style={styles.editImageText}>Change</Text></View>)}
        </TouchableOpacity>
        <Text style={styles.name}>{profileData.name === 'N/A' && (profileData.firstName !== 'N/A' || profileData.lastName !== 'N/A') ? `${profileData.firstName} ${profileData.lastName}`.trim() : profileData.name}</Text>
        <Text style={styles.subText}>{profileData.email !== 'N/A' ? profileData.email : `Active since - Jul, 2024`}</Text>

        <View style={styles.verificationWrapper}>
          <View style={[styles.verificationContainer, { backgroundColor: profileData.isVerified ? '#E8F5E9' : '#FFF3E0' }]}>
            <View style={styles.verificationBadge}><Ionicons name={profileData.isVerified ? "shield-checkmark" : "shield-outline"} size={normalizeFont(22)} color={profileData.isVerified ? "#2E7D32" : "#FF8F00"} /></View>
            <View style={styles.verificationTextContainer}><Text style={[styles.verificationStatus, { color: profileData.isVerified ? "#2E7D32" : "#FF8F00" }]}>{profileData.isVerified ? `Verified${profileData.verificationDate ? ` on ${new Date(profileData.verificationDate).toLocaleDateString()}` : ''}` : "Verification Pending"}</Text></View>
            <TouchableOpacity style={styles.infoButton} onPress={handleVerificationInfoPress}><Ionicons name="information-circle-outline" size={normalizeFont(20)} color={profileData.isVerified ? "#2E7D32" : "#FF8F00"} /></TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.galleryHeadingContainer}>
          <Text style={styles.galleryHeading}>Image Gallery</Text>
          {editMode === 'gallery' && (<TouchableOpacity onPress={() => pickImage(false)} style={styles.addImageButton}><Ionicons name="add-circle-outline" size={normalizeFont(20)} color="#FF6F00" /><Text style={styles.addImageText}>Add Image</Text></TouchableOpacity>)}
      </View>
      <View style={[styles.galleryContainer, orientation === 'landscape' && styles.galleryContainerLandscape]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContainerInternal}>
            {galleryImages.length > 0 ? galleryImages.map((image, index) => (
              <TouchableOpacity key={image.id || image.uri || index} style={styles.imageContainer} onPress={() => handleImagePress(image.uri)} disabled={!image.uri || image.uri.includes('via.placeholder.com')}>
                <Image source={{ uri: image.uri }} style={styles.galleryImage} onError={() => setGalleryImages(prev => prev.map((img, i) => i === index ? { ...img, uri: 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=Error' } : img))} />
                {editMode === 'gallery' && (<TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}><Ionicons name="close-circle" size={normalizeFont(24)} color="#FF4D4D" /></TouchableOpacity>)}
              </TouchableOpacity>
            )) : (<View style={{width: screenWidth - normalizeSpacing(20), alignItems: 'center'}}><Text style={styles.emptyGalleryText}>{editMode === 'gallery' ? "Click 'Add Image' to start your gallery." : "No images in gallery."}</Text></View>)}
          </ScrollView>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionHeading}>Profile Details</Text>
        {editMode === 'profile' && displayableProfileKeys.length > 0 && (<Text style={styles.editHint}>Tap a field to edit</Text>)}
      </View>
      
      {displayableProfileKeys.length > 0 ? (
        <View style={styles.infoCard}>
          {displayableProfileKeys.map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.infoRow, (selectedField === key || (modalVisible && editField === key)) && styles.selectedRow, editMode === 'profile' && fieldToBackendUpdateMapping[key] && styles.editableRow]}
              onPress={() => handleFieldEdit(key)}
              disabled={editMode !== 'profile' || typeof profileData[key] === 'boolean' /* Disable booleans here, handle elsewhere */}
            >
              <View style={styles.infoContent}>
                <Text style={styles.label}>{formatFieldName(key)}:</Text>
                <Text style={[styles.infoText, /* profileData[key] === 'N/A' will be filtered out */ editMode === 'profile' && fieldToBackendUpdateMapping[key] && styles.editableText]}>
                  {String(profileData[key])}
                  {editMode === 'profile' && fieldToBackendUpdateMapping[key] && (<Ionicons name="pencil-outline" size={normalizeFont(13)} color="#FF6F00" style={styles.editIcon} />)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.infoCard}>
            <Text style={[styles.emptyGalleryText, {paddingVertical: normalizeSpacing(30)}]}>
                {editMode === 'profile' ? 'No editable details available. Try adding some!' : 'No profile details to display.'}
            </Text>
        </View>
      )}


      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => { setModalVisible(false); setSelectedField(null); }}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={() => { setModalVisible(false); setSelectedField(null); }}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {formatFieldName(editField)}</Text>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => { setModalVisible(false); setSelectedField(null); }}><Ionicons name="close-outline" size={normalizeFont(24)} color="#333" /></TouchableOpacity>
            </View>
            <TextInput
              style={styles.input} value={inputValue} onChangeText={setInputValue} autoFocus
              placeholder={`Enter new ${formatFieldName(editField).toLowerCase()}`}
              multiline={(editField === 'bio' || editField === 'interests' || editField === 'hobbies' || editField === 'disabilityDetails' || editField === 'location' || editField === 'personalityTraits' || editField === 'musicTaste' || editField === 'movieTaste' || editField === 'sportsInterest')}
              numberOfLines={(editField === 'bio' || editField === 'interests' || editField === 'hobbies' || editField === 'disabilityDetails') ? 3 : 1} // Basic multi-line for some fields
              returnKeyType="done" onSubmitEditing={handleSaveField}
            />
            <View style={[styles.modalButtons, { marginTop: 20 }]}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setModalVisible(false); setSelectedField(null); }}><Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveField} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#fff" size="small"/> : <Text style={[styles.modalButtonText, styles.saveButtonText]}>Save</Text>}</TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={imagePreviewVisible} transparent animationType="fade" onRequestClose={() => setImagePreviewVisible(false)}>
        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity style={styles.closePreviewButton} onPress={() => setImagePreviewVisible(false)}><Ionicons name="close-outline" size={normalizeFont(30)} color="white" /></TouchableOpacity>
          {selectedImage ? (<Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain"/>) : null }
        </View>
      </Modal>

      <Modal visible={settingsVisible} animationType="slide" transparent={true} onRequestClose={() => setSettingsVisible(false)}>
        <TouchableOpacity style={styles.settingsModalContainer} activeOpacity={1} onPress={() => setSettingsVisible(false)}>
          <View style={styles.settingsModalContent} onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Settings</Text>
              <TouchableOpacity style={styles.closeSettingsButton} onPress={() => setSettingsVisible(false)}><Ionicons name="close-outline" size={normalizeFont(24)} color="#333" /></TouchableOpacity>
            </View>
            <View style={styles.settingsTabs}>
               <TouchableOpacity style={[styles.settingsTab, currentSettingsTab === 'notifications' && styles.activeSettingsTab]} onPress={() => setCurrentSettingsTab('notifications')}><Text style={[styles.settingsTabText, currentSettingsTab === 'notifications' && styles.activeSettingsTabText]}>Notifications</Text></TouchableOpacity>
               <TouchableOpacity style={[styles.settingsTab, currentSettingsTab === 'privacy' && styles.activeSettingsTab]} onPress={() => setCurrentSettingsTab('privacy')}><Text style={[styles.settingsTabText, currentSettingsTab === 'privacy' && styles.activeSettingsTabText]}>Privacy</Text></TouchableOpacity>
               <TouchableOpacity style={[styles.settingsTab, currentSettingsTab === 'account' && styles.activeSettingsTab]} onPress={() => setCurrentSettingsTab('account')}><Text style={[styles.settingsTabText, currentSettingsTab === 'account' && styles.activeSettingsTabText]}>Account</Text></TouchableOpacity>
            </View>
            {renderSettingsContent()}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={editOptionsVisible} animationType="slide" transparent={true} onRequestClose={() => setEditOptionsVisible(false)}>
         <TouchableOpacity style={styles.settingsModalContainer} activeOpacity={1} onPress={() => setEditOptionsVisible(false)}>
           <View style={styles.settingsModalContent} onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Edit Profile</Text>
              <TouchableOpacity style={styles.closeSettingsButton} onPress={() => setEditOptionsVisible(false)}><Ionicons name="close-outline" size={normalizeFont(24)} color="#333" /></TouchableOpacity>
            </View>
            <View style={styles.editOptionsContainer}>
              <TouchableOpacity style={styles.editOptionButton} onPress={() => handleEditOptionSelect('profile')}><View style={styles.editOptionIcon}><Ionicons name="person-outline" size={normalizeFont(22)} color="#FF6F00" /></View><View style={styles.editOptionContent}><Text style={styles.editOptionTitle}>Profile Information</Text><Text style={styles.editOptionDescription}>Edit your personal details</Text></View><Ionicons name="chevron-forward-outline" size={normalizeFont(22)} color="#999" /></TouchableOpacity>
              <TouchableOpacity style={styles.editOptionButton} onPress={() => handleEditOptionSelect('gallery')}><View style={styles.editOptionIcon}><Ionicons name="images-outline" size={normalizeFont(22)} color="#FF6F00" /></View><View style={styles.editOptionContent}><Text style={styles.editOptionTitle}>Photo Gallery</Text><Text style={styles.editOptionDescription}>Manage your photos</Text></View><Ionicons name="chevron-forward-outline" size={normalizeFont(22)} color="#999" /></TouchableOpacity>
            </View>
           </View>
        </TouchableOpacity>
      </Modal>
      <View style={{ height: normalizeSpacing(40) }} /> {/* Bottom Spacer */}
    </ScrollView>
  );
};

interface DimensionsValue { // Keep this for Dimensions.addEventListener
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

export default ProfileScreen;