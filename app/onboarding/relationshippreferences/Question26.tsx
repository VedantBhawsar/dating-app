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
  Keyboard,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService } from '../../../services/api'; // Ensure this path is correct

// --- Constants for Pickers/Suggestions ---
const INCOME_PREFERENCE_OPTIONS = [
  { label: 'Select Income Range (Optional)', value: null },
  { label: 'Below $30,000', value: 'Below_30k' },
  { label: '$30,000 - $50,000', value: '30k_50k' },
  { label: '$50,000 - $75,000', value: '50k_75k' },
  { label: '$75,000 - $100,000', value: '75k_100k' },
  { label: '$100,000 - $150,000', value: '100k_150k' },
  { label: '$150,000 - $250,000', value: '150k_250k' },
  { label: 'Above $250,000', value: 'Above_250k' },
  { label: 'Prefer not to say / No preference', value: 'No_Preference' },
];

// Looking For options
const LOOKING_FOR_OPTIONS = [
  { label: 'Select What You\'re Looking For', value: null },
  { label: 'Long-term relationship', value: 'Long-term relationship' },
  { label: 'Short-term fun', value: 'Short-term fun' },
  { label: 'Friendship', value: 'Friendship' },
  { label: 'Marriage', value: 'Marriage' },
  { label: 'Networking', value: 'Networking' },
  { label: 'Other', value: 'Other' },
];

// Options for select components
const RELIGION_OPTIONS = [
  { label: 'Select Preferred Religion', value: null },
  { label: 'Christianity', value: 'Christianity' },
  { label: 'Islam', value: 'Islam' },
  { label: 'Hinduism', value: 'Hinduism' },
  { label: 'Buddhism', value: 'Buddhism' },
  { label: 'Judaism', value: 'Judaism' },
  { label: 'Agnostic', value: 'Agnostic' },
  { label: 'Atheist', value: 'Atheist' },
  { label: 'Spiritual but not religious', value: 'Spiritual but not religious' },
  { label: 'No preference', value: 'No preference' },
];

const EDUCATION_OPTIONS = [
  { label: 'Select Preferred Education', value: null },
  { label: 'High School', value: 'High School' },
  { label: "Bachelor's Degree", value: "Bachelor's Degree" },
  { label: "Master's Degree", value: "Master's Degree" },
  { label: 'PhD/Doctorate', value: 'PhD/Doctorate' },
  { label: 'Vocational Training', value: 'Vocational Training' },
  { label: 'No preference', value: 'No preference' },
];

const OCCUPATION_OPTIONS = [
  { label: 'Select Preferred Occupation', value: null },
  { label: 'Technology', value: 'Technology' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Education', value: 'Education' },
  { label: 'Business/Finance', value: 'Business/Finance' },
  { label: 'Arts/Creative', value: 'Arts/Creative' },
  { label: 'Trades', value: 'Trades' },
  { label: 'No preference', value: 'No preference' },
];

// Keep caste as chip input
const CASTE_SUGGESTIONS = ["Specific Caste 1", "Specific Caste 2", "No bar", "Prefer not to say"]; // Customize based on target audience

interface RelationshipPreferenceUpdatePayload {
  lookingFor?: string[];
  ageRangeMin?: number | null;
  ageRangeMax?: number | null;
  heightRangeMin?: number | null; // Assuming cm
  heightRangeMax?: number | null; // Assuming cm
  distanceRange?: number | null;  // Assuming km
  preferredReligion?: string[];
  preferredCaste?: string[];
  educationPreference?: string[];
  occupationPreference?: string[];
  incomePreference?: string | null;
}

// Chip Component (reused)
const Chip = ({ label, onDelete }: { label: string; onDelete: () => void }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
    <TouchableOpacity onPress={onDelete} style={styles.chipDelete}>
      <Text style={styles.chipDeleteText}>✕</Text>
    </TouchableOpacity>
  </View>
);

const RelationshipPreferencesScreen = () => {
  const router = useRouter();
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_CHIPS = 10; // Max chips per category

  // State for Looking For select
  const [selectedLookingFor, setSelectedLookingFor] = useState<string | null>(null);
  const [showLookingForPicker, setShowLookingForPicker] = useState(false);

  // Keep caste as chip input
  const [preferredCaste, setPreferredCaste] = useState<string[]>([]);
  const [currentCasteInput, setCurrentCasteInput] = useState<string>('');

  // Convert these to select components
  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);
  const [showReligionPicker, setShowReligionPicker] = useState(false);
  
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null);
  const [showEducationPicker, setShowEducationPicker] = useState(false);
  
  const [selectedOccupation, setSelectedOccupation] = useState<string | null>(null);
  const [showOccupationPicker, setShowOccupationPicker] = useState(false);

  // State for Range Inputs (as strings for TextInput)
  const [ageMin, setAgeMin] = useState<string>('');
  const [ageMax, setAgeMax] = useState<string>('');
  const [heightMin, setHeightMin] = useState<string>(''); // cm
  const [heightMax, setHeightMax] = useState<string>(''); // cm
  const [distance, setDistance] = useState<string>('');   // km

  // State for Picker
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);
  const [showIncomePicker, setShowIncomePicker] = useState(false);

  useEffect(() => {
    // setIntroModalVisible(true);
    // Load existing preferences if any
    // const loadExistingPreferences = async () => { /* ... API call ... */ };
    // loadExistingPreferences();
  }, []);

  const handleCloseIntroModal = (action: 'skip' | 'continue') => {
    setIntroModalVisible(false);
    if (action === 'skip') {
      router.push('/(tab)'); // Or next relevant screen
    }
  };

  const handleAddItem = (
    currentInput: string,
    setCurrentInput: (input: string) => void,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    const newItem = currentInput.trim();
    if (newItem && !items.includes(newItem) && items.length < MAX_CHIPS) {
      setItems([...items, newItem]);
    } else if (items.length >= MAX_CHIPS) {
        Alert.alert("Limit Reached", `You can add up to ${MAX_CHIPS} items for this preference.`);
    }
    setCurrentInput('');
  };

  const handleRemoveItem = (
    itemToRemove: string,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    setItems(items.filter(item => item !== itemToRemove));
  };

  const handleSubmitPreferences = async () => {
    setIsLoading(true);
    setError(null);

    const parsedAgeMin = ageMin ? parseInt(ageMin, 10) : null;
    const parsedAgeMax = ageMax ? parseInt(ageMax, 10) : null;
    const parsedHeightMin = heightMin ? parseFloat(heightMin) : null;
    const parsedHeightMax = heightMax ? parseFloat(heightMax) : null;
    const parsedDistance = distance ? parseInt(distance, 10) : null;

    // Basic Validation
    if ((parsedAgeMin && isNaN(parsedAgeMin)) || (parsedAgeMax && isNaN(parsedAgeMax))) {
      setError("Age range must be valid numbers.");
      setIsLoading(false); return;
    }
    if (parsedAgeMin && parsedAgeMax && parsedAgeMin > parsedAgeMax) {
      setError("Minimum age cannot be greater than maximum age.");
      setIsLoading(false); return;
    }
    if (parsedAgeMin && parsedAgeMin < 18) {
        setError("Minimum preferred age must be at least 18.");
        setIsLoading(false); return;
    }

    if ((parsedHeightMin && isNaN(parsedHeightMin)) || (parsedHeightMax && isNaN(parsedHeightMax))) {
      setError("Height range must be valid numbers.");
      setIsLoading(false); return;
    }
    if (parsedHeightMin && parsedHeightMax && parsedHeightMin > parsedHeightMax) {
      setError("Minimum height cannot be greater than maximum height.");
      setIsLoading(false); return;
    }

    if (parsedDistance && (isNaN(parsedDistance) || parsedDistance < 0)) {
      setError("Distance must be a valid positive number.");
      setIsLoading(false); return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false); return;
      }

      const payload: RelationshipPreferenceUpdatePayload = {
        lookingFor: selectedLookingFor ? [selectedLookingFor] : undefined,
        ageRangeMin: parsedAgeMin,
        ageRangeMax: parsedAgeMax,
        heightRangeMin: parsedHeightMin,
        heightRangeMax: parsedHeightMax,
        distanceRange: parsedDistance,
        preferredReligion: selectedReligion ? [selectedReligion] : undefined,
        preferredCaste: preferredCaste.length > 0 ? preferredCaste : undefined,
        educationPreference: selectedEducation ? [selectedEducation] : undefined,
        occupationPreference: selectedOccupation ? [selectedOccupation] : undefined,
        incomePreference: selectedIncome,
      };
      
      // Filter out null/undefined values if API expects only present fields
      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined && (!Array.isArray(v) || v.length > 0))
      );

      console.log('Submitting Relationship Preferences:', cleanedPayload);
      await profileService.updateRelationshipPreferences(cleanedPayload); 
      
      console.log('Relationship preferences update successful. Navigating.');

      router.push('/onboarding/salary&occupation/Question11'); // Example: Go to main app tabs

    } catch (err: any) {
      console.error('Error submitting preferences:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update preferences. Please try again.';
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
              style={[styles.modalButtonShared, styles.pickerCloseButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );

  const renderChipInput = (
    label: string,
    placeholder: string,
    items: string[],
    setItems: (items: string[]) => void,
    currentInput: string,
    setCurrentInput: (input: string) => void,
    suggestions?: string[]
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      {items.length > 0 && (
        <View style={styles.chipContainer}>
          {items.map((item, index) => (
            <Chip
              key={`${label}-${item}-${index}`}
              label={item}
              onDelete={() => handleRemoveItem(item, items, setItems)}
            />
          ))}
        </View>
      )}
      {/* TODO: Implement suggestion display if suggestions are provided */}
      <TextInput
        style={styles.input}
        placeholder={items.length >= MAX_CHIPS ? "Max items reached" : (items.length > 0 ? "Add another..." : placeholder)}
        value={currentInput}
        onChangeText={setCurrentInput}
        onSubmitEditing={() => handleAddItem(currentInput, setCurrentInput, items, setItems)}
        editable={!isLoading && items.length < MAX_CHIPS}
        autoCapitalize="words"
        blurOnSubmit={false}
        returnKeyType="done"
      />
       <Text style={styles.inputHint}>Type and press enter/done. Max {MAX_CHIPS} items.</Text>
    </View>
  );

  const renderRangeInput = (
    label: string,
    minVal: string,
    setMinVal: (val: string) => void,
    maxVal: string,
    setMaxVal: (val: string) => void,
    unit: string = ""
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rangeInputContainer}>
        <TextInput
          style={[styles.input, styles.rangeInput]}
          placeholder={`Min ${unit}`}
          value={minVal}
          onChangeText={setMinVal}
          keyboardType="numeric"
          editable={!isLoading}
        />
        <Text style={styles.rangeSeparator}>to</Text>
        <TextInput
          style={[styles.input, styles.rangeInput]}
          placeholder={`Max ${unit}`}
          value={maxVal}
          onChangeText={setMaxVal}
          keyboardType="numeric"
          editable={!isLoading}
        />
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      {introModalVisible && (
         <Modal visible={introModalVisible} transparent animationType="fade" onRequestClose={() => handleCloseIntroModal('skip')}>
         {/* ... Intro Modal JSX ... */}
       </Modal>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <View style={styles.contentInnerContainer}>
          <Text style={styles.mainQuestion}>Relationship Preferences</Text>
          <Text style={styles.subHeader}>Help us find your ideal match by specifying what you're looking for. (All fields are optional)</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Looking For</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowLookingForPicker(true); }}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedLookingFor && styles.pickerPlaceholder]}>
                {LOOKING_FOR_OPTIONS.find(opt => opt.value === selectedLookingFor)?.label || LOOKING_FOR_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>
          
          {renderRangeInput("Preferred Age Range", ageMin, setAgeMin, ageMax, setAgeMax, "years")}
          {renderRangeInput("Preferred Height Range", heightMin, setHeightMin, heightMax, setHeightMax, "cm")}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Max Distance</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., 50 km"
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>

          {/* Religion Preference Select */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Religion</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowReligionPicker(true); }}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedReligion && styles.pickerPlaceholder]}>
                {RELIGION_OPTIONS.find(opt => opt.value === selectedReligion)?.label || RELIGION_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Keep Caste as Chip Input */}
          {renderChipInput("Preferred Caste(s) (Optional)", "E.g., Specific Caste, No Bar", preferredCaste, setPreferredCaste, currentCasteInput, setCurrentCasteInput, CASTE_SUGGESTIONS)}
          
          {/* Education Preference Select */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Education</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowEducationPicker(true); }}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedEducation && styles.pickerPlaceholder]}>
                {EDUCATION_OPTIONS.find(opt => opt.value === selectedEducation)?.label || EDUCATION_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Occupation Preference Select */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Occupation</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowOccupationPicker(true); }}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedOccupation && styles.pickerPlaceholder]}>
                {OCCUPATION_OPTIONS.find(opt => opt.value === selectedOccupation)?.label || OCCUPATION_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Income Range</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowIncomePicker(true);}}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedIncome && styles.pickerPlaceholder]}>
                {INCOME_PREFERENCE_OPTIONS.find(opt => opt.value === selectedIncome)?.label || INCOME_PREFERENCE_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmitPreferences}
              disabled={isLoading} 
          >
              {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                  <Text style={styles.buttonText}>Save Preferences & Continue</Text>
              )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderPickerModal(
        showLookingForPicker,
        'Select What You\'re Looking For',
        LOOKING_FOR_OPTIONS,
        (value) => { setSelectedLookingFor(value); setShowLookingForPicker(false); },
        () => setShowLookingForPicker(false)
      )}
      
      {renderPickerModal(
        showReligionPicker,
        'Select Preferred Religion',
        RELIGION_OPTIONS,
        (value) => { setSelectedReligion(value); setShowReligionPicker(false); },
        () => setShowReligionPicker(false)
      )}
      
      {renderPickerModal(
        showEducationPicker,
        'Select Preferred Education',
        EDUCATION_OPTIONS,
        (value) => { setSelectedEducation(value); setShowEducationPicker(false); },
        () => setShowEducationPicker(false)
      )}
      
      {renderPickerModal(
        showOccupationPicker,
        'Select Preferred Occupation',
        OCCUPATION_OPTIONS,
        (value) => { setSelectedOccupation(value); setShowOccupationPicker(false); },
        () => setShowOccupationPicker(false)
      )}
      
      {renderPickerModal(
        showIncomePicker, 
        'Select Preferred Income Range', 
        INCOME_PREFERENCE_OPTIONS, 
        (value) => { setSelectedIncome(value); setShowIncomePicker(false); }, 
        () => setShowIncomePicker(false)
      )}
    </View>
  );
};

export const config = {
  headerShown: false,
};

export default RelationshipPreferencesScreen;

// Styles (largely reused and adapted, new styles for range inputs)
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
    marginBottom: 10,
    color: '#1A2533',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    color: '#526370',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20, // Increased margin for better separation
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    width: '100%',
  },
  chip: {
    flexDirection: 'row',
    backgroundColor: '#E9E9EF',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D9E0'
  },
  chipText: {
    color: '#2C3E50',
    fontSize: 14,
    fontWeight: '500',
  },
  chipDelete: {
    marginLeft: 8,
    padding: 2, 
  },
  chipDeleteText: {
    color: '#7F8C8D', 
    fontWeight: 'bold',
    fontSize: 15,
  },
  inputHint: {
    fontSize: 12,
    color: '#7F8C8D',
    alignSelf: 'flex-start',
    marginTop: 4,
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
    shadowColor: '#B0C4DE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  rangeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rangeInput: {
    flex: 1, // Each input takes up available space
  },
  rangeSeparator: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#34495E',
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
  submitButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 25,
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
  // Modal styles (reused from previous screens)
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
  modalButtonShared: { 
    flex: 0, // Picker modal buttons don't need to flex
    backgroundColor: '#FF6F00',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%', // Make close button full width of modal content
  },
  pickerCloseButton: { 
    marginTop: 15,
    backgroundColor: '#7F8C8D',
  },
  // ... other modal styles (introModalContent, etc.) if you use an intro modal
});