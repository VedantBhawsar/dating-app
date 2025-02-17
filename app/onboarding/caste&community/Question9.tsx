import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question9 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>Do you prefer someone from the same religious background?</Text>
      <View style={styles.optionsContainer}>
        {['Yes', 'No', 'Open to All'].map((option) => (
          <TouchableOpacity 
            key={option}
            style={styles.button} 
            onPress={() => router.push('/onboarding/caste&community/Question10')}>
            <Text style={styles.buttonText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Question9;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 20, // Increased font size for better visibility
    fontWeight: 'bold', // Slightly bolder for emphasis
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF4D67',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#FF4D67',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});