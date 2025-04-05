import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageProps {
  text: string;
  timestamp: string;
  isSender: boolean;
  isRead: boolean;
}

export default function Message({ text, timestamp, isSender, isRead }: MessageProps) {
  return (
    <View style={[styles.container, isSender ? styles.senderContainer : styles.receiverContainer]}>
      <View style={[styles.bubble, isSender ? styles.senderBubble : styles.receiverBubble]}>
        <Text style={[styles.text, isSender ? styles.senderText : styles.receiverText]}>
          {text}
        </Text>
        <View style={styles.timeContainer}>
          <Text style={[styles.timestamp, isSender ? styles.senderTimestamp : styles.receiverTimestamp]}>
            {timestamp}
          </Text>
          {isSender && (
            <Text style={styles.readStatus}>
              {isRead ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  senderContainer: {
    alignItems: 'flex-end',
  },
  receiverContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  senderBubble: {
    backgroundColor: '#FF6F00',
  },
  receiverBubble: {
    backgroundColor: '#F0F0F0',
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
  senderText: {
    color: '#FFFFFF',
  },
  receiverText: {
    color: '#000000',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
  },
  senderTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receiverTimestamp: {
    color: '#666666',
  },
  readStatus: {
    fontSize: 12,
    marginLeft: 4,
    color: 'rgba(255, 255, 255, 0.7)',
  },
}); 