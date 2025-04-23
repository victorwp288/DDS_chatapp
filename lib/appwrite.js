import { Client, Account, Databases } from "react-native-appwrite"; // Use the correct SDK
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID as envDatabaseId,
  APPWRITE_USERS_COLLECTION_ID as envUsersCollectionId,
  APPWRITE_CONVERSATIONS_COLLECTION_ID as envConversationsCollectionId,
  APPWRITE_MESSAGES_COLLECTION_ID as envMessagesCollectionId,
  APPWRITE_PLATFORM,
  // eslint-disable-next-line import/no-unresolved
} from "@env";

if (
  !APPWRITE_ENDPOINT ||
  !APPWRITE_PROJECT_ID ||
  !envDatabaseId ||
  !envUsersCollectionId ||
  !envConversationsCollectionId ||
  !envMessagesCollectionId ||
  !APPWRITE_PLATFORM
) {
  throw new Error(
    "Missing Appwrite environment variables (Endpoint, Project ID, Database ID, Platform ID, or Collection IDs). Did you create/update .env and restart the bundler?"
  );
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setPlatform(APPWRITE_PLATFORM);

const account = new Account(client);
const databases = new Databases(client);

// Assign to local constants
const databaseId = envDatabaseId;
const usersCollectionId = envUsersCollectionId;
const conversationsCollectionId = envConversationsCollectionId;
const messagesCollectionId = envMessagesCollectionId;

// Export the local constants
export {
  client,
  account,
  databases,
  databaseId,
  usersCollectionId,
  conversationsCollectionId,
  messagesCollectionId,
};
