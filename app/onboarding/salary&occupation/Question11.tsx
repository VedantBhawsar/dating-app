// Question1.tsx
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question11 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What is your occupation?</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter your occupation" 
        placeholderTextColor="#aaa" 
      />
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/onboarding/salary&occupation/Question12')}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question11;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White background
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#f5f5f5', // Lighter grey for input field
    color: '#000', // Black text for input
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc', // Lighter border
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF4D67', // Same button color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
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
