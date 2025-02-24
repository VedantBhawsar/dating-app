// Question4.tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question26 = () => {
  const router = useRouter();

  const handleSelect = (personality: string) => {
    // Handle the selected personality type if needed
    console.log(personality);
    router.push('/onboarding/relationshippreferences/Question27'); // Navigate to the next question
  };

  const personalities = ['Funny', 'Intelligent', 'Kind', 'Ambitious', 'Confident', 'Creative']; // Example personality types

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>What is your ideal partner’s personality type? </Text>

      {personalities.map((personality, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.button} 
          onPress={() => handleSelect(personality)}
        >
          <Text style={styles.buttonText}>{personality}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Question26;

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
