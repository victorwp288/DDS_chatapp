/* global setTimeout */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import {
  account,
  databases,
  databaseId,
  usersCollectionId,
} from "../lib/appwrite"; // Import Appwrite account service
import { ID, Query } from "appwrite";
import { Alert } from "react-native";
import { router } from "expo-router";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Function to introduce a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appwriteUserDoc, setAppwriteUserDoc] = useState(null); // Store user profile doc

  // Function to check if user is logged in
  const checkLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await account.get();
      if (currentUser) {
        setUser(currentUser);
        // Fetch the corresponding user document from the database
        const userDocResponse = await databases.listDocuments(
          databaseId,
          usersCollectionId,
          [Query.equal("userId", currentUser.$id)]
        );
        if (userDocResponse.documents.length > 0) {
          setAppwriteUserDoc(userDocResponse.documents[0]);
        } else {
          console.error("Appwrite user document not found for logged in user!");
          setAppwriteUserDoc(null); // Ensure state is cleared
        }
      } else {
        setUser(null);
        setAppwriteUserDoc(null);
      }
    } catch (error) {
      // Handle the case where there's no active session (expected on first load)
      if (error.message.includes("User (role: guests)")) {
        console.log("No active session found.");
      } else {
        console.error("Check login error:", error);
      }
      setUser(null);
      setAppwriteUserDoc(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true); // Set loading true at the start
    try {
      await account.createEmailPasswordSession(email, password);
      // Now checkLogin just fetches user and doc, no Signal setup effect
      await checkLogin();
      console.log("Login successful, navigating to home.");
      return { success: true }; // Indicate success
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("Login Failed", error.message);
      setUser(null); // Clear user state on failure
      setAppwriteUserDoc(null); // Clear doc state on failure
      setIsLoading(false); // Ensure loading is false on failure
      return { success: false, error }; // Indicate failure
    }
  };

  const signup = async (email, password, name) => {
    setIsLoading(true);
    let newAccount = null; // Define newAccount outside try to potentially use in catch for cleanup
    try {
      // 1. Create Appwrite account
      newAccount = await account.create(ID.unique(), email, password, name);
      const newUserId = newAccount.$id; // Use a clearer variable name
      console.log("Appwrite account created:", newUserId);

      // 2. Log in the new user
      await account.createEmailPasswordSession(email, password);
      console.log("Logged in new user.");

      // Fetch the session user object (might differ slightly from create result)
      const currentUser = await account.get();
      setUser(currentUser); // Set user state immediately after login

      // 3. Create user profile document in the database
      console.log("Creating user profile document...");
      const profileDoc = await databases.createDocument(
        databaseId,
        usersCollectionId,
        ID.unique(), // Use a unique ID for the document itself
        {
          userId: newUserId,
          email: email,
          name: name || email.split("@")[0], // Use name or derive from email
          // Removed Signal fields
          // publicIdentityKey: null,
          // registrationId: null,
          // signedPreKey: null,
          // preKeys: null,
        }
      );
      console.log("User profile document created:", profileDoc.$id);
      setAppwriteUserDoc(profileDoc); // Set the document state

      // No Signal setup effect needed anymore

      Alert.alert("Signup Successful", "Account created and logged in!");
      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      Alert.alert("Signup Failed", error.message);
      // Cleanup attempts (optional, depends on error type)
      // if (newAccount) { /* maybe try deleting the account if doc creation failed? */ }
      setUser(null); // Reset state
      setAppwriteUserDoc(null); // Reset state
      setIsLoading(false); // Ensure loading is false on failure
      return { success: false, error };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await account.deleteSession("current");
      setUser(null);
      setAppwriteUserDoc(null);
      // No SignalStore cleanup needed
      console.log("Logout successful.");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test connection - useful for debugging setup issues
  const testAppwriteConnection = async () => {
    try {
      await account.get(); // Try getting the current user
      return {
        success: true,
        message: "Connection successful (found active session).",
      };
    } catch (error) {
      // If error indicates guest status, connection is still OK (endpoint reachable)
      if (error.message.includes("User (role: guests)")) {
        return {
          success: true,
          message:
            "Connection successful (no active session). Endpoint/Project ID OK.",
        };
      }
      // If project ID is wrong
      else if (
        error.message.includes(
          "Project with the requested ID could not be found"
        )
      ) {
        return {
          success: false,
          message: `Connection Failed: Project not found. Check Endpoint/Project ID in .env and restart bundler. Error: ${error.message}`,
        };
      }
      // Other errors
      else {
        return {
          success: false,
          message: `Connection Failed: ${error.message}`,
        };
      }
    }
  };

  // Check login status on initial mount
  useEffect(() => {
    console.log("AuthProvider mounted, checking initial login status...");
    checkLogin();
  }, [checkLogin]); // Run only on mount/checkLogin change

  return (
    <AuthContext.Provider
      value={{
        user,
        appwriteUserDoc,
        isLoading,
        login,
        signup,
        logout,
        testAppwriteConnection,
        refetchUserDoc: checkLogin, // Allow components to refetch user/doc easily
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
