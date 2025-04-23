# Secure Chat App Development Plan

## Phase 1: Project Setup & Foundation

- [x] **Initialize Expo Project:** Set up a new Expo project with a JavaScript template.
- [x] **Install Dependencies:**
  - [x] `nativewind`, `tailwindcss`
  - [x] `appwrite`
  - [x] `expo-router`, `react-native-screens`, `react-native-safe-area-context`, `expo-linking`, `expo-constants`, `expo-status-bar`
  - [x] ~~`@privacyresearch/libsignal-protocol-typescript`~~ (Removed due to bundling issues)
  - [x] `expo-secure-store`
  - [x] `react-native-dotenv` (for environment variables)
  - [x] ~~`buffer`~~ (Removed)
  - [x] ~~`react-native-get-random-values`~~ (Removed)
- [x] **Configure NativeWind:** Setup complete (tailwind.config.js, babel.config.js, metro.config.js verified). _Initial issue resolved by adding `globals.css` import to `app/_layout.js`._
- [x] **Basic Structure:** Created core directories (`app`, `utils`, `lib`, `context`).
- [x] **Setup Navigation:** Migrated from React Navigation to file-based routing with Expo Router (`app/_layout.js`, `app/index.js`).

## Phase 2: Authentication

- [x] **Appwrite Setup:** Created Appwrite project, configured platforms, stored Project ID, Endpoint, Platform ID in `.env`.
- [x] **Create Auth Screens:** Built UI for `LoginScreen` and `SignupScreen` (`app/(auth)/login.js`, `app/(auth)/sign-up.js`).
- [x] **Implement Auth Logic:** Integrated Appwrite SDK for account creation, login, logout using `react-native-appwrite` SDK (`lib/appwrite.js`, `context/AuthContext.js`). Added connection test function. _Fixed `accountId` vs `userId` query issue in AuthContext._
- [x] **Session Management:** Implemented session persistence (via `account.get()`) and conditional navigation using React Context and Expo Router layout effects (`context/AuthContext.js`, `app/_layout.js`). _Resolved navigation errors after auth actions by removing direct `router.replace` calls from AuthContext._

## Phase 3: Core Chat Functionality (Unencrypted)

- [x] **Appwrite Database Setup:** Designed and created collections with attributes and permissions (See Appendix A).
- [x] **Chat List Screen:** Created `ChatListScreen` (`app/index.js`) fetching conversations. _Filtered list to show only conversations with `lastMessage`._
- [x] **Chat Screen:** Created `ChatScreen` (`app/chat/[conversationId].js`) displaying messages, sending new messages, and basic realtime message subscription.
- [x] **Message Sending Enhancements:** Updated conversation `lastMessage` and `lastUpdatedAt` on send.
- [x] **Chat List Screen Enhancements:** Fetched and displayed participant names from `users` collection. _Added realtime subscription for new/updated conversations._
- [x] **Chat Screen Enhancements:** Fetched participant profile and displayed name in header (initially using default nav header, later switched to custom header bar).
- [x] **New Chat Flow:** Implemented user search (`Query.search` on indexed `name`) and 1-on-1 conversation creation/navigation (`app/new-chat.js`). _Resolved conversation creation permission issue for unverified users by temporarily using `Role.users()` document permissions._ _Added auto-population of initial users._
- [x] **User Profile Creation:** Created user profile document in `users` collection on signup. _Fixed `accountId` vs `userId` issue._
- [x] **Real-time Updates Refinement:** Basic message realtime implemented. Basic conversation list realtime implemented (create, update, delete).

## Phase 4: Double Ratchet E2EE Implementation

- **Library Selection Issues (Summary):**

  - Attempted to use `@privacyresearch/libsignal-protocol-typescript`.
  - Encountered `RangeError: Unknown encoding: utf-16le` during Metro bundling, even when library functions were not called.
  - Attempted polyfilling Node.js modules (`crypto`, `stream`, `vm`, `buffer`) using various react-native libraries and Metro config.
  - Polyfilling did not resolve the bundling error.
  - **Conclusion:** Library seems incompatible with the React Native/Expo/Metro environment in its current state. Changes reverted, including removal of polyfills and Signal-related dependencies.
  - **Next Step:** Need to find an alternative, React Native-compatible library for the Signal Protocol / Double Ratchet algorithm.

- [ ] **Select Compatible Library:** Research and choose a suitable library.
- [ ] **Key Management:**
  - [ ] Generate identity key pairs.
  - [ ] Generate signed prekeys and one-time prekeys.
  - [ ] Store public keys in Appwrite (`users` collection attributes TBD based on library).
  - [ ] Store private keys securely on device (`expo-secure-store`).
- [ ] **Session Establishment:**
  - [ ] Fetch recipient's public key bundle from Appwrite.
  - [ ] Establish initial Signal Protocol session using chosen library.
- [ ] **Encryption/Decryption:**
  - [ ] Encrypt messages before sending to Appwrite.
  - [ ] Decrypt messages received from Appwrite.
  - [ ] Handle ratchet progression.
- [ ] **PreKey Management:** Manage and replenish one-time prekeys.

## Phase 5: Contact Management & Refinements

- [/] **User Discovery:** Basic user search implemented in `app/new-chat.js`. Auto-population of initial users added.
- [ ] **Contact List:** Allow adding and displaying contacts explicitly.
- [/] **UI/UX Polish:** _Initial NativeWind styling applied to Chat List, Chat Screen, and New Chat screens. Resolved NativeWind setup issue (missing globals.css import in \_layout.js). Fixed navigation errors._ Add loading states, further error handling.
- [ ] **Optional Features:** Consider typing indicators, read receipts, profiles, etc.

## Phase 6: Testing & Deployment

- [ ] **Testing:** Unit tests, integration tests, manual testing.
- [ ] **Build & Deployment:** Use EAS Build for iOS/Android, prepare for app store submission.

---

## Appendix A: Appwrite Database Schema (chat_db)

_(Note: Database ID stored in `.env` as `APPWRITE_DATABASE_ID`)_
_(Note: Collection IDs stored in `.env`)_
_(Note: Document Security MUST be enabled for all collections)_ TBC

**1. `users` Collection**

- Purpose: Stores user profile information linked to Auth user.
- Attributes:
  - `userId` (String, Required, Size: 255) - Appwrite Auth User ID (`$id`). Indexed.
  - `name` (String, Required, Size: 255) - User display name. Fulltext Indexed.
  - `email` (String, Required, Size: 255, Format: Email) - User email. Fulltext Indexed.
  - `identityKey` (String, Optional, Size: 512) - Base64 encoded public identity key. (For E2EE)
  - `registrationId` (Integer, Optional) - Signal registration ID. (For E2EE)
  - _(Potentially add pre-key bundle attributes here later)_
- Collection Permissions:
  - Read: `Users` (`role:users`)
  - Create: `Users` (`role:users`)
  - Update: `Users` (`role:users`)
  - Delete: _(None - Admin only)_
- Document Permissions: _( Handled by Collection Permissions? TBC - If needed: `user:{userId}`)_

**2. `conversations` Collection**

- Purpose: Represents a chat session between participants.
- Attributes:
  - `participants` (String[], Required, Size: 100) - Array of participant `userId`s. Indexed.
  - `lastMessage` (String, Optional, Size: 1024) - Text of the last message (for preview).
  - `lastUpdatedAt` (DateTime, Optional) - Timestamp of the last message/activity. Indexed.
- Collection Permissions:
  - Read: `Users` (`role:users`)
  - Create: `Users` (`role:users`)
  - Update: `Users` (`role:users`)
  - Delete: _(None - Admin only)_
- Document Permissions: _(Currently using simplified `Role.users()` for read/update due to unverified user issue. Ideal: `user:{participants}`)_

**3. `messages` Collection**

- Purpose: Stores individual chat messages.
- Attributes:
  - `conversationId` (String, Required, Size: 255) - ID of the parent conversation. Indexed.
  - `senderId` (String, Required, Size: 255) - `userId` of the message sender. Indexed.
  - `text` (String, Required, Size: 4096) - Message content (will be encrypted).
  - `sentAt` (DateTime, Required) - Timestamp message was sent by client. Indexed.
- Collection Permissions:
  - Read: `Users` (`role:users`)
  - Create: `Users` (`role:users`)
  - Update: _(None - Admin only)_
  - Delete: _(None - Admin only)_
- Document Permissions: _(Ideal: `user:{senderId}` for update/delete, `user:{participants}` of conversation for read - Needs careful setup)_
