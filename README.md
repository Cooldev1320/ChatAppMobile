# ChatApp Mobile

A React Native version of the ChatApp frontend, featuring real-time messaging, user authentication, and emoji reactions.

## 🚀 Features

- **Real-time Chat**: Instant messaging with SignalR integration
- **User Authentication**: Secure login and registration
- **Message Reactions**: Emoji reactions on messages
- **Modern UI**: Clean, Discord-inspired interface
- **Sound Effects**: Audio feedback for messages and notifications
- **Typing Indicators**: Real-time typing status
- **Online Users**: Live user presence tracking
- **Dark Theme**: Beautiful dark mode interface

## 🛠️ Tech Stack

- **React Native 0.75.4** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **SignalR** - Real-time communication
- **React Navigation** - Navigation library
- **AsyncStorage** - Local storage
- **React Native Sound** - Audio feedback

## 📋 Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio) (for Android)
- [Xcode](https://developer.apple.com/xcode/) (for iOS)
- ChatApp API backend running on `http://localhost:5000`

## 🔧 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory with your configuration.

3. **Run the app**
   
   For Android:
   ```bash
   npm run android
   ```
   
   For iOS:
   ```bash
   npm run ios
   ```

## 📱 Screens & Features

### Authentication Screens
- **Login** - User authentication
- **Register** - New user registration

### Chat Screen
- **Chat Interface** - Main chat with real-time messaging
- **Message Reactions** - Emoji reaction system
- **Typing Indicators** - Real-time typing status
- **Sound Controls** - Toggle audio feedback

## 🎨 UI Components

### Chat Interface
- **Message List** - Chat messages with timestamps
- **Input Area** - Message composition with send button
- **Reactions** - Emoji reactions on messages
- **Typing Indicators** - Real-time typing status

### Responsive Design
- **Mobile-First** - Optimized for mobile devices
- **Touch-Friendly** - Optimized touch interactions
- **Dark Theme** - Beautiful dark mode interface

## 🔌 API Integration

### Authentication API
```typescript
// Login
POST /api/auth/login
Body: { email: string, password: string }

// Register
POST /api/auth/register
Body: { username: string, email: string, password: string }
```

### SignalR Events
```typescript
// Send message
signalRService.sendMessage(content: string)

// Add reaction
signalRService.addReaction(messageId: number, emoji: string)

// Remove reaction
signalRService.removeReaction(messageId: number, emoji: string)
```

## 🎵 Sound System

The app includes a sound service for audio feedback:
- **Message Received** - Sound for incoming messages
- **Message Sent** - Sound for sent messages
- **User Joined** - Sound when users join
- **Error** - Sound for error notifications
- **Toggle** - Enable/disable sounds

## 🚀 Development

### Available Scripts
```bash
npm run android    # Run on Android
npm run ios        # Run on iOS
npm start          # Start Metro bundler
npm run lint       # Run ESLint
npm test           # Run tests
```

### Code Structure
```
src/
├── components/         # React components
│   ├── AuthForm.tsx    # Authentication form
│   ├── ChatWindow.tsx  # Main chat interface
│   ├── MessageList.tsx # Message display
│   └── MessageReactions.tsx # Reaction system
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/               # Utility libraries
│   ├── api.ts         # API client
│   ├── signalr.ts     # SignalR service
│   └── sounds.ts      # Sound service
├── navigation/        # Navigation
│   └── AppNavigator.tsx # Main navigator
├── screens/           # Screen components
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   └── ChatScreen.tsx
└── types/             # TypeScript definitions
    └── auth.ts        # Authentication types
```

## 🎨 Styling

### React Native StyleSheet
- **Custom Colors** - Purple and blue gradient theme
- **Dark Theme** - Beautiful dark mode
- **Responsive Design** - Mobile-first approach
- **Custom Components** - Reusable UI components

## 🔒 Security Features

- **JWT Token Storage** - Secure token management with AsyncStorage
- **Route Protection** - Protected routes with authentication
- **Input Validation** - Form validation and sanitization
- **Environment Variables** - Secure configuration management

## 📱 Mobile Features

- **Cross-Platform** - Works on both iOS and Android
- **Touch Gestures** - Swipe and tap interactions
- **Keyboard Handling** - Proper keyboard avoidance
- **Offline Support** - Basic offline functionality with AsyncStorage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email your-email@example.com or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial React Native release with basic chat functionality
- **v1.1.0** - Added message reactions and sound system
- **v1.2.0** - Enhanced mobile responsiveness and UI improvements
