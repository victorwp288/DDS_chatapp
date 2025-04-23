import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import {
  databases,
  databaseId,
  conversationsCollectionId,
  usersCollectionId,
  client,
} from "../lib/appwrite";
import { Query } from "appwrite";

// Define a named component for rendering list items
const ConversationItem = React.memo(({ item, user, userProfiles, onPress }) => {
  const otherParticipantNames = item.participants
    .filter((pId) => pId !== user?.$id)
    .map((pId) => userProfiles[pId] || `ID: ${pId.substring(0, 6)}...`)
    .join(", ");

  const displayName = otherParticipantNames || "Yourself (Saved Messages)";

  // console.log(`Rendering item: ${displayName}`); // Keep for debugging if needed

  return (
    <TouchableOpacity
      className="bg-white p-4 border-b border-gray-200"
      onPress={onPress}
    >
      <Text className="text-base font-bold mb-1">{displayName}</Text>
      <Text className="text-sm text-gray-600">
        {item.lastMessage || "No messages yet"}
      </Text>
    </TouchableOpacity>
  );
});
ConversationItem.displayName = "ConversationItem";

export default function ChatListScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filter conversations to only show those with messages
  const filteredConversations = React.useMemo(() => {
    return conversations.filter((conv) => conv.lastMessage);
  }, [conversations]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    let unsubscribe = null;

    const fetchConversationsAndProfiles = async () => {
      setIsLoading(true);
      let fetchedConversations = [];
      let participantIds = new Set();

      try {
        const response = await databases.listDocuments(
          databaseId,
          conversationsCollectionId,
          [
            Query.search("participants", user.$id),
            Query.orderDesc("lastUpdatedAt"),
          ]
        );
        fetchedConversations = response.documents;

        fetchedConversations.forEach((conv) => {
          conv.participants.forEach((pId) => {
            if (pId !== user.$id) {
              participantIds.add(pId);
            }
          });
        });

        if (participantIds.size > 0) {
          const profileResponse = await databases.listDocuments(
            databaseId,
            usersCollectionId,
            [Query.equal("userId", Array.from(participantIds))]
          );

          const profiles = {};
          profileResponse.documents.forEach((profile) => {
            profiles[profile.userId] = profile.name;
          });

          if (isMounted) {
            setUserProfiles(profiles);
          }
        }

        if (isMounted) {
          setConversations(fetchedConversations);
        }
      } catch (error) {
        console.error("Failed to fetch conversations or profiles:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchConversationsAndProfiles();

    // --- Setup Appwrite Realtime Subscription --- //
    console.log("Setting up realtime subscription for conversations...");
    const conversationChannel = `databases.${databaseId}.collections.${conversationsCollectionId}.documents`;

    unsubscribe = client.subscribe(conversationChannel, (response) => {
      if (!isMounted) return;

      if (response.events.includes(`${conversationChannel}.*.create`)) {
        const newConv = response.payload;
        console.log("Realtime: New conversation created:", newConv.$id);

        if (newConv.participants?.includes(user.$id)) {
          setConversations((prevConversations) => {
            if (prevConversations.some((c) => c.$id === newConv.$id)) {
              return prevConversations;
            }
            return [newConv, ...prevConversations];
          });
        } else {
          console.log(
            "Realtime: New conversation doesn't include current user."
          );
        }
      }

      if (response.events.includes(`${conversationChannel}.*.update`)) {
        const updatedConv = response.payload;
        console.log("Realtime: Conversation updated:", updatedConv.$id);
        setConversations((prev) =>
          prev.map((c) => (c.$id === updatedConv.$id ? updatedConv : c))
        );
      }

      if (response.events.includes(`${conversationChannel}.*.delete`)) {
        const deletedConv = response.payload;
        console.log("Realtime: Conversation deleted:", deletedConv.$id);
        setConversations((prev) =>
          prev.filter((c) => c.$id !== deletedConv.$id)
        );
      }
    });

    console.log(`Subscribed to: ${conversationChannel}`);

    return () => {
      isMounted = false;
      if (unsubscribe) {
        console.log("Unsubscribing from conversations...");
        unsubscribe();
      }
    };
  }, [user, databaseId, conversationsCollectionId]);

  const handleSelectConversation = useCallback(
    (conversationId) => {
      router.push(`/chat/${conversationId}`);
    },
    [router]
  );

  // Use the named component in renderItem, wrapped in useCallback
  const renderItem = useCallback(
    ({ item }) => (
      <ConversationItem
        item={item}
        user={user}
        userProfiles={userProfiles}
        onPress={() => handleSelectConversation(item.$id)}
      />
    ),
    [user, userProfiles, handleSelectConversation]
  );

  if (!user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Please login.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-200 bg-white">
        <Text className="text-3xl font-bold text-gray-800">Chats</Text>
        <View className="flex-row items-center space-x-2">
          <Link href="/test-style" asChild>
            <TouchableOpacity className="bg-yellow-500 px-3 py-1 rounded">
              <Text className="text-black text-xs">Test Style</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/new-chat" asChild>
            <TouchableOpacity className="bg-indigo-500 px-4 py-2 rounded-lg active:bg-indigo-600">
              <Text className="text-white font-medium text-sm">New Chat</Text>
            </TouchableOpacity>
          </Link>
          <View className="ml-2">
            <Button title="Logout" onPress={logout} />
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-lg text-gray-500">
                No active conversations.
              </Text>
              <Text className="text-base text-gray-400 mt-1">
                Start a new chat!
              </Text>
            </View>
          }
          className="flex-1"
        />
      )}
    </SafeAreaView>
  );
}
