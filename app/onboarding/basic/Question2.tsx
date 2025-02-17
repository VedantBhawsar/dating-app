import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question2 = () => {
  const router = useRouter();

  const handleOptionSelect = (relationshipGoal) => {
    console.log(`Selected relationship goal: ${relationshipGoal}`);
    // You can store the selected option in state or pass it to the next screen
    router.push('/onboarding/basic/Question3');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What is your relationship goal? </Text>
      
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('Casual dating')}
      >
        <Text style={styles.buttonText}>Casual dating</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('Long-term relationship')}
      >
        <Text style={styles.buttonText}>Long-term relationship</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('Marriage')}
      >
        <Text style={styles.buttonText}>Marriage</Text>
      </TouchableOpacity>
    </View>
  );
};

// Disable the header for this screen
Question2.options = {
  headerShown: false,  // This will remove the top header
};

export default Question2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White background for consistency
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  optionButton: {
    backgroundColor: '#FF4D67', // Button color (similar to Question1)
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
