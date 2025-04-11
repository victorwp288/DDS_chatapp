import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";

export default function App() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-blue-500">
      <Text className="text-red-600 text-2xl font-bold">Hello DDS group!</Text>
      <StatusBar style="auto" />

	  	<Text className="border-lime-800 border-2">lol</Text>
    </SafeAreaView>
  );
}
