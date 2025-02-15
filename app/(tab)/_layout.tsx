import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet } from 'react-native';

const TabRoot = () => {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.label,
      tabBarActiveTintColor: '#FF5864',
      tabBarInactiveTintColor: '#A0A0A0',
    }}>
      <Tabs.Screen 
        name="index" 
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="search" color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="matches" 
        options={{
          title: "Matches",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="heart" color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="chats" 
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="comment" color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="user" color={color} />,
        }} 
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    height: 85,
    paddingBottom: 15,
    paddingTop: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TabRoot;
