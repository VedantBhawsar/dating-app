import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question33 = () => {
  const router = useRouter();

  const handleSelect = (livingPlace: string) => {
    console.log(livingPlace);
    router.push('/onboarding/values&futureplans/Question34'); // Navigate to next question
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>Where do you see yourself living in the future? </Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('City')}
      >
        <Text style={styles.buttonText}>City</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Village')}
      >
        <Text style={styles.buttonText}>Village</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Abroad')}
      >
        <Text style={styles.buttonText}>Abroad</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Flexible')}
      >
        <Text style={styles.buttonText}>Flexible</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question33;

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
