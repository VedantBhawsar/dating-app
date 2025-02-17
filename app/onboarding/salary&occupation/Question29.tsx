// Question2.tsx
import { View, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
const Question2 = () => {
  const router = useRouter();
  return (
    <View>
      <TextInput placeholder="What are your interests?" />
      <Button title="Next" onPress={() => router.push('/profile-setup/basic/Question3')} />
    </View>
  );
};
export default Question2;
