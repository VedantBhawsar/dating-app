import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Keyboard } from 'react-native';
import { authService } from '@/services/api';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);


  useEffect(()=> {
    authService.getUserByToken().catch((error)=> {
      console.error(error)

      router.push("/auth/login")
    })

  }, [])

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: [
        styles.tabBar,
        { display: keyboardVisible ? 'none' : 'flex' }
      ],
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
        name="chat" 
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="comment-o" color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="user-circle-o" color={color} />,
        }} 
      />
    </Tabs>
  );
}

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
