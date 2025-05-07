import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";

const RootLayout = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        
        if (token) {
          // User is logged in, redirect to main app
          router.replace("/onboarding/basic/intro");
        } else {
          // No token found, redirect to login
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        router.replace("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6F00' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tab)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="onboarding/basic/intro" />
        <Stack.Screen name="onboarding/basic" />
        <Stack.Screen name="onboarding/caste&community" />
        <Stack.Screen name="onboarding/salary&occupation" />
        <Stack.Screen name="onboarding/lifestyle&habits" />
        <Stack.Screen name="onboarding/personality&interest" />
        <Stack.Screen name="onboarding/relationshippreferences" />
        <Stack.Screen name="onboarding/values&futureplans" />
        <Stack.Screen name="onboarding/verification" />
      </Stack>
    </>
  );
};

export default RootLayout;