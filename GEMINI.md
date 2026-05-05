# Project Overview

This directory contains the source code for a WhatsApp clone, organized into a modern **Senior Full Stack** architecture with an Expo-based React Native frontend (`whats`) and an ASP.NET Core backend (`server`).

## Project Structure

- **`whats/`**: The frontend application. Follows **Senior Full Stack Expo** standards. Built using the [Expo framework](https://expo.dev/) and [Expo Router](https://docs.expo.dev/router/introduction/).
- **`server/`**: The backend services directory. Built using **ASP.NET Core 10.0** (C#) for high-performance API development, real-time communication, and administrative management.

## Tech Stack & Architecture

### Frontend (`whats/`)
- **Framework**: React Native with Expo (Version ~54.0.33)
- **State Management**: Zustand for global state synchronization.
- **Real-time**: SignalR (configured for backend integration).
- **Media**: `expo-image-picker`, `expo-document-picker`, `expo-av` (Audio/Video).
- **Animations**: `react-native-reanimated` with Slide/Fade/Spring effects.

### Backend (`server/`)
- **Framework**: ASP.NET Core 10.0 Web API + MVC.
- **Database**: SQLite with Entity Framework Core.
- **Real-time**: **SignalR Hub** (`ChatHub`) for messaging, status, and typing indicators.
- **Authentication**: **Email + OTP Auth** with JWT Bearer tokens.
- **Admin Panel**: **ASP.NET Core MVC** web interface for managing the system (Users, Messages, Statuses).
- **Infrastructure**: Dockerized (multi-stage build), GitHub Actions CI/CD for automated deployment to VPS.
- **Email**: Modern responsive HTML OTP templates delivered via MailKit.
- **Testing**: xUnit project with Unit/Integration tests for core services.

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
Access the Admin Panel at `http://localhost:5000/AdminPanel/Dashboard`

### Running Tests
```bash
cd server
dotnet test WhatsappClone.Tests/WhatsappClone.Tests.csproj
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

## Senior Engineering Standards

- **SignalR First**: Real-time events drive the UI state.
- **Atomic Components**: UI is modularized (e.g., `AudioMessage`, `Waveform`, `FileMessage`).
- **Zustand over Context**: Centralized, predictable state management.
- **Containerization**: "Write once, run anywhere" via Docker.
- **Clean Architecture**: Strong separation of Domain Entities, DTOs, and Services (IAuthService, IUserService, IStatusService).
- **Comprehensive Testing**: Business logic is validated via automated tests.
