# Project Overview

This directory contains the source code for a WhatsApp clone, organized into a modern **Senior Full Stack** architecture with an Expo-based React Native frontend (`whats`) and an ASP.NET Core backend (`server`).

## Project Structure

- **`whats/`**: The frontend application. Follows **Senior Full Stack Expo** standards. Built using the [Expo framework](https://expo.dev/) and [Expo Router](https://docs.expo.dev/router/introduction/).
- **`server/`**: The backend services directory. Built using **ASP.NET Core 10.0** (C#) for high-performance API development and real-time communication.

## Tech Stack & Architecture

### Frontend (`whats/`)
- **Framework**: React Native with Expo (Version ~54.0.33)
- **State Management**: Zustand for global state synchronization.
- **Real-time**: SignalR (configured for backend integration).
- **Media**: `expo-image-picker`, `expo-document-picker`, `expo-av` (Audio/Video).
- **Animations**: `react-native-reanimated` with Slide/Fade/Spring effects.

### Backend (`server/`)
- **Framework**: ASP.NET Core 10.0 Web API.
- **Database**: SQLite with Entity Framework Core.
- **Real-time**: **SignalR Hub** (`ChatHub`) for messaging, status, and typing indicators.
- **Authentication**: **Email + OTP Auth** with JWT Bearer tokens.
- **Infrastructure**: Dockerized (multi-stage build), GitHub Actions CI/CD for automated deployment to VPS.
- **Email**: Modern responsive HTML OTP templates delivered via MailKit.

## Building and Running

### Frontend (`whats/`)
```bash
cd whats
npm install
npm start
```

### Backend (`server/`)
```bash
cd server/WhatsappClone.Api
dotnet build
dotnet run
```
Or using Docker:
```bash
docker build -t whatsapp-backend server/
docker run -p 8080:8080 whatsapp-backend
```

## Infrastructure & CI/CD

- **GitHub Actions**: `.github/workflows/backend-deploy.yml`
  - Automated build, test, and containerization.
  - Pushes to Docker Hub.
  - Deploys via SSH to VPS (`47.84.69.17`).
- **Secrets Required**:
  - `DOCKER_USERNAME`, `DOCKER_PASSWORD`
  - `VPS_PASSWORD`
  - `HOST_MAIL`, `HOST_MAIL_PASS` (for OTP delivery).

## Application Map (Screens)

### Authentication
- **Login (`login.tsx`)**: Email entry.
- **Verification (`verify.tsx`)**: OTP entry & profile setup.

### Main Tabs
- **Chats (`index.tsx`)**: Conversation list with unread counts.
- **Updates (`updates.tsx`)**: Status stories with a reaction system.

### Feature Screens
- **Chat Detail (`chat/[id].tsx`)**: Core messaging. Supports text, reactions, replies, edits, deletions, camera/gallery, and audio visualizers.
- **Call View (`call/[id].tsx`)**: Simulated voice/video calls.
- **Contact Info (`user/[id].tsx`)**: User profile & blocking logic.

## Senior Engineering Standards

- **SignalR First**: Real-time events drive the UI state.
- **Atomic Components**: UI is modularized (e.g., `AudioMessage`, `Waveform`, `FileMessage`).
- **Zustand over Context**: Centralized, predictable state management.
- **Containerization**: "Write once, run anywhere" via Docker.
- **Clean Architecture**: Strong separation of Domain Entities, DTOs, and Services.
