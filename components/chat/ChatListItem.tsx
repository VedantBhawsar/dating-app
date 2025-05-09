import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';

interface ChatListItemProps {
  id: string;
  name: string;
  message: string;
  image: string;
  time?: string;
  unreadCount?: number;
  onPress?: () => void;
}

export default function ChatListItem({ id, name, message, image, time, unreadCount, onPress }: ChatListItemProps) {
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(modals)/chat/${id}`);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
    >
      <Image source={{ uri: image }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {time && <Text style={styles.time}>{time}</Text>}
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.message} numberOfLines={1}>
            {message}
          </Text>
          {unreadCount ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 