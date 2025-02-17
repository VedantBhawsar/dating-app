// Question1.tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question27 = () => {
  const router = useRouter();

  const handleSelect = (space: string) => {
    // Handle the selected personal space preference
    console.log(space);
    router.push('/onboarding/relationshippreferences/Question28'); // Navigate to the next question
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>How much personal space do you need in a relationship? </Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('A lot')}
      >
        <Text style={styles.buttonText}>A lot</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Moderate')}
      >
        <Text style={styles.buttonText}>Moderate</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Very little')}
      >
        <Text style={styles.buttonText}>Very little</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question27;

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
    backgroundColor: '#FF4D67', // Tinder-like button color
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
