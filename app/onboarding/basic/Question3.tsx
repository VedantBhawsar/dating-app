import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question3 = () => {
  const router = useRouter();

  const handleOptionSelect = (option: string) => {
    console.log(`Selected: ${option}`);
    // You can store the selected option in state or pass it to the next screen
    router.push('/onboarding/basic/Question4');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What is your preferred partner’s gender? </Text>
      
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('Male')}
      >
        <Text style={styles.buttonText}>Male</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('Female')}
      >
        <Text style={styles.buttonText}>Female</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('Any')}
      >
        <Text style={styles.buttonText}>Any</Text>
      </TouchableOpacity>
    </View>
  );
};

// Disable the header for this screen
export const config = {
  headerShown: false,  // Disable top header
};

export default Question3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White background for consistency
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  optionButton: {
    backgroundColor: '#FF4D67', // Button color (similar to previous questions)
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    shadowColor: '#FF4D67',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
