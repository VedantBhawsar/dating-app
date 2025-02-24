// Question1.tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question28 = () => {
  const router = useRouter();

  const handleSelect = (response: string) => {
    // Handle the selected conflict resolution preference
    console.log(response);
    router.push('/onboarding/relationshippreferences/Question29'); // Navigate to the next question
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>How do you handle conflict in a relationship? </Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Talk immediately')}
      >
        <Text style={styles.buttonText}>Talk immediately</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Take time to process')}
      >
        <Text style={styles.buttonText}>Take time to process</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Avoid')}
      >
        <Text style={styles.buttonText}>Avoid</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question28;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Dark theme background
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF6F00', // Tinder-like button color
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
