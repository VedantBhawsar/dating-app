import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question37 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>
      These questions are designed solely for accurate matching.
      </Text>

      <TextInput 
        placeholder="What are you looking for in this app?" 
        style={styles.input} 
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/(tab)')} 
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Question37;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Dark theme background
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
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
    backgroundColor: '#FF6F00', // Tinder-like button color
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
