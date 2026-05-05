# Project Overview

This directory contains the source code for a WhatsApp clone, primarily organized into two main parts: an Expo-based React Native frontend (`whats`) and a planned backend (`server`).

## Project Structure

- **`whats/`**: The frontend application. It is a React Native project built using the [Expo framework](https://expo.dev/) and utilizes [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing. The project is configured with TypeScript, strict linting (ESLint), and takes advantage of modern Expo experiments like Typed Routes and the React Compiler.
- **`server/`**: Intended for backend development. Currently, this directory is empty.

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

## Development Conventions & Senior Expo Practices

1.  **Routing**: The application uses Expo's file-based routing. All new screens and navigation layouts should be placed inside the `whats/app` directory.
2.  **TypeScript**: The project relies heavily on TypeScript for type safety. Ensure all new components and utilities are properly typed. The app also has `typedRoutes` enabled, meaning route parameters and navigation functions are statically typed.
3.  **Data Strategy**:
    - **Global State:** We use Zustand (`store/useStore.ts`) to manage all chat, message, block/unblock, and authentication states globally. Dummy data from `@whats/data/dummy.ts` is only used to seed this store initially until a real backend is implemented.
    - **Dummy Data Constraints:** Critically: only use dummy dates (e.g., '12:00 PM', 'Yesterday') in chat records and message timestamps to maintain consistency across dummy payloads until a real backend strategy is implemented.
4.  **Hardware & Native Features**: We leverage modern Expo libraries to access native features rather than building custom bridges.
    - Used `expo-image-picker` for robust camera interactions.
    - Used `expo-document-picker` for comprehensive file handling.
    - Used `expo-av` for WhatsApp-style audio recording, playback, and inline previews.
    - Used `expo-camera` for real-time live video call simulations.
5.  **Multiagent & Advanced AI Skills Integration**:
    - When extending features across the tech stack (e.g., bridging frontend with the `server/` directory), deploy multiagent workflows that combine specialized React Native UI synthesis with robust Node.js/Python server-side generation.
    - Ensure AI tools generate idiomatically correct React Native primitives and strictly follow Expo SDK conventions instead of older Bare React Native workflows.

## Backend Integration

The `server` folder is currently empty. Any API development, database configurations, or backend logic should be initialized within that directory when the time comes.