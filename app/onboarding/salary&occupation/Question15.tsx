// Question4.tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question15 = () => {
  const router = useRouter();

  const handleSelect = (incomeRange: string) => {
    // Handle the selected income range if needed
    console.log(incomeRange);
    router.push('/onboarding/lifestyle&habits/Question16'); // Navigate to the next question
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>What is your preferred income range for a partner?</Text>
      
      {['Less than 5 LPA', '5-10 LPA', '10-20 LPA', '20+ LPA', 'Prefer not to say'].map((range, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.button} 
          onPress={() => handleSelect(range)}
        >
          <Text style={styles.buttonText}>{range}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Question15;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White background
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize:20,
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
    marginBottom: 15,
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
