import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from 'react-native';

const LoginScreen = () => {
  const router = useRouter();

  // Simulated Login Function (Replace this with Firebase/Auth logic)
  const handleLogin = async () => {
    // Simulating authentication success
    const isAuthenticated = true; // Replace this with actual auth logic
    if (isAuthenticated) {
      router.push("/profile-setup/basic/Question1"); // Redirect to first question
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FF1647" barStyle="dark-content" />
      <View style={styles.content}>
        <Image
          source={{ uri: "https://i.redd.it/pdo2hmsefl881.jpg" }}
          style={styles.logo}
        />
        <Text style={styles.title}>CONNECT</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <AntDesign name="google" size={24} color="white" />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <FontAwesome name="facebook" size={24} color="white" />
          <Text style={styles.buttonText}>Sign in with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <AntDesign name="mobile1" size={24} color="white" />
          <Text style={styles.buttonText}>Sign in with Phone</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push("/auth/registerScreen")}
        >
          <Text style={styles.registerText}>New User? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF1647",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  registerButton: {
    marginTop: 20,
  },
  registerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
