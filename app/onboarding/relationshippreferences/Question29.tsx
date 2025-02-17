// Question2.tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question29 = () => {
  const router = useRouter();

  const handleSelect = (loveLanguage: string) => {
    // Handle the selected love language
    console.log(loveLanguage);
    router.push('/onboarding/relationshippreferences/Question30'); // Navigate to the next question
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>What is your love language? </Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Words of Affirmation')}
      >
        <Text style={styles.buttonText}>Words of Affirmation</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Acts of Service')}
      >
        <Text style={styles.buttonText}>Acts of Service</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Gifts')}
      >
        <Text style={styles.buttonText}>Gifts</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Quality Time')}
      >
        <Text style={styles.buttonText}>Quality Time</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Physical Touch')}
      >
        <Text style={styles.buttonText}>Physical Touch</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question29;

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
