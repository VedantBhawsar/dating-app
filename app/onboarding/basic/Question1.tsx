import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question1 = () => {
  const router = useRouter();

  const handleOptionSelect = (ageGroup) => {
    console.log(`Selected age group: ${ageGroup}`);
    // You can store the selected option in state or pass it to the next screen
    router.push('/onboarding/basic/Question2');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What is your age group? </Text>
      
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('18-24')}
      >
        <Text style={styles.buttonText}>18-24</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('25-30')}
      >
        <Text style={styles.buttonText}>25-30</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('31-40')}
      >
        <Text style={styles.buttonText}>31-40</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('41-50')}
      >
        <Text style={styles.buttonText}>41-50</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => handleOptionSelect('50+')}
      >
        <Text style={styles.buttonText}>50+</Text>
      </TouchableOpacity>
    </View>
  );
};

// Setting headerShown: false for Expo Router
Question1.options = {
  headerShown: false,  // This will remove the top header
};

export default Question1;

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
    backgroundColor: '#FF4D67', // Button color
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
