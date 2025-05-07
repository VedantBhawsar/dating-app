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
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService } from '../../../services/api'; // Ensure this path is correct

// Options for Pickers
const DIET_OPTIONS = [
  { label: 'Select Diet', value: null },
  { label: 'Omnivore', value: 'Omnivore' },
  { label: 'Vegetarian', value: 'Vegetarian' },
  { label: 'Vegan', value: 'Vegan' },
  { label: 'Pescetarian', value: 'Pescetarian' },
  { label: 'Halal', value: 'Halal' },
  { label: 'Kosher', value: 'Kosher' },
  { label: 'Gluten-Free', value: 'Gluten-Free' },
  { label: 'Other', value: 'Other' },
  { label: 'Prefer not to say', value: 'Prefer_not_to_say' },
];

const SMOKING_OPTIONS = [
  { label: 'Select Smoking Habits', value: null },
  { label: 'Non-smoker', value: 'Non_smoker' },
  { label: 'Light smoker', value: 'Light_smoker' },
  { label: 'Social smoker', value: 'Social_smoker' },
  { label: 'Regular smoker', value: 'Regular_smoker' },
  { label: 'Trying to quit', value: 'Trying_to_quit' },
  { label: 'Vapes/E-cigarettes', value: 'Vapes_E_cigarettes' },
  { label: 'Prefer not to say', value: 'Prefer_not_to_say' },
];

const DRINKING_OPTIONS = [
  { label: 'Select Drinking Habits', value: null },
  { label: 'Non-drinker', value: 'Non_drinker' },
  { label: 'Social drinker', value: 'Social_drinker' },
  { label: 'Regular drinker', value: 'Regular_drinker' },
  { label: 'Occasionally', value: 'Occasionally' },
  { label: 'Prefer not to say', value: 'Prefer_not_to_say' },
];

const LIVING_ARRANGEMENT_OPTIONS = [
  { label: 'Select Living Arrangement', value: null },
  { label: 'Live alone', value: 'Live_alone' },
  { label: 'Live with parents', value: 'Live_with_parents' },
  { label: 'Live with partner', value: 'Live_with_partner' },
  { label: 'Live with roommates', value: 'Live_with_roommates' },
  { label: 'Live with children', value: 'Live_with_children' },
  { label: 'Other', value: 'Other' },
  { label: 'Prefer not to say', value: 'Prefer_not_to_say' },
];

interface LifestyleInfoUpdatePayload {
  diet?: string | null;
  smoking?: string | null;
  drinking?: string | null;
  livingArrangement?: string | null;
  hasDisability?: boolean | null;
  disabilityDetails?: string;
}

const LifestyleInfoScreen = () => {
  const router = useRouter();
  const [introModalVisible, setIntroModalVisible] = useState(false); // Optional intro modal
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const [showDietPicker, setShowDietPicker] = useState(false);

  const [selectedSmoking, setSelectedSmoking] = useState<string | null>(null);
  const [showSmokingPicker, setShowSmokingPicker] = useState(false);

  const [selectedDrinking, setSelectedDrinking] = useState<string | null>(null);
  const [showDrinkingPicker, setShowDrinkingPicker] = useState(false);

  const [selectedLivingArrangement, setSelectedLivingArrangement] = useState<string | null>(null);
  const [showLivingArrangementPicker, setShowLivingArrangementPicker] = useState(false);

  const [hasDisability, setHasDisability] = useState<boolean | null>(null); // null for unselected, true/false for selection
  const [disabilityDetails, setDisabilityDetails] = useState<string>('');

  useEffect(() => {
    // Optionally show an intro modal, or fetch existing data if user is editing
    // setIntroModalVisible(true); 
  }, []);

  const handleCloseIntroModal = (action: 'skip' | 'continue') => {
    setIntroModalVisible(false);
    if (action === 'skip') {
      router.push('/'); // Or next logical step if skipping this section
    }
  };

  const togglePickerModal = (
    pickerType: 'diet' | 'smoking' | 'drinking' | 'livingArrangement'
  ) => {
    setError(null);
    switch (pickerType) {
      case 'diet': setShowDietPicker(p => !p); break;
      case 'smoking': setShowSmokingPicker(p => !p); break;
      case 'drinking': setShowDrinkingPicker(p => !p); break;
      case 'livingArrangement': setShowLivingArrangementPicker(p => !p); break;
    }
  };

  const handlePickerSelect = (
    pickerType: 'diet' | 'smoking' | 'drinking' | 'livingArrangement',
    value: string | null
  ) => {
    switch (pickerType) {
      case 'diet': setSelectedDiet(value); setShowDietPicker(false); break;
      case 'smoking': setSelectedSmoking(value); setShowSmokingPicker(false); break;
      case 'drinking': setSelectedDrinking(value); setShowDrinkingPicker(false); break;
      case 'livingArrangement': setSelectedLivingArrangement(value); setShowLivingArrangementPicker(false); break;
    }
  };

  const handleSubmitLifestyleInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      const payload: LifestyleInfoUpdatePayload = {};
      if (selectedDiet) payload.diet = selectedDiet;
      if (selectedSmoking) payload.smoking = selectedSmoking;
      if (selectedDrinking) payload.drinking = selectedDrinking;
      if (selectedLivingArrangement) payload.livingArrangement = selectedLivingArrangement;
      
      if (hasDisability !== null) { // Only include if user has made a selection
        payload.hasDisability = hasDisability;
        if (hasDisability && disabilityDetails.trim()) {
          payload.disabilityDetails = disabilityDetails.trim();
        } else if (!hasDisability) {
            // If user explicitly states "No", ensure details are not sent or are cleared
            payload.disabilityDetails = undefined; // Or send empty string if API expects it
        }
      }
      
      console.log('Submitting Lifestyle Info:', payload);
      // Ensure you have this service method:
      // @ts-ignore TODO: Remove this once the service method is implemented
      await profileService.updateLifestyleInfo(payload); 
      
      console.log('Lifestyle info update successful. Navigating.');
      router.push('/onboarding/lifestyle&habits/Question17'); // Navigate to the next onboarding step (e.g., interests)

    } catch (err: any) {
      console.error('Error submitting lifestyle info:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update lifestyle information. Please try again.';
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
      {/* Optional Intro Modal */}
      {introModalVisible && (
        <Modal visible={introModalVisible} transparent animationType="fade" onRequestClose={() => handleCloseIntroModal('skip')}>
          <View style={styles.fullScreenOverlayIntro}>
            <BlurView intensity={Platform.OS === 'ios' ? 90 : 60} style={styles.fullScreenBlur} tint="dark">
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Lifestyle Details</Text>
                <Text style={styles.modalText}>
                  Sharing a bit about your lifestyle helps us find more compatible matches.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSkipButton]}
                    onPress={() => handleCloseIntroModal('skip')}
                  >
                    <Text style={[styles.buttonText, styles.modalSkipButtonText]}>Skip this section</Text>
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
          <Text style={styles.mainQuestion}>Your Lifestyle</Text>

          {/* Diet Picker */}
          <Text style={styles.label}>Dietary Preferences</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => togglePickerModal('diet')}
            disabled={isLoading}
          >
            <Text style={[styles.pickerTriggerText, !selectedDiet && styles.pickerPlaceholder]}>
              {DIET_OPTIONS.find(opt => opt.value === selectedDiet)?.label || DIET_OPTIONS[0].label}
            </Text>
          </TouchableOpacity>

          {/* Smoking Picker */}
          <Text style={styles.label}>Smoking Habits</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => togglePickerModal('smoking')}
            disabled={isLoading}
          >
            <Text style={[styles.pickerTriggerText, !selectedSmoking && styles.pickerPlaceholder]}>
              {SMOKING_OPTIONS.find(opt => opt.value === selectedSmoking)?.label || SMOKING_OPTIONS[0].label}
            </Text>
          </TouchableOpacity>

          {/* Drinking Picker */}
          <Text style={styles.label}>Drinking Habits</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => togglePickerModal('drinking')}
            disabled={isLoading}
          >
            <Text style={[styles.pickerTriggerText, !selectedDrinking && styles.pickerPlaceholder]}>
              {DRINKING_OPTIONS.find(opt => opt.value === selectedDrinking)?.label || DRINKING_OPTIONS[0].label}
            </Text>
          </TouchableOpacity>

          {/* Living Arrangement Picker */}
          <Text style={styles.label}>Living Arrangement</Text>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => togglePickerModal('livingArrangement')}
            disabled={isLoading}
          >
            <Text style={[styles.pickerTriggerText, !selectedLivingArrangement && styles.pickerPlaceholder]}>
              {LIVING_ARRANGEMENT_OPTIONS.find(opt => opt.value === selectedLivingArrangement)?.label || LIVING_ARRANGEMENT_OPTIONS[0].label}
            </Text>
          </TouchableOpacity>
          
          {/* Has Disability */}
          <Text style={styles.label}>Do you have any disabilities?</Text>
          <View style={styles.booleanSelectionContainer}>
            <TouchableOpacity
              style={[styles.booleanButton, hasDisability === true && styles.booleanButtonSelected]}
              onPress={() => setHasDisability(true)}
              disabled={isLoading}
            >
              <Text style={[styles.booleanButtonText, hasDisability === true && styles.booleanButtonTextSelected]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.booleanButton, hasDisability === false && styles.booleanButtonSelected]}
              onPress={() => {
                setHasDisability(false);
                setDisabilityDetails(''); // Clear details if "No" is selected
              }}
              disabled={isLoading}
            >
              <Text style={[styles.booleanButtonText, hasDisability === false && styles.booleanButtonTextSelected]}>No</Text>
            </TouchableOpacity>
          </View>

          {/* Disability Details (conditional) */}
          {hasDisability === true && (
            <>
              <Text style={styles.label}>Disability Details (Optional)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Please specify (e.g., mobility, visual impairment). This information helps ensure accessibility and understanding."
                value={disabilityDetails}
                onChangeText={setDisabilityDetails}
                placeholderTextColor="#7F8C8D"
                editable={!isLoading}
                multiline
                numberOfLines={4}
              />
            </>
          )}
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmitLifestyleInfo}
              disabled={isLoading} 
          >
              {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                  <Text style={styles.buttonText}>Continue</Text>
              )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderPickerModal(showDietPicker, 'Select Your Diet', DIET_OPTIONS, (v) => handlePickerSelect('diet', v), () => setShowDietPicker(false))}
      {renderPickerModal(showSmokingPicker, 'Smoking Habits', SMOKING_OPTIONS, (v) => handlePickerSelect('smoking', v), () => setShowSmokingPicker(false))}
      {renderPickerModal(showDrinkingPicker, 'Drinking Habits', DRINKING_OPTIONS, (v) => handlePickerSelect('drinking', v), () => setShowDrinkingPicker(false))}
      {renderPickerModal(showLivingArrangementPicker, 'Living Arrangement', LIVING_ARRANGEMENT_OPTIONS, (v) => handlePickerSelect('livingArrangement', v), () => setShowLivingArrangementPicker(false))}
    </View>
  );
};

export const config = {
  headerShown: false,
};

export default LifestyleInfoScreen;

// Re-using and adapting styles from BasicInfoScreen.tsx
// Ensure these styles are comprehensive or import from a shared style sheet.
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
    paddingHorizontal: 20,
  },
  contentInnerContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  mainQuestion: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1A2533',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D9E0',
    fontSize: 16,
    color: '#2C3E50',
    width: '100%',
    marginBottom: 15,
    shadowColor: '#B0C4DE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top', // For Android
    paddingTop: 15, // Adjust padding for multiline
  },
  pickerTrigger: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D9E0',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
    minHeight: 50,
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
  booleanSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  booleanButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D9E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginHorizontal: 5, // Add some space between buttons
  },
  booleanButtonSelected: {
    backgroundColor: '#FF6F00', // Use primary color for selected
    borderColor: '#FF6F00',
  },
  booleanButtonText: {
    color: '#34495E',
    fontSize: 16,
    fontWeight: '600',
  },
  booleanButtonTextSelected: {
    color: '#FFFFFF',
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
  fullScreenOverlayIntro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  fullScreenOverlayPicker: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenBlur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  modalButton: {
    flex: 1,
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
  pickerModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingTop: 25, paddingBottom: 20, paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '90%',
    maxWidth: 360,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE',
    width: '100%',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 17,
    color: '#2C3E50',
  },
  pickerCloseButton: {
    marginTop: 15,
    backgroundColor: '#7F8C8D',
    width: '100%',
    flex: 0,
  },
});