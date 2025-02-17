import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question30 = () => {
  const router = useRouter();

  const handleSelect = (dateType: string) => {
    console.log(dateType);
    router.push('/onboarding/values&futureplans/Question31'); // Navigate to next question
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>What is your ideal date?</Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Dinner')}
      >
        <Text style={styles.buttonText}>Dinner</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Adventure')}
      >
        <Text style={styles.buttonText}>Adventure</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Movie Night')}
      >
        <Text style={styles.buttonText}>Movie Night</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Stay-in')}
      >
        <Text style={styles.buttonText}>Stay-in</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question30;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White background
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
