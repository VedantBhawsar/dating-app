// Question3.tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Question24 = () => {
  const router = useRouter();

  const handleSelect = (genre: string) => {
    // Handle the selected genre if needed
    console.log(genre);
    router.push('/onboarding/personality&interest/Question25'); // Navigate to the next question
  };

  const genres = ['Action', 'Romance', 'Sci-Fi', 'Comedy', 'Drama', 'Horror']; // Example movie/show genres

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>What kind of movies or shows do you enjoy? </Text>

      {genres.map((genre, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.button} 
          onPress={() => handleSelect(genre)}
        >
          <Text style={styles.buttonText}>{genre}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Question24;

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
