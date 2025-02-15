// Question5.tsx
import { View, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
const Question5 = () => {
  const router = useRouter();
  return (
    <View>
      <TextInput placeholder="What's your favorite place to travel?" />
      <Button title="Next" onPress={() => router.push('/profile-setup/caste&community.tsx/Question6')} />
    </View>
  );
};
export default Question5;
