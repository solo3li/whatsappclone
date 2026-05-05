import { Platform } from 'react-native';

/**
 * CONFIGURATION GUIDE:
 * 1. Physical Device: Set LOCAL_IP to your computer's local IP (e.g., 192.168.1.x)
 * 2. Android Emulator: Use '10.0.2.2'
 * 3. iOS Simulator: Use 'localhost'
 */

const LOCAL_IP = '127.0.0.1'; // Use 127.0.0.1 for local development
const PORT = '5006';

// Automatic detection for simple cases
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return '10.0.2.2'; // Standard Android Emulator loopback
  }
  return LOCAL_IP;
};

const BASE_URL = `http://${getBaseUrl()}:${PORT}`;
const API_URL = `${BASE_URL}/api`;
const HUB_URL = `${BASE_URL}/chatHub`;

export default {
  API_URL,
  HUB_URL,
};
