import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

const UploadDocuments = () => {
  const router = useRouter();
  const [salaryImage, setSalaryImage] = useState(null);
  const [aadharImage, setAadharImage] = useState(null);

  const pickImage = async (setImage) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (salaryImage && aadharImage) {
      console.log('Salary Image:', salaryImage);
      console.log('Aadhar Image:', aadharImage);
      router.push('/onboarding/values&futureplans/Question37');
    } else {
      alert('Please upload both documents!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>Upload Salary Slip and Aadhaar Card</Text>
      
      <View style={styles.uploadRow}>
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(setSalaryImage)}>
            {salaryImage ? <Image source={{ uri: salaryImage }} style={styles.image} /> : <AntDesign name="plus" size={40} color="#666" />}
          </TouchableOpacity>
          {salaryImage && (
            <TouchableOpacity style={styles.removeButton} onPress={() => setSalaryImage(null)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(setAadharImage)}>
            {aadharImage ? <Image source={{ uri: aadharImage }} style={styles.image} /> : <AntDesign name="plus" size={40} color="#666" />}
          </TouchableOpacity>
          {aadharImage && (
            <TouchableOpacity style={styles.removeButton} onPress={() => setAadharImage(null)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UploadDocuments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  uploadContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadBox: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  uploadText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeButton: {
    marginTop: 5,
    backgroundColor: '#FF4D67',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  removeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
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
});
