import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";

const RootLayout = () => {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    router.replace("/"); // Ensure correct case-sensitive route
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tab)" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="onboarding/basic/intro" />
      {/* Add all onboarding screens here */}
    </Stack>
  );
};

export default RootLayout;
