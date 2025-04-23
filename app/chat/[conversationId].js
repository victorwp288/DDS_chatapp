import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import {
  databases,
  databaseId,
  client,
  messagesCollectionId,
  conversationsCollectionId,
  usersCollectionId,
} from "../../lib/appwrite";
import { Query, ID } from "appwrite";

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [headerTitle, setHeaderTitle] = useState("Chat");
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (!conversationId || !user) return;

    let messageUnsubscribe = null;

    const initializeAndFetch = async () => {
      setIsLoading(true);
      try {
        const convDetails = await databases.getDocument(
          databaseId,
          conversationsCollectionId,
          conversationId
        );
        const participants = convDetails.participants;
        const otherParticipantId = participants.find((pId) => pId !== user.$id);
        if (otherParticipantId) {
          try {
            const profileResponse = await databases.listDocuments(
              databaseId,
              usersCollectionId,
              [Query.equal("userId", otherParticipantId), Query.limit(1)]
            );
            if (profileResponse.documents.length > 0 && isMountedRef.current) {
              setHeaderTitle(profileResponse.documents[0].name);
            }
          } catch (profileError) {
            console.error("Failed to fetch participant profile:", profileError);
            if (isMountedRef.current) setHeaderTitle("Chat");
          }
        } else if (isMountedRef.current) {
          setHeaderTitle("Yourself (Saved Messages)");
        }

        console.log("Fetching initial messages...");
        const messagesResponse = await databases.listDocuments(
          databaseId,
          messagesCollectionId,
          [
            Query.equal("conversationId", conversationId),
            Query.orderDesc("$createdAt"),
          ]
        );

        const plainMessages = messagesResponse.documents.map((doc) => ({
          id: doc.$id,
          senderId: doc.senderId,
          text: doc.text || "[Message content missing]",
          $createdAt: doc.$createdAt,
        }));

        if (isMountedRef.current) {
          setMessages(plainMessages);
        }
      } catch (error) {
        console.error("Failed to initialize chat screen:", error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }

      console.log("Setting up realtime subscription...");
      messageUnsubscribe = client.subscribe(
        `databases.${databaseId}.collections.${messagesCollectionId}.documents`,
        (response) => {
          if (
            response.events.includes(
              `databases.${databaseId}.collections.${messagesCollectionId}.documents.*.create`
            ) &&
            isMountedRef.current
          ) {
            const payload = response.payload;
            if (payload.conversationId === conversationId) {
              console.log("Realtime: Received new message:", payload.$id);
              if (messages.some((msg) => msg.id === payload.$id)) {
                console.log("Realtime: Message already exists, skipping.");
                return;
              }

              const newMessageData = {
                id: payload.$id,
                senderId: payload.senderId,
                text: payload.text || "[Message content missing]",
                $createdAt: payload.$createdAt,
              };
              setMessages((prevMessages) => [newMessageData, ...prevMessages]);
              console.log("Realtime: Plaintext message added.");
            }
          }
        }
      );
    };

    initializeAndFetch();

    return () => {
      isMountedRef.current = false;
      console.log("Cleaning up chat screen, unsubscribing...");
      if (messageUnsubscribe) {
        messageUnsubscribe();
      }
    };
  }, [conversationId, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !conversationId) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const messageData = {
        conversationId: conversationId,
        senderId: user.$id,
        text: messageText,
        sentAt: new Date().toISOString(),
      };

      console.log("Sending message document to Appwrite...");
      await databases.createDocument(
        databaseId,
        messagesCollectionId,
        ID.unique(),
        messageData
      );
      console.log("Message sent successfully.");

      await databases.updateDocument(
        databaseId,
        conversationsCollectionId,
        conversationId,
        {
          lastUpdatedAt: new Date().toISOString(),
          lastMessage: messageText,
        }
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert("Send Error", "Could not send message.");
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const renderItem = useCallback(
    ({ item }) => {
      const isMyMessage = item.senderId === user?.$id;
      return (
        <View
          className={`py-2.5 px-4 rounded-xl my-1 max-w-[75%] ${
            isMyMessage ? "bg-indigo-500 self-end" : "bg-gray-200 self-start"
          }`}
        >
          <Text
            className={`text-base ${
              isMyMessage ? "text-white" : "text-gray-800"
            }`}
          >
            {item.text}
          </Text>
        </View>
      );
    },
    [user]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-gray-100"
      edges={["top", "left", "right"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
          <Text className="text-indigo-500 text-base">{"< Chats"}</Text>
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-gray-800 text-center flex-1">
          {headerTitle}
        </Text>

        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center bg-gray-100">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
          className="flex-1"
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-row p-3 bg-white items-center space-x-2 border-t border-gray-200"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TextInput
          className="flex-1 min-h-[44px] bg-gray-100 rounded-lg px-4 py-2 border-0 text-base text-gray-800"
          style={{ maxHeight: 120 }}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          multiline
        />
        <TouchableOpacity
          className={`px-4 py-2.5 rounded-lg ${
            isSending || !newMessage.trim()
              ? "bg-gray-300"
              : "bg-indigo-500 active:bg-indigo-600"
          }`}
          onPress={handleSendMessage}
          disabled={isSending || !newMessage.trim()}
        >
          <Text className="text-white font-medium text-sm">Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
