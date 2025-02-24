import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question6 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What is your caste/community?</Text>
      <TextInput 
        placeholder="Enter your caste/community" 
        style={styles.input} 
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/onboarding/caste&community/Question7')}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question6;

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
  input: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    color: '#000',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF6F00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
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
