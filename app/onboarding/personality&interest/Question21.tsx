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
  Keyboard, // Import Keyboard
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService } from '../../../services/api'; // Ensure this path is correct

// Options for Travel Style Picker (remains the same)
const TRAVEL_STYLE_OPTIONS = [
  { label: 'Select Travel Style', value: null },
  { label: 'Luxury', value: 'Luxury' },
  { label: 'Backpacking', value: 'Backpacking' },
  { label: 'Adventure', value: 'Adventure' },
  { label: 'Relaxation', value: 'Relaxation' },
  { label: 'Cultural Immersion', value: 'Cultural_Immersion' },
  { label: 'Road Trips', value: 'Road_Trips' },
  { label: 'Family-Friendly', value: 'Family_Friendly' },
  { label: 'Solo Travel', value: 'Solo_Travel' },
  { label: 'Group Tours', value: 'Group_Tours' },
  { label: 'Eco-tourism', value: 'Eco_tourism' },
  { label: 'Spontaneous', value: 'Spontaneous' },
  { label: 'Planned Itinerary', value: 'Planned_Itinerary' },
  { label: 'Prefer not to say', value: 'Prefer_not_to_say' },
];

interface PersonalityInfoUpdatePayload {
  hobbies?: string[];
  interests?: string[];
  personalityTraits?: string[];
  musicTaste?: string[];
  movieTaste?: string[];
  sportsInterest?: string[];
  travelStyle?: string; // Removed null as it's not accepted by the API
}

// Chip Component
const Chip = ({ label, onDelete }: { label: string; onDelete: () => void }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
    <TouchableOpacity onPress={onDelete} style={styles.chipDelete}>
      <Text style={styles.chipDeleteText}>✕</Text>
    </TouchableOpacity>
  </View>
);

const PersonalityInfoScreen = () => {
  const router = useRouter();
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for chip inputs (arrays of strings)
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [currentHobbyInput, setCurrentHobbyInput] = useState<string>('');

  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterestInput, setCurrentInterestInput] = useState<string>('');

  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [currentPersonalityTraitInput, setCurrentPersonalityTraitInput] = useState<string>('');

  const [musicTaste, setMusicTaste] = useState<string[]>([]);
  const [currentMusicTasteInput, setCurrentMusicTasteInput] = useState<string>('');

  const [movieTaste, setMovieTaste] = useState<string[]>([]);
  const [currentMovieTasteInput, setCurrentMovieTasteInput] = useState<string>('');

  const [sportsInterest, setSportsInterest] = useState<string[]>([]);
  const [currentSportsInterestInput, setCurrentSportsInterestInput] = useState<string>('');

  const [selectedTravelStyle, setSelectedTravelStyle] = useState<string | null>(null);
  const [showTravelStylePicker, setShowTravelStylePicker] = useState(false);

  useEffect(() => {
    // Example: Load existing data
    const loadExistingData = async () => {
      try {
        // Simulate fetching data or replace with actual API call
        // const existingData = await profileService.getPersonalityInfo();
        // if (existingData) {
        //   if (existingData.hobbies) setHobbies(existingData.hobbies);
        //   if (existingData.interests) setInterests(existingData.interests);
        //   if (existingData.personalityTraits) setPersonalityTraits(existingData.personalityTraits);
        //   if (existingData.musicTaste) setMusicTaste(existingData.musicTaste);
        //   if (existingData.movieTaste) setMovieTaste(existingData.movieTaste);
        //   if (existingData.sportsInterest) setSportsInterest(existingData.sportsInterest);
        //   if (existingData.travelStyle) setSelectedTravelStyle(existingData.travelStyle);
        // }
      } catch (fetchError) {
        console.error("Failed to load existing personality info:", fetchError);
      }
    };
    // loadExistingData();
    // setIntroModalVisible(true);
  }, []);

  const handleCloseIntroModal = (action: 'skip' | 'continue') => {
    setIntroModalVisible(false);
    if (action === 'skip') {
      router.push('/(tab)');
    }
  };

  const handleAddItem = (
    currentInput: string,
    setCurrentInput: (input: string) => void,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    const newItem = currentInput.trim();
    if (newItem && !items.includes(newItem) && items.length < 15) { // Limit max chips
      setItems([...items, newItem]);
    } else if (items.length >= 15) {
        Alert.alert("Limit Reached", "You can add up to 15 items.");
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

  const handleSubmitPersonalityInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      const payload: PersonalityInfoUpdatePayload = {
        hobbies: hobbies,
        interests: interests,
        personalityTraits: personalityTraits,
        musicTaste: musicTaste,
        movieTaste: movieTaste,
        sportsInterest: sportsInterest,
        // Only include travelStyle if it's not null
        ...(selectedTravelStyle ? { travelStyle: selectedTravelStyle } : {})
      };
      
      console.log('Submitting Personality Info:', payload);
      await profileService.updatePersonalityInfo(payload); 
      
      console.log('Personality info update successful. Navigating.');
      router.push('/onboarding/relationshippreferences/Question26');

    } catch (err: any) {
      console.error('Error submitting personality info:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update personality information. Please try again.';
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
    setCurrentInput: (input: string) => void
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      {items.length > 0 && (
        <View style={styles.chipContainer}>
          {items.map((item, index) => (
            <Chip
              key={`${label}-${item}-${index}`} // More unique key
              label={item}
              onDelete={() => handleRemoveItem(item, items, setItems)}
            />
          ))}
        </View>
      )}
      <TextInput
        style={styles.input}
        placeholder={items.length >= 15 ? "Max items reached" : (items.length > 0 ? "Add another..." : placeholder)}
        value={currentInput}
        onChangeText={setCurrentInput}
        onSubmitEditing={() => handleAddItem(currentInput, setCurrentInput, items, setItems)}
        editable={!isLoading && items.length < 15}
        autoCapitalize="words" // Or 'none' / 'sentences' as preferred
        blurOnSubmit={false} // Keep keyboard open after submitting an item
        returnKeyType="done" // Or "next" if you want to chain them
      />
      <Text style={styles.inputHint}>Type and press enter/done to add. Max 15 items.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {introModalVisible && (
         <Modal visible={introModalVisible} transparent animationType="fade" onRequestClose={() => handleCloseIntroModal('skip')}>
         <View style={styles.fullScreenOverlayIntro}>
           <BlurView intensity={Platform.OS === 'ios' ? 90 : 60} style={styles.fullScreenBlur} tint="dark">
             <View style={styles.introModalContent}>
               <Text style={styles.introModalTitle}>Share Your Spark!</Text>
               <Text style={styles.introModalText}>
                 Let others know what makes you unique. Your hobbies, interests, and tastes help create deeper connections.
               </Text>
               <View style={styles.introModalButtons}>
                 <TouchableOpacity
                   style={[styles.modalButtonShared, styles.modalSkipButton]}
                   onPress={() => handleCloseIntroModal('skip')}
                 >
                   <Text style={[styles.buttonText, styles.modalSkipButtonText]}>Skip for now</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={styles.modalButtonShared}
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
        onScrollBeginDrag={Keyboard.dismiss} // Dismiss keyboard on scroll
      >
        <View style={styles.contentInnerContainer}>
          <Text style={styles.mainQuestion}>Personality & Interests</Text>

          {renderChipInput("Hobbies", "E.g., Reading, Hiking", hobbies, setHobbies, currentHobbyInput, setCurrentHobbyInput)}
          {renderChipInput("Interests", "E.g., Technology, Art", interests, setInterests, currentInterestInput, setCurrentInterestInput)}
          {renderChipInput("Personality Traits", "E.g., Outgoing, Analytical", personalityTraits, setPersonalityTraits, currentPersonalityTraitInput, setCurrentPersonalityTraitInput)}
          {renderChipInput("Music Taste", "E.g., Rock, Jazz, Pop", musicTaste, setMusicTaste, currentMusicTasteInput, setCurrentMusicTasteInput)}
          {renderChipInput("Movie/TV Show Taste", "E.g., Sci-fi, Comedy", movieTaste, setMovieTaste, currentMovieTasteInput, setCurrentMovieTasteInput)}
          {renderChipInput("Sports Interests", "E.g., Football, Yoga", sportsInterest, setSportsInterest, currentSportsInterestInput, setCurrentSportsInterestInput)}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Travel Style</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => { setError(null); setShowTravelStylePicker(true);}}
              disabled={isLoading}
            >
              <Text style={[styles.pickerTriggerText, !selectedTravelStyle && styles.pickerPlaceholder]}>
                {TRAVEL_STYLE_OPTIONS.find(opt => opt.value === selectedTravelStyle)?.label || TRAVEL_STYLE_OPTIONS[0].label}
              </Text>
            </TouchableOpacity>
          </View>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmitPersonalityInfo}
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

      {renderPickerModal(
        showTravelStylePicker, 
        'Select Your Travel Style', 
        TRAVEL_STYLE_OPTIONS, 
        (value) => { setSelectedTravelStyle(value); setShowTravelStylePicker(false); }, 
        () => setShowTravelStylePicker(false)
      )}
    </View>
  );
};

export const config = {
  headerShown: false,
};

export default PersonalityInfoScreen;

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
    marginBottom: 25,
    color: '#1A2533',
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
    alignSelf: 'flex-start',
    marginBottom: 8, // Increased space for chips or hint
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10, // Space between chips and the input below
    width: '100%',
  },
  chip: {
    flexDirection: 'row',
    backgroundColor: '#E9E9EF', // A slightly different grey for chips
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
    color: '#2C3E50', // Darker text for chip
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
    fontSize: 15, // Slightly larger for easier tap
  },
  inputHint: { // Hint specifically for chip inputs
    fontSize: 12,
    color: '#7F8C8D',
    alignSelf: 'flex-start',
    marginTop: 4, // Small space after the input field
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
  introModalContent: { 
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
  introModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A2533',
    marginBottom: 15,
    textAlign: 'center',
  },
  introModalText: {
    fontSize: 16,
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  introModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 15,
  },
  modalButtonShared: { 
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