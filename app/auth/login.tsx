import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Linking, ActivityIndicator, Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from 'react-native';
import { authService } from "../../services/api";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await authService.login({
        email,
        password
      });

      console.log("Login successful", response);
      
      // Check if we received tokens
      if (response.accessToken && response.refreshToken) {
        // Navigate to the main app after successful login
        router.replace("/onboarding/basic/intro");
      } else {
        // If we don't have tokens, show an error
        setError("Login successful but no authentication tokens received");
        Alert.alert("Login Issue", "Authentication problem. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Login failed. Please check your credentials.");
      Alert.alert("Login Failed", err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch("https://f143-223-185-38-78.ngrok-free.app/api/auth/google");
      const data = await response.json();
      
      if (data && data.url) {
        Linking.openURL(data.url);
      } else {
        console.log("No URL received from backend");
        Alert.alert("Error", "Failed to initiate Google login");
      }
    } catch (error: any) {
      console.log(error.message);
      Alert.alert("Error", "Failed to connect to Google login service");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FF6F00" barStyle="light-content" />
      <View style={styles.content}>
        <Image
          source={{ uri: "" }}
          style={styles.logo}
        />
        <Text style={styles.title}>CONNECT</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ddd"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        /> 

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FF1647" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text> 

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
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
  },
  errorText: {
    color: "#ffcccc",
    marginBottom: 15,
    textAlign: "center",
  }
});

export default LoginScreen;
