import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question7 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>How important is caste compatibility for you in a partner?</Text>
      <View style={styles.optionsContainer}>
        {['Very Important', 'Somewhat Important', 'Not Important'].map((option) => (
          <TouchableOpacity 
            key={option}
            style={styles.button} 
            onPress={() => router.push('/onboarding/caste&community/Question8')}>
            <Text style={styles.buttonText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Question7;

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
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
