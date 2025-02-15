// Question37.tsx
import { View, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
const Question37 = () => {
  const router = useRouter();
  return (
    <View>
      <TextInput placeholder="What are you looking for in this app?" />
      <Button title="Submit" onPress={() => router.push('/(tab)')} />
    </View>
  );
};
export default Question37;