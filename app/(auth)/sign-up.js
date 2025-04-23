import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

// Placeholder for Sign Up Screen
export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Optional: Collect user's name
  const { signup, isLoading } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    await signup(email, password, name);
  };

  return (
    <SafeAreaView className="flex-1 justify-center p-5">
      <Text className="text-2xl font-bold mb-5 text-center">Sign Up</Text>
      <TextInput
        className="h-10 border border-gray-300 mb-3 px-2.5 rounded bg-white"
        placeholder="Name (Optional)"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
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
          <Button title="Sign Up" onPress={handleSignUp} />
        </View>
      )}
      <Link href="/login" className="mt-4 text-center text-blue-600">
        Already have an account? Login
      </Link>
    </SafeAreaView>
  );
}
