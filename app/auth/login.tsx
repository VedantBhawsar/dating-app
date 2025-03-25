import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from 'react-native';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,} from 'firebase/auth'

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const auth = getAuth()

  const handleLogin = async () => {
    // const isAuthenticated = email === "test@example.com" && password === "password";
    if(email && password.length > 6) {
      await createUserWithEmailAndPassword(auth, email, password ) ; 

      if (auth.currentUser) {
        router.push("/onboarding/basic/intro");
      } else {
        alert("Invalid email or password");
      }
    };
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FF6F00" barStyle="light-content" />
      <View style={styles.content}>
        <Image
          source={{ uri: "" }}
          style={styles.logo}
        />
        <Text style={styles.title}>CONNECT</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ddd"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <TouchableOpacity style={styles.googleButton} onPress={handleLogin}>
          <AntDesign name="google" size={24} color="white" style={styles.icon} />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push("/auth/register")}
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
    backgroundColor: "#FF6F00",
  },
  content: {
    alignItems: "center",
    width: "90%",
  },
  logo: {
    width: 150,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "white",
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#FF1647",
    fontSize: 16,
    fontWeight: "bold",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 15,
  },
  googleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  orText: {
    color: "white",
    fontSize: 16,
    marginBottom: 15,
    fontWeight: "bold",
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
  icon: {
    marginRight: 10,
  }
});

export default LoginScreen;