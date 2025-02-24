import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question36 = () => {
  const router = useRouter();

  const handleSelect = (response: string) => {
    console.log(response);
    router.push('/onboarding/values&futureplans/Question37'); // Navigate to the next question
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>How important is financial stability in a partner? </Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Very Important')}
      >
        <Text style={styles.buttonText}>Very Important</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Somewhat Important')}
      >
        <Text style={styles.buttonText}>Somewhat Important</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Not Important')}
      >
        <Text style={styles.buttonText}>Not Important</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question36;

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
