# Project Overview

This directory contains the source code for a WhatsApp clone, primarily organized into two main parts: an Expo-based React Native frontend (`whats`) and an ASP.NET Core backend (`server`).

## Project Structure

- **`whats/`**: The frontend application. Follows **Senior Full Stack Expo** standards. It is a React Native project built using the [Expo framework](https://expo.dev/) and utilizes [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing. The project is configured with TypeScript, strict linting (ESLint), and takes advantage of modern Expo experiments like Typed Routes and the React Compiler.
- **`server/`**: The backend services directory. This project uses **ASP.NET Core** (C#) for high-performance API development and real-time communication.

## Tech Stack & Architecture (Frontend)

- **Framework**: React Native with Expo (Version ~54.0.33)
- **Language**: TypeScript (`~5.9.2`)
- **Routing**: Expo Router (`~6.0.23`)
- **State Management**: Zustand for global state (messages, chats, auth, profiles).
- **Media/File Pickers & Audio**: `expo-image-picker`, `expo-document-picker`, `expo-av`
- **UI & Animations**: `react-native-reanimated`, `react-native-gesture-handler`, `expo-symbols`, `expo-image`
- **Linting**: ESLint (`^9.25.0`) with `eslint-config-expo`
- **New Architecture**: The project has Expo's New Architecture enabled (`newArchEnabled: true`).

## Building and Running the Frontend (`whats/`)

To develop and test the frontend application, navigate into the `whats` directory:

```bash
cd whats
```

### Key Commands

- **Install Dependencies:**
  ```bash
  npm install
  ```
- **Start the Development Server:**
  ```bash
  npm start
  # or
  npx expo start
  ```
- **Run on specific platforms:**
  ```bash
  npm run android # Start Android emulator
  npm run ios     # Start iOS simulator
  npm run web     # Start Web version
  ```
- **Linting:**
  ```bash
  npm run lint
  ```

## Application Map (Screens)

The application follows a structured navigation flow using Expo Router. Below is a map of all current screens:

### Authentication Flow (`(auth)`)
- **Login (`login.tsx`)**: Email-based entry screen for account verification.
- **Verification (`verify.tsx`)**: OTP entry and initial profile setup (name/photo).

### Main Tab Navigation (`(tabs)`)
- **Chats (`index.tsx`)**: List of active conversations with unread counts and message previews.
- **Updates (`updates.tsx`)**: Status updates (stories) with a full-screen viewer and reaction system.
- **Communities (`communities.tsx`)**: Placeholder for community-based features.
- **Calls (`calls.tsx`)**: History of voice and video calls.

### Feature Screens
- **Chat Detail (`chat/[id].tsx`)**: Core messaging interface. Supports text, reactions, replies, edits, deletions, camera/gallery attachments, and audio visualizers.
- **Call View (`call/[id].tsx`)**: Simulated voice and video call interfaces with real-time camera feedback.
- **Contact Info (`user/[id].tsx`)**: Detailed user profile view with blocking/unblocking logic and quick call/chat actions.
- **Select Contact (`contacts.tsx`)**: Searchable contact list to initiate new chat sessions.

## Database Schema (ERD)

The **ASP.NET Core** backend will utilize **Entity Framework Core** with the following relational model to support real-time features:

### Entities

1.  **Users**
    *   `Id` (PK, Guid)
    *   `Email` (String, Unique)
    *   `Name` (String)
    *   `AvatarUrl` (String)
    *   `Status` (String) - e.g., "Available", "Busy"
    *   `CreatedAt` (DateTime)

2.  **Chats**
    *   `Id` (PK, Guid)
    *   `IsGroup` (Boolean)
    *   `CreatedAt` (DateTime)

3.  **ChatParticipants**
    *   `ChatId` (FK, PK)
    *   `UserId` (FK, PK)
    *   `JoinedAt` (DateTime)

4.  **Messages**
    *   `Id` (PK, Guid)
    *   `ChatId` (FK)
    *   `SenderId` (FK)
    *   `Content` (String, Nullable)
    *   `MessageType` (Enum) - Text, Image, Audio, File
    *   `MediaUrl` (String, Nullable)
    *   `FileName` (String, Nullable)
    *   `FileSize` (String, Nullable)
    *   `ReplyToId` (FK, Nullable) - Self-reference for replies
    *   `IsForwarded` (Boolean)
    *   `Timestamp` (DateTime)

5.  **Statuses**
    *   `Id` (PK, Guid)
    *   `UserId` (FK)
    *   `ImageUrl` (String)
    *   `CreatedAt` (DateTime) - Expire after 24h logic

6.  **StatusReactions**
    *   `Id` (PK, Guid)
    *   `StatusId` (FK)
    *   `UserId` (FK)
    *   `Emoji` (String)
    *   `Timestamp` (DateTime)

7.  **Blocks**
    *   `BlockerId` (FK, PK)
    *   `BlockedId` (FK, PK)
    *   `CreatedAt` (DateTime)

### Relationships
- **Users <1:N> Messages**: A user can send many messages.
- **Chats <1:N> Messages**: A chat contains many messages.
- **Users <N:N> Chats**: Handled via `ChatParticipants` junction table.
- **Users <1:N> Statuses**: A user can post multiple status updates.
- **Statuses <1:N> StatusReactions**: A status can have many emoji reactions.

## Development Conventions & Senior Expo Practices

1.  **Routing**: The application uses Expo's file-based routing. All new screens and navigation layouts should be placed inside the `whats/app` directory.
2.  **TypeScript**: The project relies heavily on TypeScript for type safety. Ensure all new components and utilities are properly typed. The app also has `typedRoutes` enabled, meaning route parameters and navigation functions are statically typed.
3.  **Data Strategy**:
    - **Global State:** We use Zustand (`store/useStore.ts`) to manage all chat, message, block/unblock, and authentication states globally. Dummy data from `@whats/data/dummy.ts` is only used to seed this store initially until a real backend is implemented.
    - **Authentication:** The app uses an **Email + OTP** authentication flow. Users enter their email address, receive a (simulated) 6-digit verification code, and then set up their profile.
    - **Status Features:** The application supports full-screen status viewing (stories) in the Updates tab with progress indicators, automatic transitions, and a **Reaction System** (send emojis and view the list of people who reacted).
    - **Media Handling:** The chat interface provides a unified media picker via the camera icon, allowing users to choose between capturing a new photo with the **Camera** or selecting existing media from the **Photo Library**.
    - **Dummy Data Constraints:** Critically: only use dummy dates (e.g., '12:00 PM', 'Yesterday') in chat records and message timestamps to maintain consistency across dummy payloads until a real backend strategy is implemented.
4.  **Hardware & Native Features**: We leverage modern Expo libraries to access native features rather than building custom bridges.
    - Used `expo-image-picker` for robust camera interactions.
    - Used `expo-document-picker` for comprehensive file handling.
    - Used `expo-av` for WhatsApp-style audio recording, playback, and inline previews.
    - Used `expo-camera` for real-time live video call simulations.
5.  **Parallel Multi-Agent & Advanced AI Orchestration**:
    - When executing complex tasks, leverage **Parallel Multi-Agent** workflows. Deploy multiple specialized agents (e.g., UI Synthesis and Backend Logic) concurrently to accelerate delivery.
    - Maintain a strict **Senior Full Stack** perspective: every change must be idiomatically correct for both the Expo SDK and the .NET ecosystem.
    - Ensure AI tools generate idiomatically correct React Native primitives and strictly follow Expo SDK conventions instead of older Bare React Native workflows.

## Backend Integration

The `server` folder is the home for the **ASP.NET Core** backend.
- Use **C#** and the latest **.NET SDK**.
- Prioritize **Entity Framework Core** for database interactions.
- Utilize **SignalR** for real-time messaging synchronization between the Expo frontend and the ASP.NET Core backend.
- Ensure all API endpoints are documented via **Swagger/OpenAPI**.
