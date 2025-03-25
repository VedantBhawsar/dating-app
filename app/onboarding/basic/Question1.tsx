import { View, TouchableOpacity, Text, StyleSheet, Modal, StatusBar } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const Question1 = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setModalVisible(true); // Show modal on mount
  }, []);

  const handleClose = (action) => {
    setModalVisible(false);
    if (action === "skip") {
      router.push('/');
    }
  };

  const handleOptionSelect = (ageGroup) => {
    console.log(`Selected age group: ${ageGroup}`);
    router.push('/onboarding/basic/Question2');
  };

  return (
    <View style={styles.container}>
      {/* Blur the entire screen including the notification bar */}
      <StatusBar barStyle="light-content" />

      {/* Blurred Background Modal */}
      {modalVisible && (
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.fullScreenOverlay}>
            {/* Strong Blur Effect covering the whole screen */}
            <BlurView intensity={80} style={styles.fullScreenBlur} tint="dark">
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Enhance Your Matchmaking!</Text>
                <Text style={styles.modalText}>
                  To find the best match, answer the next 37 questions. It only takes a few minutes!
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                    onPress={() => handleClose("skip")}
                  >
                    <Text style={styles.buttonText}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => handleClose("continue")}
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </Modal>
      )}

      {/* Main Content */}
      <Text style={styles.question}>What is your age group?</Text>
      {['18-24', '25-30', '31-40', '41-50', '50+'].map((ageGroup) => (
        <TouchableOpacity
          key={ageGroup}
          style={styles.optionButton}
          onPress={() => handleOptionSelect(ageGroup)}
        >
          <Text style={styles.buttonText}>{ageGroup}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Setting headerShown: false for Expo Router
Question1.options = {
  headerShown: false,
};

export default Question1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  optionButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    shadowColor: '#FF4D67',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullScreenOverlay: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for contrast
  },
  fullScreenBlur: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slight transparency for depth
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    width: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
