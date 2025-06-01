import { Stack } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="basic/intro" />
      <Stack.Screen name="basic" />
      <Stack.Screen name="caste&community" />
      <Stack.Screen name="salary&occupation" />
      <Stack.Screen name="lifestyle&habits" />
      <Stack.Screen name="personality&interest" />
      <Stack.Screen name="relationshippreferences" />
      <Stack.Screen name="values&futureplans" />
      <Stack.Screen name="verification" />
    </Stack>
  );
}
