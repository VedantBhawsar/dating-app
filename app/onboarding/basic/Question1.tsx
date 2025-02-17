import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question1 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="What's your full name?" 
        style={styles.input} 
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/profile-setup/basic/Question2')}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Dark theme background
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#1E1E1E', 
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF4D67', // Tinder-like button color
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

