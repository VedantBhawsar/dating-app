import { Slot, SplashScreen } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      
      if (token) {
        setInitialRoute("/(tab)");
      } else {
        setInitialRoute("/auth/login");
      }
    } catch (error) {
      console.error("Error loading resources:", error);
      setInitialRoute("/auth/login"); 
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    if (isReady && initialRoute) {
      SplashScreen.hideAsync();
    }
  }, [isReady, initialRoute]);

  if (!isReady || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6F00' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return <Slot />;
}