import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function TestStyleScreen() {
  return (
    // Use SafeAreaView edges if needed, apply obvious background
    <SafeAreaView className="flex-1 items-center justify-center bg-purple-500">
      <Stack.Screen options={{ title: "Style Test" }} />
      <Text className="text-white text-2xl font-bold p-5 bg-black/50 rounded-lg">
        If you see a purple background and white text, NativeWind is working!
      </Text>
    </SafeAreaView>
  );
}

