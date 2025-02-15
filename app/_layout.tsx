import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";

const RootLayout = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile-setup/basic/Question1"); // Ensure correct case-sensitive route
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tab)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/loginScreen" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;
