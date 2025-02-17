// Question3.tsx
import { View, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
const Question3 = () => {
  const router = useRouter();
  return (
    <View>
      <TextInput placeholder="What’s your ideal partner like?" />
      <Button title="Next" onPress={() => router.push('/profile-setup/basic/Question4')} />
    </View>
  );
};
export default Question3;