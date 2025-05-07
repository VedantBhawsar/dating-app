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
const EDUCATION_LEVEL_OPTIONS = [
  { label: 'Select Education Level', value: null },
  { label: 'High School or equivalent', value: 'High_School' },
  { label: 'Some College (No Degree)', value: 'Some_College' },
  { label: "Associate's Degree", value: 'Associates_Degree' },
  { label: "Bachelor's Degree", value: 'Bachelors_Degree' },
  { label: "Master's Degree", value: 'Masters_Degree' },
  { label: 'Doctorate (PhD, MD, JD, etc.)', value: 'Doctorate' },
  { label: 'Vocational/Trade School', value: 'Vocational_Trade' },
  { label: 'Other', value: 'Other' },
  { label: 'Prefer not to say', value: 'Prefer_Not_To_Say_Edu' },
];

// Highest Degree can be the same as education level or more granular. For simplicity, reusing.
const HIGHEST_DEGREE_OPTIONS = EDUCATION_LEVEL_OPTIONS;

const OCCUPATION_SECTOR_OPTIONS = [
  { label: 'Select Occupation Sector', value: null },
  { label: 'Technology / IT', value: 'Technology_IT' },
  { label: 'Healthcare / Medical', value: 'Healthcare_Medical' },
  { label: 'Education / Academia', value: 'Education_Academia' },
  { label: 'Business / Finance / Management', value: 'Business_Finance_Management' },
  { label: 'Arts / Entertainment / Media', value: 'Arts_Entertainment_Media' },
  { label: 'Engineering / Manufacturing', value: 'Engineering_Manufacturing' },
  { label: 'Science / Research', value: 'Science_Research' },
  { label: 'Government / Public Service', value: 'Government_Public_Service' },
  { label: 'Trades / Construction', value: 'Trades_Construction' },
  { label: 'Retail / Hospitality / Service', value: 'Retail_Hospitality_Service' },
  { label: 'Legal', value: 'Legal' },
  { label: 'Non-Profit / NGO', value: 'Non_Profit_NGO' },
  { label: 'Student', value: 'Student_Occupation' },
  { label: 'Homemaker', value: 'Homemaker' },
  { label: 'Retired', value: 'Retired_Occupation' },
  { label: 'Unemployed', value: 'Unemployed' },
  { label: 'Self-Employed / Entrepreneur', value: 'Self_Employed_Entrepreneur' },
  { label: 'Other', value: 'Other_Occupation' },
  { label: 'Prefer not to say', value: 'Prefer_Not_To_Say_Occ' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { label: 'Select Employment Type', value: null },
  { label: 'Full-time', value: 'Full_Time' },
  { label: 'Part-time', value: 'Part_Time' },
  { label: 'Self-employed / Freelancer', value: 'Self_Employed' },
  { label: 'Internship', value: 'Internship' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Student', value: 'Student_Employed' },
  { label: 'Not employed', value: 'Not_Employed' },
  { label: 'Retired', value: 'Retired_Employed' },
  { label: 'Prefer not to say', value: 'Prefer_Not_To_Say_Emp' },
];

const ANNUAL_INCOME_OPTIONS = [
  { label: 'Select Annual Income', value: null },
  { label: 'Below $30,000', value: 'Below_30k' },
  { label: '$30,000 - $49,999', value: '30k_50k' },
  { label: '$50,000 - $74,999', value: '50k_75k' },
  { label: '$75,000 - $99,999', value: '75k_100k' },
  { label: '$100,000 - $149,999', value: '100k_150k' },
  { label: '$150,000 - $199,999', value: '150k_200k' },
  { label: '$200,000 - $299,999', value: '200k_300k' },
  { label: '$300,000 or more', value: 'Above_300k' },
  { label: 'Prefer not to say', value: 'Prefer_Not_To_Say_Inc' },
];


interface OccupationInfoUpdatePayload {
  education?: string | null;
  highestDegree?: string | null;
  occupation?: string | null;
  employedIn?: string | null; // Employment Type/Sector
  companyName?: string;
  jobTitle?: string;
  annualIncome?: string | null;
}


const OccupationInfoScreen = () => {
  const router = useRouter();
  const [introModalVisible, setIntroModalVisible] = useState(false); // Optional
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for Pickers
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null);
  const [showEducationPicker, setShowEducationPicker] = useState(false);

  const [selectedHighestDegree, setSelectedHighestDegree] = useState<string | null>(null);
  const [showHighestDegreePicker, setShowHighestDegreePicker] = useState(false);

  const [selectedOccupation, setSelectedOccupation] = useState<string | null>(null);
  const [showOccupationPicker, setShowOccupationPicker] = useState(false);

  const [selectedEmployedIn, setSelectedEmployedIn] = useState<string | null>(null);
  const [showEmployedInPicker, setShowEmployedInPicker] = useState(false);
  
  const [selectedAnnualIncome, setSelectedAnnualIncome] = useState<string | null>(null);
  const [showAnnualIncomePicker, setShowAnnualIncomePicker] = useState(false);

  // State for TextInputs
  const [companyName, setCompanyName] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');


  useEffect(() => {
    // Optionally show an intro modal or load existing data
    // setIntroModalVisible(true);
    // const loadData = async () => { /* API call */ }; loadData();
  }, []);

  const handleCloseIntroModal = (action: 'skip' | 'continue') => {
    setIntroModalVisible(false);
    if (action === 'skip') {
      router.push('/(tab)'); // Or next step
    }
  };

  const handleSubmitOccupationInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false); return;
      }

      const payload: OccupationInfoUpdatePayload = {
        education: selectedEducation,
        highestDegree: selectedHighestDegree,
        occupation: selectedOccupation,
        employedIn: selectedEmployedIn,
        companyName: companyName.trim() || undefined, // Send undefined if empty
        jobTitle: jobTitle.trim() || undefined, // Send undefined if empty
        annualIncome: selectedAnnualIncome,
      };
      
      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      );

      console.log('Submitting Occupation Info:', cleanedPayload);
      await profileService.updateOccupationInfo(cleanedPayload); 
      
      console.log('Occupation info update successful. Navigating.');
      // Navigate to the final onboarding step or main app area
      router.push('/(tab)'); // Example: End of this onboarding flow

    } catch (err: any) {
      console.error('Error submitting occupation info:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update occupation information. Please try again.';
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
          <Text style={styles.mainQuestion}>Education & Occupation</Text>
          <Text style={styles.subHeader}>Share a bit about your professional life. (All fields are optional)</Text>

          {/* Education Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Education Level</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowEducationPicker(true);}}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedEducation && styles.pickerPlaceholder]}>
                {EDUCATION_LEVEL_OPTIONS.find(opt => opt.value === selectedEducation)?.label || EDUCATION_LEVEL_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Highest Degree */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Highest Degree Attained</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowHighestDegreePicker(true);}}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedHighestDegree && styles.pickerPlaceholder]}>
                {HIGHEST_DEGREE_OPTIONS.find(opt => opt.value === selectedHighestDegree)?.label || HIGHEST_DEGREE_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Occupation Sector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Occupation Sector/Field</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowOccupationPicker(true);}}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedOccupation && styles.pickerPlaceholder]}>
                {OCCUPATION_SECTOR_OPTIONS.find(opt => opt.value === selectedOccupation)?.label || OCCUPATION_SECTOR_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>

           {/* Employment Type */}
           <View style={styles.inputGroup}>
            <Text style={styles.label}>Employment Type</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowEmployedInPicker(true);}}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedEmployedIn && styles.pickerPlaceholder]}>
                {EMPLOYMENT_TYPE_OPTIONS.find(opt => opt.value === selectedEmployedIn)?.label || EMPLOYMENT_TYPE_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Company Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Acme Corp, Self-Employed"
              value={companyName}
              onChangeText={setCompanyName}
              editable={!isLoading}
              autoCapitalize="words"
            />
          </View>

          {/* Job Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Software Engineer, Artist"
              value={jobTitle}
              onChangeText={setJobTitle}
              editable={!isLoading}
              autoCapitalize="words"
            />
          </View>

          {/* Annual Income */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Annual Income</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowAnnualIncomePicker(true);}}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedAnnualIncome && styles.pickerPlaceholder]}>
                {ANNUAL_INCOME_OPTIONS.find(opt => opt.value === selectedAnnualIncome)?.label || ANNUAL_INCOME_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmitOccupationInfo}
              disabled={isLoading} 
          >
              {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                  <Text style={styles.buttonText}>Save & Continue</Text>
              )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderPickerModal(showEducationPicker, 'Select Education Level', EDUCATION_LEVEL_OPTIONS, (v) => {setSelectedEducation(v); setShowEducationPicker(false);}, () => setShowEducationPicker(false))}
      {renderPickerModal(showHighestDegreePicker, 'Select Highest Degree', HIGHEST_DEGREE_OPTIONS, (v) => {setSelectedHighestDegree(v); setShowHighestDegreePicker(false);}, () => setShowHighestDegreePicker(false))}
      {renderPickerModal(showOccupationPicker, 'Select Occupation Sector', OCCUPATION_SECTOR_OPTIONS, (v) => {setSelectedOccupation(v); setShowOccupationPicker(false);}, () => setShowOccupationPicker(false))}
      {renderPickerModal(showEmployedInPicker, 'Select Employment Type', EMPLOYMENT_TYPE_OPTIONS, (v) => {setSelectedEmployedIn(v); setShowEmployedInPicker(false);}, () => setShowEmployedInPicker(false))}
      {renderPickerModal(showAnnualIncomePicker, 'Select Annual Income', ANNUAL_INCOME_OPTIONS, (v) => {setSelectedAnnualIncome(v); setShowAnnualIncomePicker(false);}, () => setShowAnnualIncomePicker(false))}
    </View>
  );
};

export const config = {
  headerShown: false,
};

export default OccupationInfoScreen;

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
  // Modal styles
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
    maxWidth: 380, // Can be a bit wider for longer option labels
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
});