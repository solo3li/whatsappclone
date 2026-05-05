# Project Overview

This directory contains the source code for a WhatsApp clone, primarily organized into two main parts: an Expo-based React Native frontend (`whats`) and a planned backend (`server`).

## Project Structure

- **`whats/`**: The frontend application. It is a React Native project built using the [Expo framework](https://expo.dev/) and utilizes [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing. The project is configured with TypeScript, strict linting (ESLint), and takes advantage of modern Expo experiments like Typed Routes and the React Compiler.
- **`server/`**: Intended for backend development. Currently, this directory is empty.

## Tech Stack & Architecture (Frontend)

- **Framework**: React Native with Expo (Version ~54.0.33)
- **Language**: TypeScript (`~5.9.2`)
- **Routing**: Expo Router (`~6.0.23`)
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
- **Reset Project Template:**
  If you want to start fresh and remove the default starter code (moving it to `app-example`), run:
  ```bash
  npm run reset-project
  ```

## Development Conventions

1.  **Routing**: The application uses Expo's file-based routing. All new screens and navigation layouts should be placed inside the `whats/app` directory.
2.  **TypeScript**: The project relies heavily on TypeScript for type safety. Ensure all new components and utilities are properly typed. The app also has `typedRoutes` enabled, meaning route parameters and navigation functions are statically typed.
3.  **Styling**: Use the provided constants in `whats/constants/Colors.ts` for consistent theming. 
4.  **Backend Integration**: The `server` folder is currently empty. Any API development, database configurations, or backend logic should be initialized within that directory when the time comes.
