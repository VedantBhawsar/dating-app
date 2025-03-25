import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

const Question1 = () => {
  const router = useRouter();

  useEffect(() => {
    Alert.alert(
      "Enhance Your Matchmaking!",
      "To find the best match, answer the next 37 questions. It only takes a few minutes!",
      [
        { text: "Skip", onPress: () => router.push('/'), style: "cancel" },
        { text: "Continue", style: "default" }
      ]
    );
  }, []);

  const handleOptionSelect = (ageGroup) => {
    console.log(`Selected age group: ${ageGroup}`);
    router.push('/onboarding/basic/Question2');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What is your age group?</Text>
      
      {['18-24', '25-30', '31-40', '41-50', '50+'].map((ageGroup) => (
        <TouchableOpacity
          key={ageGroup}
          style={styles.optionButton}
          onPress={() => handleOptionSelect(ageGroup)}
        >
          <Text style={styles.buttonText}>{ageGroup}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Setting headerShown: false for Expo Router
Question1.options = {
  headerShown: false,
};

export default Question1;

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
    marginBottom: 30,
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
  }
});
