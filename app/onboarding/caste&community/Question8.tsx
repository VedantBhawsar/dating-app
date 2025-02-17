import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question8 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>Are you open to intercaste marriage?</Text>
      <View style={styles.optionsContainer}>
        {['Yes', 'No', 'Maybe'].map((option) => (
          <TouchableOpacity 
            key={option}
            style={styles.button} 
            onPress={() => router.push('/onboarding/caste&community/Question9')}>
            <Text style={styles.buttonText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Question8;

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
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold'
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
    color: '#fff',
    fontWeight: 'bold',
  },
});
