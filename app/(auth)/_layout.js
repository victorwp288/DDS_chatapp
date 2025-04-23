import { Stack } from "expo-router";
import React from "react";

// Simple layout for auth screens, could add shared headers/styles here later
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
