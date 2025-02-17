import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const RootLayout = () => {
  const router = useRouter();
  const auth = getAuth(); 
  useEffect(() => {
    router.replace(""); // Ensure correct case-sensitive route
  }, []);

  return (
    

    <Stack>
      <Stack.Screen name="(tab)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;
