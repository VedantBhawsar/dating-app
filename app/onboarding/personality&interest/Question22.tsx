// Question1.tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question22 = () => {
  const router = useRouter();

  const handleSelect = (hobby: string) => {
    // Handle the selected hobby if needed
    console.log(hobby);
    router.push('/onboarding/personality&interest/Question23'); // Navigate to the next question
  };

  const hobbies = ['Reading', 'Traveling', 'Music', 'Gaming', 'Cooking', 'Sports', 'Photography']; // Example hobbies

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>What is your top 1 hobbie?</Text>

      {hobbies.map((hobby, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.button} 
          onPress={() => handleSelect(hobby)}
        >
          <Text style={styles.buttonText}>{hobby}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Question22;

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
