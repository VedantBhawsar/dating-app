// Question4.tsx
import { View, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
const Question4 = () => {
  const router = useRouter();
  return (
    <View>
      <TextInput placeholder="What are your hobbies?" />
      <Button title="Next" onPress={() => router.push('/profile-setup/basic/Question5')} />
    </View>
  );
};
export default Question4;