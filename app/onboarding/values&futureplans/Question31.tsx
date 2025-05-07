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

// --- Constants for Pickers ---
const FAMILY_VALUES_OPTIONS = [
  { label: 'Select Family Values', value: null },
  { label: 'Very Traditional', value: 'Very_Traditional' },
  { label: 'Traditional', value: 'Traditional' },
  { label: 'Modern', value: 'Modern' },
  { label: 'Liberal', value: 'Liberal' },
  { label: 'Balanced', value: 'Balanced' },
  { label: 'Family-oriented', value: 'Family_Oriented' },
  { label: 'Independent', value: 'Independent' },
  { label: 'Not very important', value: 'Not_Important' },
  { label: 'Prefer not to say', value: 'Prefer_Not_To_Say_Family' },
];

const RELIGIOUS_BELIEFS_OPTIONS = [
  { label: 'Select Religious Beliefs', value: null },
  { label: 'Christianity', value: 'Christianity' },
  { label: 'Islam', value: 'Islam' },
  { label: 'Hinduism', value: 'Hinduism' },
  { label: 'Buddhism', value: 'Buddhism' },
  { label: 'Judaism', value: 'Judaism' },
  { label: 'Sikhism', value: 'Sikhism' },
  { label: 'Agnostic', value: 'Agnostic' },
  { label: 'Atheist', value: 'Atheist' },
  { label: 'Spiritual but not religious', value: 'Spiritual_Not_Religious' },
  { label: 'Other', value: 'Other_Religion' },
  { label: 'No strong beliefs', value: 'No_Strong_Beliefs' },
  { label: 'Prefer not to say', value: 'Prefer_Not_To_Say_Religion' },
];

const POLITICAL_VIEWS_OPTIONS = [
  { label: 'Select Political Views', value: null },
  { label: 'Very Liberal', value: 'Very_Liberal' },
  { label: 'Liberal', value: 'Liberal' },
  { label: 'Moderate', value: 'Moderate' },
  { label: 'Conservative', value: 'Conservative' },
  { label: 'Very Conservative', value: 'Very_Conservative' },
  { label: 'Libertarian', value: 'Libertarian' },
  { label: 'Socialist', value: 'Socialist' },
  { label: 'Apolitical / Not interested', value: 'Apolitical' },
  { label: 'Other', value: 'Other_Political' },
  { label: 'Prefer not to say', value: 'Prefer_Not_To_Say_Political' },
];

const WANTS_CHILDREN_OPTIONS = [
  { label: 'Do you want children?', value: null },
  { label: 'Definitely want them', value: 'Definitely_Want' },
  { label: 'Might want / Open to it', value: 'Might_Want' },
  { label: 'Definitely do not want them', value: 'Definitely_No_Want' },
  { label: "Already have, don't want more", value: 'Have_No_More' },
  { label: 'Already have, open to more', value: 'Have_Open_More' },
  { label: 'Not sure yet', value: 'Not_Sure' },
  { label: 'Prefer not to say', value: 'Prefer_Not_To_Say_Children' },
];

const MARRIAGE_PLANS_OPTIONS = [
  { label: 'What are your marriage plans?', value: null },
  { label: 'Looking for marriage', value: 'Looking_For_Marriage' },
  { label: 'Open to marriage', value: 'Open_To_Marriage' },
  { label: 'Not looking for marriage right now', value: 'Not_Looking_Marriage_Now' },
  { label: 'Not interested in marriage', value: 'Not_Interested_Marriage' },
  { label: 'Prefer not to say', value: 'Prefer_Not_To_Say_Marriage' },
];

const FUTURE_GOALS_OPTIONS = [
  { label: 'Select Your Future Goal', value: null },
  { label: 'Travel the world', value: 'Travel_World' },
  { label: 'Start a business', value: 'Start_Business' },
  { label: 'Buy a home', value: 'Buy_Home' },
  { label: 'Advance in career', value: 'Career_Advancement' },
  { label: 'Further education', value: 'Further_Education' },
  { label: 'Raise a family', value: 'Raise_Family' },
  { label: 'Financial independence', value: 'Financial_Independence' },
  { label: 'Retire early', value: 'Early_Retirement' },
  { label: 'Live abroad', value: 'Live_Abroad' },
  { label: 'Learn new skills', value: 'Learn_Skills' },
  { label: 'Volunteer/charity work', value: 'Volunteer_Work' },
  { label: 'Other', value: 'Other_Goal' },
];


interface ValuesPlanUpdatePayload {
  familyValues?: string | null;
  religiousBeliefs?: string | null;
  politicalViews?: string | null;
  wantsChildren?: string | null;
  futureGoals?: string[];
  marriagePlans?: string | null;
  relocateWilling?: boolean | null;
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

export default function ValuesPlanScreen() {
  const router = useRouter();
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_CHIPS = 7; // Max future goals

  // State for Pickers
  const [selectedFamilyValues, setSelectedFamilyValues] = useState<string | null>(null);
  const [showFamilyValuesPicker, setShowFamilyValuesPicker] = useState(false);

  const [selectedReligiousBeliefs, setSelectedReligiousBeliefs] = useState<string | null>(null);
  const [showReligiousBeliefsPicker, setShowReligiousBeliefsPicker] = useState(false);

  const [selectedPoliticalViews, setSelectedPoliticalViews] = useState<string | null>(null);
  const [showPoliticalViewsPicker, setShowPoliticalViewsPicker] = useState(false);

  const [selectedWantsChildren, setSelectedWantsChildren] = useState<string | null>(null);
  const [showWantsChildrenPicker, setShowWantsChildrenPicker] = useState(false);

  const [selectedMarriagePlans, setSelectedMarriagePlans] = useState<string | null>(null);
  const [showMarriagePlansPicker, setShowMarriagePlansPicker] = useState(false);
  
  // State for Future Goals select
  const [selectedFutureGoal, setSelectedFutureGoal] = useState<string | null>(null);
  const [showFutureGoalPicker, setShowFutureGoalPicker] = useState(false);

  // State for Boolean Input
  const [relocateWilling, setRelocateWilling] = useState<boolean | null>(null);

  useEffect(() => {
    // setIntroModalVisible(true);
    // const loadData = async () => { /* API call to fetch existing data */ }; loadData();
  }, []);

  const handleCloseIntroModal = (action: 'skip' | 'continue') => {
    setIntroModalVisible(false);
    if (action === 'skip') {
      router.push('/(tab)'); // Or next final step
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
        Alert.alert("Limit Reached", `You can add up to ${MAX_CHIPS} goals.`);
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

  const handleSubmitValuesPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false); return;
      }

      const payload: ValuesPlanUpdatePayload = {
        familyValues: selectedFamilyValues,
        religiousBeliefs: selectedReligiousBeliefs,
        politicalViews: selectedPoliticalViews,
        wantsChildren: selectedWantsChildren,
        futureGoals: selectedFutureGoal ? [selectedFutureGoal] : undefined,
        marriagePlans: selectedMarriagePlans,
        relocateWilling: relocateWilling,
      };
      
      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined && (!Array.isArray(v) || v.length > 0))
      );

      console.log('Submitting Values & Plans Info:', cleanedPayload);
      await profileService.updateValuesPlan(cleanedPayload); 
      
      console.log('Values & Plans info update successful. Navigating.');
      // Navigate to the final screen or app dashboard
      router.push('/(tab)'); // Example: End of onboarding

    } catch (err: any)      {
      console.error('Error submitting values & plans:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update information. Please try again.';
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

  const renderBooleanSelection = (label: string, value: boolean | null, setter: (val: boolean | null) => void) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.booleanSelectionContainer}>
        <TouchableOpacity
          style={[
            styles.booleanButton,
            value === true && styles.booleanButtonSelected
          ]}
          onPress={() => { setError(null); setter(true); }}
          disabled={isLoading}
        >
          <Text style={[
            styles.booleanButtonText,
            value === true && styles.booleanButtonTextSelected
          ]}>Yes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.booleanButton,
            value === false && styles.booleanButtonSelected
          ]}
          onPress={() => { setError(null); setter(false); }}
          disabled={isLoading}
        >
          <Text style={[
            styles.booleanButtonText,
            value === false && styles.booleanButtonTextSelected
          ]}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPickerTrigger = (
    label: string,
    selectedValue: string | null,
    options: Array<{ label: string; value: string | null }>,
    onPress: () => void
  ) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => { setError(null); onPress();}}
            disabled={isLoading}
        >
            <Text style={[styles.pickerTriggerText, !selectedValue && styles.pickerPlaceholder]}>
            {options.find(opt => opt.value === selectedValue)?.label || options[0].label}
            </Text>
        </TouchableOpacity>
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
          <Text style={styles.mainQuestion}>Values & Future Plans</Text>
          <Text style={styles.subHeader}>Share your core values and aspirations. (All fields are optional)</Text>

          {renderPickerTrigger("Family Values", selectedFamilyValues, FAMILY_VALUES_OPTIONS, () => setShowFamilyValuesPicker(true))}
          {renderPickerTrigger("Religious Beliefs", selectedReligiousBeliefs, RELIGIOUS_BELIEFS_OPTIONS, () => setShowReligiousBeliefsPicker(true))}
          {renderPickerTrigger("Political Views", selectedPoliticalViews, POLITICAL_VIEWS_OPTIONS, () => setShowPoliticalViewsPicker(true))}
          {renderPickerTrigger("Do you want children?", selectedWantsChildren, WANTS_CHILDREN_OPTIONS, () => setShowWantsChildrenPicker(true))}
          
          {renderPickerTrigger("Future Goals", selectedFutureGoal, FUTURE_GOALS_OPTIONS, () => setShowFutureGoalPicker(true))}

          {renderPickerTrigger("Marriage Plans", selectedMarriagePlans, MARRIAGE_PLANS_OPTIONS, () => setShowMarriagePlansPicker(true))}

          {/* Boolean Selection: Willing to Relocate */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Are you willing to relocate?</Text>
            <View style={styles.booleanSelectionContainer}>
              <TouchableOpacity
                style={[
                  styles.booleanButton,
                  relocateWilling === true && styles.booleanButtonSelected
                ]}
                onPress={() => { setError(null); setRelocateWilling(true); }}
                disabled={isLoading}
              >
                <Text style={[
                  styles.booleanButtonText,
                  relocateWilling === true && styles.booleanButtonTextSelected
                ]}>Yes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.booleanButton,
                  relocateWilling === false && styles.booleanButtonSelected
                ]}
                onPress={() => { setError(null); setRelocateWilling(false); }}
                disabled={isLoading}
              >
                <Text style={[
                  styles.booleanButtonText,
                  relocateWilling === false && styles.booleanButtonTextSelected
                ]}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmitValuesPlan}
              disabled={isLoading} 
          >
              {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                  <Text style={styles.buttonText}>Complete Onboarding</Text>
              )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderPickerModal(showFamilyValuesPicker, 'Select Family Values', FAMILY_VALUES_OPTIONS, (v) => {setSelectedFamilyValues(v); setShowFamilyValuesPicker(false);}, () => setShowFamilyValuesPicker(false))}
      {renderPickerModal(showReligiousBeliefsPicker, 'Select Religious Beliefs', RELIGIOUS_BELIEFS_OPTIONS, (v) => {setSelectedReligiousBeliefs(v); setShowReligiousBeliefsPicker(false);}, () => setShowReligiousBeliefsPicker(false))}
      {renderPickerModal(showPoliticalViewsPicker, 'Select Political Views', POLITICAL_VIEWS_OPTIONS, (v) => {setSelectedPoliticalViews(v); setShowPoliticalViewsPicker(false);}, () => setShowPoliticalViewsPicker(false))}
      {renderPickerModal(showWantsChildrenPicker, 'Do you want children?', WANTS_CHILDREN_OPTIONS, (v) => {setSelectedWantsChildren(v); setShowWantsChildrenPicker(false);}, () => setShowWantsChildrenPicker(false))}
      {renderPickerModal(showFutureGoalPicker, 'Select Future Goal', FUTURE_GOALS_OPTIONS, (v) => {setSelectedFutureGoal(v); setShowFutureGoalPicker(false);}, () => setShowFutureGoalPicker(false))}
      {renderPickerModal(showMarriagePlansPicker, 'Marriage Plans', MARRIAGE_PLANS_OPTIONS, (v) => {setSelectedMarriagePlans(v); setShowMarriagePlansPicker(false);}, () => setShowMarriagePlansPicker(false))}
    </View>
  );
};


// Styles (largely reused and adapted)
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
    marginBottom: 20,
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
  booleanSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute space for 2-3 buttons
    width: '100%',
    gap: 10, // Add gap between buttons
  },
  booleanButton: {
    flex: 1, // Allow buttons to grow and share space
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D9E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center', // Center text in button
    minHeight: 50,
  },
  booleanButtonSelected: {
    backgroundColor: '#FF6F00',
    borderColor: '#FF6F00',
  },
  booleanButtonSelectedNeutral: { // For "Not Sure" or "No Preference" when selected
    backgroundColor: '#7f8c8d', // A neutral grey
    borderColor: '#7f8c8d',
  },
  booleanButtonDeselected: { // Style for when other options are chosen, but this one is not
    // No specific style changes here, relies on default booleanButton
  },
  booleanButtonText: {
    color: '#34495E',
    fontSize: 14, // Adjust if text is too long
    fontWeight: '600',
    textAlign: 'center', // Ensure text is centered
  },
  booleanButtonTextSelected: {
    color: '#FFFFFF',
  },
  booleanButtonTextSelectedNeutral: { // For "Not Sure" when selected
    color: '#FFFFFF',
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
  // Modal styles (reused)
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
    maxWidth: 380,
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
    flex: 0, 
    backgroundColor: '#FF6F00',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
  },
  pickerCloseButton: { 
    marginTop: 15,
    backgroundColor: '#7F8C8D',
  },
  // ... other modal styles if needed
});