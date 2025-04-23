/* global setTimeout, clearTimeout */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import {
  databases,
  databaseId,
  usersCollectionId,
  conversationsCollectionId,
} from "../lib/appwrite";
import { Query, ID } from "appwrite";
import { Permission, Role } from "appwrite";

export default function NewChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [initialUsers, setInitialUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchInitial = async () => {
      setIsLoadingInitial(true);
      try {
        const response = await databases.listDocuments(
          databaseId,
          usersCollectionId,
          [Query.limit(10)]
        );
        const filtered = response.documents.filter(
          (doc) => doc.userId !== user.$id
        );
        setInitialUsers(filtered);
        if (searchQuery.trim() === "") {
          setSearchResults(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch initial users:", error);
        Alert.alert("Error", "Could not load initial user list.");
      } finally {
        setIsLoadingInitial(false);
      }
    };

    fetchInitial();
  }, [user]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSearchResults(initialUsers);
      setIsLoading(false);
      return () => {};
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await databases.listDocuments(
          databaseId,
          usersCollectionId,
          [Query.search("name", trimmedQuery), Query.limit(25)]
        );
        const filteredResults = response.documents.filter(
          (doc) => doc.userId !== user.$id
        );
        setSearchResults(filteredResults);
      } catch (error) {
        if (error.message.includes("search index")) {
          Alert.alert(
            "Search Error",
            "User search index might not be ready. Please try again."
          );
        } else {
          console.error("Search failed:", error);
          Alert.alert("Search Error", "Could not fetch users.");
        }
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user, initialUsers]);

  const handleSelectUser = async (selectedUser) => {
    if (!user || isCreatingChat) return;
    setIsCreatingChat(true);

    const currentUser = user;
    const otherUser = selectedUser;

    // --- Log the selected user object --- //
    console.log("Selected User Object:", JSON.stringify(otherUser, null, 2));
    // --- End Log --- //

    // Check if otherUser.userId exists and is a non-empty string
    if (
      !otherUser?.userId ||
      typeof otherUser.userId !== "string" ||
      otherUser.userId.trim() === ""
    ) {
      console.error("Invalid or missing userId for selected user:", otherUser);
      Alert.alert(
        "Error",
        "Cannot start chat with selected user due to invalid user ID."
      );
      setIsCreatingChat(false);
      return;
    }

    console.log(
      "Initiating chat between:",
      currentUser.$id,
      "and:",
      otherUser.userId
    );

    try {
      const q1 = Query.search("participants", currentUser.$id);
      const q2 = Query.search("participants", otherUser.userId);
      const existingConversations = await databases.listDocuments(
        databaseId,
        conversationsCollectionId,
        [q1, q2]
      );
      const existingChat = existingConversations.documents.find(
        (doc) =>
          doc.participants.length === 2 &&
          doc.participants.includes(currentUser.$id) &&
          doc.participants.includes(otherUser.userId)
      );

      if (existingChat) {
        console.log("Existing chat found:", existingChat.$id);
        router.push(`/chat/${existingChat.$id}`);
      } else {
        console.log("No existing chat found. Creating new one...");

        // --- Debugging Permissions --- //
        console.log("Current User ID:", currentUser.$id);
        console.log("Other User ID:", otherUser.userId);
        // const specificPermissions = [...]; // Keep previous log for comparison

        // --- Testing simplified permissions --- //
        const simplifiedPermissions = [
          Permission.read(Role.users()),
          Permission.update(Role.users()),
        ];
        console.log(
          "Simplified Permissions:",
          JSON.stringify(simplifiedPermissions)
        );
        // --- End Testing --- //

        const newConversation = await databases.createDocument(
          databaseId,
          conversationsCollectionId,
          ID.unique(),
          {
            participants: [currentUser.$id, otherUser.userId],
            lastMessage: null,
            lastUpdatedAt: new Date().toISOString(),
          },
          simplifiedPermissions // Use simplified permissions for testing
        );
        console.log("Conversation document created:", newConversation.$id);

        router.push(`/chat/${newConversation.$id}`);
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
      Alert.alert("Error", `Could not start chat. ${error.message}`);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-200 active:bg-gray-200"
      onPress={() => handleSelectUser(item)}
      disabled={isCreatingChat}
    >
      <Text className="text-base font-semibold text-gray-800">
        {item.name || "No Name"}
      </Text>
      <Text className="text-sm text-gray-500">{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen
        options={{
          title: "Start New Chat",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#374151",
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShown: true,
        }}
      />
      <View className="p-3 border-b border-gray-200 bg-white">
        <TextInput
          className="h-11 bg-gray-100 rounded-lg px-4 text-base text-gray-800"
          placeholder="Search by name..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {isLoadingInitial && (
        <ActivityIndicator className="mt-8" size="large" color="#6366F1" />
      )}

      {!isLoadingInitial && isLoading && (
        <ActivityIndicator className="mt-8" size="large" color="#6366F1" />
      )}

      {!isLoadingInitial && (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          className="flex-1"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            !isLoading ? (
              searchQuery.trim() ? (
                <Text className="text-center mt-12 text-base text-gray-500">
                  No users found matching "{searchQuery}".
                </Text>
              ) : (
                <Text className="text-center mt-12 text-base text-gray-500">
                  Search for users to start a chat.
                </Text>
              )
            ) : null
          }
        />
      )}

      {isCreatingChat && (
        <ActivityIndicator className="my-2.5" size="large" color="#6366F1" />
      )}
    </SafeAreaView>
  );
}
