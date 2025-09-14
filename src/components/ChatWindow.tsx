import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Message } from '../types/auth';
import { signalRService } from '../lib/signalr';
import { soundService } from '../lib/sounds';
import MessageList from './MessageList';

interface ChatWindowProps {
  token: string;
  currentUserId: number;
  username: string;
}

export default function ChatWindow({ token, currentUserId, username }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messageReactions, setMessageReactions] = useState<Record<number, Array<{ emoji: string; users: string[]; count: number }>>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) {
      console.log('No token available for SignalR connection');
      return;
    }

    const connectToChat = async () => {
      try {
        setIsConnecting(true);
        console.log('Connecting to SignalR with token:', token.substring(0, 20) + '...');
        
        await signalRService.connect(token);

        signalRService.onReceiveMessage((message: Message) => {
          setMessages(prev => [...prev, message]);
          
          // Play sound for received messages (not your own)
          const messageUserId = message.userId || message.user?.id;
          if (messageUserId !== currentUserId) {
            soundService.playMessageReceived();
          }
        });
        
        signalRService.onUserConnected((username: string) => {
          console.log('User connected:', username);
          setConnectedUsers(prev => [...prev, username]);
          soundService.playUserJoined();
        });

        signalRService.onUserDisconnected((username: string) => {
          console.log('User disconnected:', username);
          setConnectedUsers(prev => prev.filter(u => u !== username));
        });

        signalRService.onUserTyping((username: string) => {
          setTypingUsers(prev => {
            if (!prev.includes(username)) {
              return [...prev, username];
            }
            return prev;
          });
        });

        signalRService.onUserStoppedTyping((username: string) => {
          setTypingUsers(prev => prev.filter(u => u !== username));
        });

        signalRService.onCurrentUsers((users: string[]) => {
          console.log('Received current users:', users);
          console.log('Current username:', username);
          console.log('Filtered users (excluding self):', users.filter(u => u !== username));
          setConnectedUsers(users.filter(u => u !== username)); // Exclude yourself
        });

        signalRService.onReactionAdded((data) => {
          setMessageReactions(prev => {
            const reactions = prev[data.messageId] || [];
            const existingReaction = reactions.find(r => r.emoji === data.emoji);
            
            if (existingReaction) {
              return {
                ...prev,
                [data.messageId]: reactions.map(r => 
                  r.emoji === data.emoji 
                    ? { ...r, users: [...r.users, data.username], count: r.count + 1 }
                    : r
                )
              };
            } else {
              return {
                ...prev,
                [data.messageId]: [...reactions, { emoji: data.emoji, users: [data.username], count: 1 }]
              };
            }
          });
        });

        signalRService.onReactionRemoved((data) => {
          setMessageReactions(prev => {
            const reactions = prev[data.messageId] || [];
            
            return {
              ...prev,
              [data.messageId]: reactions
                .map(r => 
                  r.emoji === data.emoji 
                    ? { ...r, users: r.users.filter(u => u !== username), count: r.count - 1 }
                    : r
                )
                .filter(r => r.count > 0)
            };
          });
        });

      } catch (error) {
        console.error('Connection failed:', error);
        soundService.playError();
        Alert.alert('Connection Error', 'Failed to connect to chat server');
      } finally {
        setIsConnecting(false);
      }
    };

    connectToChat();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      signalRService.disconnect();
    };
  }, [token, currentUserId, username]);

  const handleInputChange = (value: string) => {
    setNewMessage(value);

    if (signalRService.isConnected()) {
      if (value.trim() && value.length > 0) {
        signalRService.sendTyping();
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          signalRService.stopTyping();
        }, 3000);
      } else {
        signalRService.stopTyping();
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && signalRService.isConnected()) {
      try {
        signalRService.stopTyping();
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        await signalRService.sendMessage(newMessage.trim());
        soundService.playMessageSent();
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
        soundService.playError();
        Alert.alert('Error', 'Failed to send message');
      }
    }
  };

  const toggleSound = () => {
    const newState = soundService.toggle();
    setSoundEnabled(newState);
  };

  const handleReactionAdd = async (messageId: number, emoji: string) => {
    try {
      await signalRService.addReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleReactionRemove = async (messageId: number, emoji: string) => {
    try {
      await signalRService.removeReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  const getTypingDisplay = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return `${typingUsers.slice(0, 2).join(', ')} and ${typingUsers.length - 2} others are typing...`;
  };

  if (isConnecting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Connecting to chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Modal
        visible={sidebarOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSidebarOpen(false)}
      >
        <View style={styles.sidebarContainer}>
          <View style={styles.sidebar}>
            {/* Mobile Close Button */}
            <View style={styles.sidebarHeader}>
              <TouchableOpacity
                onPress={() => setSidebarOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Server Header */}
            <View style={styles.serverHeader}>
              <View style={styles.serverTitle}>
                <View style={styles.serverIcon}>
                  <Text style={styles.serverIconText}>💬</Text>
                </View>
                <Text style={styles.serverName}>ChatApp</Text>
              </View>
              <View style={styles.connectionStatus}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: signalRService.isConnected() ? '#10B981' : '#EF4444' }
                ]} />
                <Text style={styles.statusText}>
                  {signalRService.isConnected() ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>

            {/* Channels */}
            <View style={styles.channelsSection}>
              <Text style={styles.sectionTitle}>Text Channels</Text>
              <View style={styles.channelItem}>
                <Text style={styles.channelIcon}>#</Text>
                <Text style={styles.channelName}>general</Text>
              </View>
            </View>

            {/* Online Users */}
            <View style={styles.usersSection}>
              <Text style={styles.sectionTitle}>
                Online — {connectedUsers.length + 1}
              </Text>
              
              <ScrollView style={styles.usersList}>
                {/* Current User */}
                <View style={styles.userItem}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.userName}>{username} (You)</Text>
                  <View style={styles.onlineDot} />
                </View>
                
                {/* Other Users */}
                {connectedUsers.map((user, index) => (
                  <View key={index} style={styles.userItem}>
                    <View style={[styles.userAvatar, { backgroundColor: '#4B5563' }]}>
                      <Text style={styles.userAvatarText}>
                        {user.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.userName}>{user}</Text>
                    <View style={styles.onlineDot} />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* User Info with Sound Toggle */}
            <View style={styles.userInfo}>
              {/* Sound Toggle */}
              <View style={styles.soundToggle}>
                <Text style={styles.soundLabel}>Sounds</Text>
                <TouchableOpacity
                  onPress={toggleSound}
                  style={[
                    styles.toggleSwitch,
                    { backgroundColor: soundEnabled ? '#8B5CF6' : '#4B5563' }
                  ]}
                >
                  <View style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: soundEnabled ? 20 : 2 }] }
                  ]} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.currentUser}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userDisplayName}>{username}</Text>
                  <Text style={styles.userStatus}>Online</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chat Area */}
      <View style={styles.chatArea}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <View style={styles.chatHeaderLeft}>
            <TouchableOpacity
              onPress={() => setSidebarOpen(true)}
              style={styles.menuButton}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.channelIcon}>#</Text>
            <Text style={styles.channelName}>general</Text>
          </View>
          <TouchableOpacity onPress={toggleSound} style={styles.soundButton}>
            <Text style={styles.soundIcon}>{soundEnabled ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <View style={styles.messagesContainer}>
          <MessageList 
            messages={messages} 
            currentUserId={currentUserId} 
            currentUsername={username}
            messageReactions={messageReactions}
            onReactionAdd={handleReactionAdd}
            onReactionRemove={handleReactionRemove}
          />
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>{getTypingDisplay()}</Text>
            </View>
          )}
        </View>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={handleInputChange}
              placeholder={signalRService.isConnected() ? 'Message #general' : 'Connecting...'}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={1000}
              editable={signalRService.isConnected()}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || !signalRService.isConnected()) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || !signalRService.isConnected()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // gray-900
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    color: '#D1D5DB',
    marginTop: 16,
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  sidebarContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 288, // w-72 = 288px
    backgroundColor: '#1F2937', // gray-800
    borderRightWidth: 1,
    borderRightColor: '#374151', // gray-700
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  serverHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151', // gray-700
  },
  serverTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serverIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#8B5CF6', // purple-500
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serverIconText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  serverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#9CA3AF', // gray-400
  },
  channelsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF', // gray-400
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.5)', // gray-700/50
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6', // purple-500
  },
  channelIcon: {
    fontSize: 16,
    color: '#9CA3AF', // gray-400
    marginRight: 8,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D1D5DB', // gray-300
  },
  usersSection: {
    padding: 16,
  },
  usersList: {
    maxHeight: 200, // Give it a specific max height instead of flex: 1
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6', // purple-500
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  otherUserAvatar: {
    backgroundColor: '#4B5563', // gray-600
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userName: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB', // gray-300
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981', // green-400
  },
  userInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151', // gray-700
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // gray-800/50
  },
  soundToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  soundLabel: {
    fontSize: 14,
    color: '#9CA3AF', // gray-400
  },
  toggleSwitch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  currentUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  userDisplayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userStatus: {
    fontSize: 12,
    color: '#9CA3AF', // gray-400
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#374151', // gray-700
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937', // gray-800
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563', // gray-600
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
    color: '#9CA3AF', // gray-400
  },
  soundButton: {
    padding: 8,
  },
  soundIcon: {
    fontSize: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    color: '#9CA3AF', // gray-400
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#1F2937', // gray-800
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#4B5563', // gray-600
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#8B5CF6', // purple-600
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
