# ChatApp Mobile - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Start Metro bundler**
   ```bash
   npm start
   ```

4. **Run the app**
   
   For Android:
   ```bash
   npm run android
   ```
   
   For iOS:
   ```bash
   npm run ios
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory with your configuration.

### Backend Requirements
Make sure your backend is running and accessible at the configured URLs. The app expects:

- **Authentication API**: `POST /api/auth/login` and `POST /api/auth/register`
- **SignalR Hub**: Available at `/chathub` endpoint
- **CORS**: Configured to allow requests from your mobile app

## 📱 Features

### ✅ Implemented Features
- **Authentication**: Login and registration
- **Real-time Chat**: SignalR integration
- **Message Reactions**: Emoji reactions on messages
- **Typing Indicators**: Real-time typing status
- **Sound System**: Audio feedback (configurable)
- **Dark Theme**: Beautiful dark mode UI
- **Navigation**: Smooth navigation between screens
- **Auto-scroll**: Messages auto-scroll to bottom
- **Logout**: Secure logout functionality

### 🎨 UI Components
- **AuthForm**: Reusable authentication form
- **ChatWindow**: Main chat interface
- **MessageList**: Message display with reactions
- **MessageReactions**: Emoji reaction system
- **EmojiPicker**: Modal emoji selection
- **Responsive Design**: Mobile-optimized layout

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

3. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

4. **SignalR connection issues**
   - Check if backend is running
   - Verify SignalR URL in environment config
   - Check network connectivity
   - Ensure CORS is properly configured

5. **Authentication issues**
   - Verify API URL in environment config
   - Check backend authentication endpoints
   - Ensure JWT token handling is correct

### Debug Mode
Enable debug mode by adding console logs in the SignalR service:

```typescript
// In src/lib/signalr.ts
console.log('SignalR URL:', signalRUrl);
console.log('Token:', token.substring(0, 20) + '...');
```

## 🔒 Security Notes

- JWT tokens are stored securely using AsyncStorage
- API calls include proper error handling
- Input validation on forms
- Secure token transmission to SignalR

## 📦 Dependencies

### Core Dependencies
- `react-native`: 0.75.4
- `@react-navigation/native`: ^6.1.18
- `@react-navigation/stack`: ^6.4.1
- `@microsoft/signalr`: ^9.0.6
- `@react-native-async-storage/async-storage`: ^1.23.1
- `react-native-sound`: ^0.11.2

### Development Dependencies
- `typescript`: 5.0.4
- `@types/react`: ^18.2.6
- `@types/react-native`: Latest
- `eslint`: ^8.19.0

## 🚀 Deployment

### Android
1. Generate signed APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. The APK will be in `android/app/build/outputs/apk/release/`

### iOS
1. Open `ios/ChatAppMobile.xcworkspace` in Xcode
2. Select your target device/simulator
3. Build and run the project

## 📝 Development Notes

- All components use TypeScript for type safety
- Styling uses React Native StyleSheet (no external CSS frameworks)
- State management uses React Context API
- Real-time features powered by SignalR
- Sound system is optional and can be disabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues:
1. Check this troubleshooting guide
2. Review the console logs
3. Verify backend connectivity
4. Check React Native documentation
5. Create an issue in the repository
