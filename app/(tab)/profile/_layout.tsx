import { Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        tabBarIcon: ({ color }) => (
          <FontAwesome 
            size={24} 
            name="user-circle" 
            color={color} 
          />
        ),
      }}
    />
  );
} 