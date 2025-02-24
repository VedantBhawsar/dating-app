// Question4.tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question25 = () => {
  const router = useRouter();

  const handleSelect = (time: string) => {
    // Handle the selected time preference if needed
    console.log(time);
    router.push('/onboarding/relationshippreferences/Question26'); // Navigate to the next question
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>Are you a morning person or a night owl?</Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Morning Person')}
      >
        <Text style={styles.buttonText}>Morning Person</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Night Owl')}
      >
        <Text style={styles.buttonText}>Night Owl</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question25;

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
