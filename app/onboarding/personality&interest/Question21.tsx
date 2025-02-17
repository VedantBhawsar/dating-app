// Question1.tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question21 = () => {
  const router = useRouter();

  const handleSelect = (rating: string) => {
    // Handle the selected rating if needed
    console.log(rating);
    router.push('/onboarding/personality&interest/Question22'); // Navigate to the next question
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>How introverted or extroverted are you? (Scale of 1-5)</Text>

      {['1', '2', '3', '4', '5'].map((rating, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.button} 
          onPress={() => handleSelect(rating)}
        >
          <Text style={styles.buttonText}>{rating}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Question21;

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
