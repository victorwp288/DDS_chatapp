import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ActivityIndicator, View, Text } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import "../globals.css";


// Component to show loading indicator
function LoadingScreen({ message = "Loading..." }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>{message}</Text>
    </View>
  );
}

// Root layout component that includes navigation logic
function RootLayoutNav() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, segments, isAuthLoading, router]);

  if (isAuthLoading) {
    return <LoadingScreen message="Checking session..." />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Screens defined here */}
    </Stack>
  );
}

// Main export wraps everything with the AuthProvider
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
