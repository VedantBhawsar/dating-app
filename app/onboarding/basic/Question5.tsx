import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question5 = () => {
  const router = useRouter();

  const handleOptionSelect = (option: string) => {
    console.log(`Selected: ${option}`);
    router.push('/onboarding/caste&community/Question6');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>Are you open to long-distance relationships?</Text>
      {['Yes', 'No'].map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.optionButton}
          onPress={() => handleOptionSelect(option)}
        >
          <Text style={styles.buttonText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const config = { headerShown: false };
export default Question5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  optionButton: {
    backgroundColor: '#FF6F00',
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
