import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface MatchFoundModalProps {
  visible: boolean;
  onClose: () => void;
  matchedUser: {
    name: string;
    image: string;
  };
  chatRoomId?: string;
}

const MatchFoundModal = ({ visible, onClose, matchedUser, chatRoomId }: MatchFoundModalProps) => {
  const router = useRouter();

  const handleStartChat = () => {
    onClose();
    if (chatRoomId) {
      router.push(`/chat/${chatRoomId}`);
    }
  };

  const handleKeepSwiping = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.matchTitle}>It's a Match!</Text>
          <Text style={styles.matchSubtitle}>You and {matchedUser.name} have liked each other</Text>
          
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: matchedUser.image }} style={styles.profileImage} />
            <View style={styles.heartContainer}>
              <Ionicons name="heart" size={40} color="#FF6F00" />
            </View>
            <Image 
              source={{ uri: 'https://via.placeholder.com/150?text=You' }} // Replace with current user's image
              style={styles.profileImage} 
            />
          </View>
          
          <View style={styles.buttonContainer}>
            {chatRoomId && (
              <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
                <Ionicons name="chatbubble-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Start Chatting</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.swipeButton} onPress={handleKeepSwiping}>
              <Ionicons name="search-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6F00',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginTop: 15,
    marginBottom: 5,
  },
  matchSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FF6F00',
  },
  heartContainer: {
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  chatButton: {
    backgroundColor: '#6A0DAD',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  swipeButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MatchFoundModal;
