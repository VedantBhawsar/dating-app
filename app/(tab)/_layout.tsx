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
      tabBarActiveTintColor: '#FF6F00',
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
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="heart-o" color={color} />, 
        }} 
      />
      <Tabs.Screen 
        name="chats" 
        options={{
          title: "Message",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="comment-o" color={color} />, 
        }} 
      />
      <Tabs.Screen 
        name="profile/index" 
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="user-circle-o" color={color} />, 
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
    shadowOpacity: 0.05,  
    shadowRadius: 3,  
    elevation: 6,  
    height: 70,  
    paddingBottom: 10,  
    paddingTop: 8,  
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TabRoot;
