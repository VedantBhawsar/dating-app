import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question31 = () => {
  const router = useRouter();

  const handleSelect = (importance: string) => {
    console.log(importance);
    router.push('/onboarding/values&futureplans/Question32'); // Navigate to next question
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>How important is religion/spirituality in your life? </Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Very')}
      >
        <Text style={styles.buttonText}>Very</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Somewhat')}
      >
        <Text style={styles.buttonText}>Somewhat</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleSelect('Not at all')}
      >
        <Text style={styles.buttonText}>Not at all</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question31;

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
