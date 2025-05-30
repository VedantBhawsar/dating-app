import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";

const RootLayout = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login");
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tab)" />
      <Stack.Screen name="auth/login" />
      {/* <Stack.Screen name="auth/register" /> */}
      <Stack.Screen name="onboarding/basic/intro" />
    </Stack>
  );
};

export default RootLayout;