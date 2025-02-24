import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question10 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>How involved are your parents in your partner selection?</Text>
      <View style={styles.optionsContainer}>
        {['Not at all', 'Somewhat', 'Very involved'].map((option) => (
          <TouchableOpacity 
            key={option}
            style={styles.button} 
            onPress={() => router.push('/onboarding/salary&occupation/Question11')}>
            <Text style={styles.buttonText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Question10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold', // Uniform style with previous questions
    color: '#000',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF6F00',
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
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
});