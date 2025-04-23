import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

// Placeholder for Login Screen
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, testAppwriteConnection } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    await login(email, password);
  };

  const handleTestConnection = async () => {
    Alert.alert("Testing Connection...", "Please wait.");
    const result = await testAppwriteConnection();
    Alert.alert(
      result.success ? "Connection Test Successful" : "Connection Test Failed",
      result.message
    );
  };

  return (
    <SafeAreaView className="flex-1 justify-center p-5">
      <Text className="text-2xl font-bold mb-5 text-center">Login</Text>
      <TextInput
        className="h-10 border border-gray-300 mb-3 px-2.5 rounded bg-white"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="h-10 border border-gray-300 mb-3 px-2.5 rounded bg-white"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-2.5" />
      ) : (
        <View className="mb-2">
          <Button title="Login" onPress={handleLogin} />
        </View>
      )}
      <View className="mb-3">
        <Button
          title="Test Appwrite Connection"
          onPress={handleTestConnection}
          color="#841584"
        />
      </View>
      <Link href="/sign-up" className="mt-4 text-center text-blue-600">
        Don't have an account? Sign Up
      </Link>
    </SafeAreaView>
  );
}
