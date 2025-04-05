import { Stack } from "expo-router";
import React from "react";

export default function ChatModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        presentation: 'modal',
        animation: 'slide_from_bottom',
        headerStyle: {
          backgroundColor: '#fff',
        },
        contentStyle: {
          backgroundColor: '#fff',
        },
        tabBarStyle: {
          display: 'none'
        }
      }}
    />
  );
} 