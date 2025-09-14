import { API_URL, SIGNALR_URL, APP_NAME, APP_VERSION } from '@env';

// Environment configuration
export const ENV = {
  API_URL: API_URL || 'https://chatapp-api-xi6a.onrender.com',
  SIGNALR_URL: SIGNALR_URL || 'https://chatapp-api-xi6a.onrender.com/chathub',
  APP_NAME: APP_NAME || 'ChatApp',
  APP_VERSION: APP_VERSION || '1.0.0',
};
