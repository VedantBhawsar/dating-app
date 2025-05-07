import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  Alert,
  TextInput,
  ScrollView, // Added for scrollable content
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { profileService } from '../../../services/api';

const GENDER_OPTIONS = [
  { label: 'Select Gender', value: null },
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Non-binary', value: 'Non-binary' },
  { label: 'Prefer not to say', value: 'Prefer_not_to_say' },
  { label: 'Other', value: 'Other' },
];

const MARITAL_STATUS_OPTIONS = [
  { label: 'Select Marital Status', value: null },
  { label: 'Single', value: 'Single' },
  { label: 'Married', value: 'Married' },
  { label: 'Divorced', value: 'Divorced' },
  { label: 'Widowed', value: 'Widowed' },
  { label: 'In a relationship', value: 'In_a_relationship' },
  { label: 'Separated', value: 'Separated' },
  { label: 'Prefer not to say', value: 'Prefer_not_to_say' },
];

const CHILDREN_OPTIONS = [
  { label: 'Do you have children?', value: null },
  { label: 'No', value: 'No' },
  { label: 'Yes, living with me', value: 'Yes_living_with_me' },
  { label: 'Yes, not living with me', value: 'Yes_not_living_with_me' },
  { label: 'Yes, sometimes', value: 'Yes_sometimes' },
  { label: 'Prefer not to say', value: 'Prefer_not_to_say' },
];

interface BasicInfoUpdatePayload {
  firstName?: string;
  lastName?: string;
  gender?: string | null;
  birthDate?: string;
  location?: {
    city?: string;
    country?: string;
    state?: string;
  };
  height?: number | null;
  maritalStatus?: string | null;
  children?: string | null;
}


const Question1 = () => {
  const router = useRouter();
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const maxDateRef = useRef<Date>((() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  })());

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const [height, setHeight] = useState<string>('');

  const [locationCity, setLocationCity] = useState<string>('');
  const [locationCountry, setLocationCountry] = useState<string>('');

  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<string | null>(null);
  const [showMaritalStatusPicker, setShowMaritalStatusPicker] = useState(false);

  const [selectedChildren, setSelectedChildren] = useState<string | null>(null);
  const [showChildrenPicker, setShowChildrenPicker] = useState(false);

  useEffect(() => {
    setIntroModalVisible(true);
  }, []);

  const handleCloseIntroModal = (action: 'skip' | 'continue') => {
    setIntroModalVisible(false);
    if (action === 'skip') {
      router.push('/');
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || birthDate;

    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && currentDate) {
      if (currentDate <= maxDateRef.current) {
        setBirthDate(currentDate);
        setError(null);
      } else {
        setBirthDate(null);
        setError('You must be at least 18 years old.');
        Alert.alert('Invalid Date', 'You must be at least 18 years old.');
      }
    } else if (event.type === 'dismissed') {
    }
  };

  const toggleDatePicker = () => {
    setError(null);
    setShowDatePicker(prev => !prev);
  };

  const togglePickerModal = (
    pickerType: 'gender' | 'maritalStatus' | 'children'
  ) => {
    setError(null);
    switch (pickerType) {
      case 'gender': setShowGenderPicker(p => !p); break;
      case 'maritalStatus': setShowMaritalStatusPicker(p => !p); break;
      case 'children': setShowChildrenPicker(p => !p); break;
    }
  };

  const handlePickerSelect = (
    pickerType: 'gender' | 'maritalStatus' | 'children',
    value: string | null
  ) => {
    switch (pickerType) {
      case 'gender':
        setSelectedGender(value);
        setShowGenderPicker(false);
        break;
      case 'maritalStatus':
        setSelectedMaritalStatus(value);
        setShowMaritalStatusPicker(false);
        break;
      case 'children':
        setSelectedChildren(value);
        setShowChildrenPicker(false);
        break;
    }
  };

  const handleSubmitInfo = async () => {
    if (!birthDate) {
      setError('Please select your date of birth.');
      Alert.alert('Missing Information', 'Please select your date of birth.');
      return;
    }
    if (birthDate > maxDateRef.current) {
      setError('You must be at least 18 years old.');
      Alert.alert('Invalid Date', 'You must be at least 18 years old.');
      return;
    }
    if (!firstName.trim()) {
      setError('Please enter your first name.');
      Alert.alert('Missing Information', 'Please enter your first name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.warn('No authentication token found.');
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      const payload: BasicInfoUpdatePayload = {
        birthDate: birthDate.toISOString().split('T')[0],
      };

      if (firstName.trim()) payload.firstName = firstName.trim();
      if (lastName.trim()) payload.lastName = lastName.trim(); // Optional
      if (selectedGender) payload.gender = selectedGender;
      
      const heightValue = parseFloat(height);
      if (!isNaN(heightValue) && heightValue > 0) {
        payload.height = heightValue;
      } else if (height.trim() !== '') {
        // Optionally, show an error if height is invalid format
        // setError('Invalid height format. Please enter a number (e.g., 175 for cm).');
        // setIsLoading(false);
        // return;
      }


      if (locationCity.trim() || locationCountry.trim()) {
        payload.location = {};
        if (locationCity.trim()) payload.location.city = locationCity.trim();
        if (locationCountry.trim()) payload.location.country = locationCountry.trim();
        // if (locationState.trim()) payload.location.state = locationState.trim(); // If state input is added
      }

      if (selectedMaritalStatus) payload.maritalStatus = selectedMaritalStatus;
      if (selectedChildren) payload.children = selectedChildren;
      
      console.log('Submitting Basic Info:', payload);
      // @ts-ignore TODO: Remove this once the service method is implemented
      await profileService.updateBasicInfo(payload);
      
      console.log('Basic info update successful. Navigating.');
      router.push('/onboarding/lifestyle&habits/Question16'); // Or next relevant screen

    } catch (err: any) {
      console.error('Error submitting basic info:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPickerModal = (
    visible: boolean,
    title: string,
    options: Array<{ label: string; value: string | null }>,
    onSelect: (value: string | null) => void,
    onClose: () => void
  ) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.fullScreenOverlayPicker}>
        <BlurView intensity={Platform.OS === 'ios' ? 90 : 50} style={styles.fullScreenBlur} tint="dark">
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>{title}</Text>
            <ScrollView style={{ maxHeight: 300, width: '100%' }} persistentScrollbar>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value || `select-prompt-${title}`}
                  style={styles.pickerOptionButton}
                  onPress={() => onSelect(option.value)}
                >
                  <Text style={styles.pickerOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, styles.pickerCloseButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Intro Modal */}
      {introModalVisible && (
        <Modal visible={introModalVisible} transparent animationType="fade" onRequestClose={() => handleCloseIntroModal('skip')}>
          <View style={styles.fullScreenOverlayIntro}>
            <BlurView intensity={Platform.OS === 'ios' ? 90 : 60} style={styles.fullScreenBlur} tint="dark">
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Enhance Your Matchmaking!</Text>
                <Text style={styles.modalText}>
                  To find the best match, please answer the upcoming questions. It only takes a few minutes!
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSkipButton]}
                    onPress={() => handleCloseIntroModal('skip')}
                  >
                    <Text style={[styles.buttonText, styles.modalSkipButtonText]}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => handleCloseIntroModal('continue')}
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </Modal>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentInnerContainer}>
          <Text style={styles.mainQuestion}>Tell us a bit about yourself</Text>

          {/* First Name */}
          <Text style={styles.label}>First Name <Text style={styles.requiredIndicator}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., John"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="#7F8C8D"
            editable={!isLoading}
            autoCapitalize="words"
          />

          {/* Last Name */}
          <Text style={styles.label}>Last Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Doe"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#7F8C8D"
            editable={!isLoading}
            autoCapitalize="words"
          />
          
          {/* Birth Date */}
          <Text style={styles.label}>Date of Birth <Text style={styles.requiredIndicator}>*</Text></Text>
          <TouchableOpacity
            style={styles.pickerTrigger} // Re-using pickerTrigger style for consistency
            onPress={toggleDatePicker}
            disabled={isLoading}
          >
            <Text style={[styles.pickerTriggerText, !birthDate && styles.pickerPlaceholder]}>
              {birthDate 
                ? birthDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
                : 'Select Date of Birth'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <View style={Platform.OS === 'ios' ? styles.iosDatePickerContainer : { width: '100%', alignItems: 'center' }}>
              <DateTimePicker
                testID="dateTimePicker"
                value={birthDate || maxDateRef.current}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={maxDateRef.current}
                textColor={Platform.OS === 'ios' ? (styles.iosPickerText.color) : undefined}
              />
            </View>
          )}

          {/* Gender Picker */}
          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => togglePickerModal('gender')}
            disabled={isLoading}
          >
            <Text style={[styles.pickerTriggerText, !selectedGender && styles.pickerPlaceholder]}>
              {GENDER_OPTIONS.find(opt => opt.value === selectedGender)?.label || GENDER_OPTIONS[0].label}
            </Text>
          </TouchableOpacity>

          {/* Height */}
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., 175"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholderTextColor="#7F8C8D"
            editable={!isLoading}
          />

          {/* Location */}
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={locationCity}
            onChangeText={setLocationCity}
            placeholderTextColor="#7F8C8D"
            editable={!isLoading}
            autoCapitalize="words"
          />
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Country"
            value={locationCountry}
            onChangeText={setLocationCountry}
            placeholderTextColor="#7F8C8D"
            editable={!isLoading}
            autoCapitalize="words"
          />
          
          {/* Marital Status Picker */}
          <Text style={styles.label}>Marital Status</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => togglePickerModal('maritalStatus')}
            disabled={isLoading}
          >
            <Text style={[styles.pickerTriggerText, !selectedMaritalStatus && styles.pickerPlaceholder]}>
              {MARITAL_STATUS_OPTIONS.find(opt => opt.value === selectedMaritalStatus)?.label || MARITAL_STATUS_OPTIONS[0].label}
            </Text>
          </TouchableOpacity>

          {/* Children Picker */}
          <Text style={styles.label}>Children</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => togglePickerModal('children')}
            disabled={isLoading}
          >
            <Text style={[styles.pickerTriggerText, !selectedChildren && styles.pickerPlaceholder]}>
              {CHILDREN_OPTIONS.find(opt => opt.value === selectedChildren)?.label || CHILDREN_OPTIONS[0].label}
            </Text>
          </TouchableOpacity>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <TouchableOpacity
              style={[
                  styles.submitButton,
                  (Platform.OS === 'ios' && showDatePicker) && { marginTop: 10 }, 
                  (!birthDate || !firstName.trim() || isLoading) && styles.disabledButton, 
              ]}
              onPress={handleSubmitInfo}
              disabled={!birthDate || !firstName.trim() || isLoading}
          >
              {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                  <Text style={styles.buttonText}>Continue</Text>
              )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderPickerModal(
        showGenderPicker, 'Select Your Gender', GENDER_OPTIONS,
        (value) => handlePickerSelect('gender', value), () => setShowGenderPicker(false)
      )}
      {renderPickerModal(
        showMaritalStatusPicker, 'Select Marital Status', MARITAL_STATUS_OPTIONS,
        (value) => handlePickerSelect('maritalStatus', value), () => setShowMaritalStatusPicker(false)
      )}
      {renderPickerModal(
        showChildrenPicker, 'About Children', CHILDREN_OPTIONS,
        (value) => handlePickerSelect('children', value), () => setShowChildrenPicker(false)
      )}
    </View>
  );
};

export const config = {
  headerShown: false,
};

export default Question1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20, // Add horizontal padding to scroll view container
  },
  contentInnerContainer: {
    width: '100%', // Takes full width of padded scroll view container
    maxWidth: 500,
    alignItems: 'center',
  },
  mainQuestion: {
    fontSize: 26,
    fontWeight: 'bold', // Bolder for main title
    marginBottom: 30,
    color: '#1A2533', // Darker, more primary color
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600', // Semibold
    color: '#34495E',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 18, // Slightly more space above labels
  },
  requiredIndicator: {
    color: '#E74C3C', // Red for asterisk
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15, // Slightly more padding
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D9E0',
    fontSize: 16,
    color: '#2C3E50', // Darker text for input
    width: '100%',
    marginBottom: 15, // More space below each input
    shadowColor: '#B0C4DE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerTrigger: { // Used for Date of Birth trigger as well now
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D9E0',
    alignItems: 'flex-start', // Align text to the left for a more standard input look
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
    minHeight: 50, // Ensure consistent height
    shadowColor: '#B0C4DE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pickerTriggerText: {
    color: '#2C3E50',
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#7F8C8D',
    fontSize: 16,
  },
  iosDatePickerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 15,
    shadowColor: '#B0C4DE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  iosPickerText: {
    color: '#2C3E50',
  },
  submitButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
    shadowColor: '#FF6F00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#FFCBA4',
    opacity: 0.8,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  // Modal Specific Styles (Intro and Picker)
  fullScreenOverlayIntro: { // For Intro Modal
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Dark overlay for intro
  },
  fullScreenOverlayPicker: { // For Picker Modals
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Relies on BlurView for background, no explicit color here
  },
  fullScreenBlur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { // For Intro Modal
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A2533',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 15,
  },
  modalButton: { // Generic style for buttons in modals
    flex: 1, // For intro modal buttons to share space
    backgroundColor: '#FF6F00',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalSkipButton: {
    backgroundColor: '#BDC3C7',
  },
  modalSkipButtonText: {
    color: '#2C3E50',
  },
  // Picker Modal Specific Content Styles
  pickerModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingTop: 25, paddingBottom: 20, paddingHorizontal: 20, // Adjusted padding
    borderRadius: 15,
    alignItems: 'center',
    width: '90%',
    maxWidth: 360, // Slightly wider for options
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  pickerModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A2533',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerOptionButton: {
    paddingVertical: 16, // More touch area
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE',
    width: '100%',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 17,
    color: '#2C3E50',
  },
  pickerCloseButton: { // Style for the "Close" button in picker modals
    marginTop: 15,
    backgroundColor: '#7F8C8D',
    width: '100%', // Full width within its modal content
    flex: 0, // Override flex: 1 from generic modalButton if it was applied
  },
});