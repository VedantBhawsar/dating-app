import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Attempt to hide the splash screen once the JS has loaded
    // and this component is mounted.
    SplashScreen.hideAsync();
  }, []); // Empty dependency array means this runs once on mount

  // Render the Slot. Expo Router will render the initial route (app/index.tsx) here.
  return <Slot />;
}