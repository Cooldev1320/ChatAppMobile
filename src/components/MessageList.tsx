import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Message } from '../types/auth';
import MessageReactions from './MessageReactions';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  currentUsername: string;
  messageReactions?: Record<number, Array<{ emoji: string; users: string[]; count: number }>>;
  onReactionAdd?: (messageId: number, emoji: string) => Promise<void>;
  onReactionRemove?: (messageId: number, emoji: string) => Promise<void>;
}

export default function MessageList({ 
  messages, 
  currentUserId, 
  currentUsername, 
  messageReactions = {}, 
  onReactionAdd, 
  onReactionRemove 
}: MessageListProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString();
  };

  const handleReactionAdd = async (messageId: number, emoji: string) => {
    if (onReactionAdd) {
      await onReactionAdd(messageId, emoji);
    }
  };

  const handleReactionRemove = async (messageId: number, emoji: string) => {
    if (onReactionRemove) {
      await onReactionRemove(messageId, emoji);
    }
  };

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyTitle}>Welcome to #general!</Text>
        <Text style={styles.emptySubtitle}>This is the beginning of the #general channel.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
      {messages.map((message) => {
        const messageUserId = message.userId || message.user?.id;
        const messageUsername = message.username || message.user?.username || 'Unknown';
        const isOwnMessage = messageUserId === currentUserId;
        
        return (
          <View key={message.id} style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
          ]}>
            <View style={[
              styles.messageWrapper,
              isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper,
            ]}>
              {/* User Avatar */}
              <View style={[
                styles.userAvatar,
                isOwnMessage ? styles.ownUserAvatar : styles.otherUserAvatar,
              ]}>
                <Text style={styles.userAvatarText}>
                  {messageUsername.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              {/* Message Content */}
              <View style={styles.messageContent}>
                <View style={[
                  styles.messageBubble,
                  isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
                ]}>
                  {!isOwnMessage && (
                    <Text style={styles.username}>{messageUsername}</Text>
                  )}
                  <Text style={[
                    styles.messageText,
                    isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                  ]}>
                    {message.content}
                  </Text>
                  <Text style={[
                    styles.timestamp,
                    isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
                  ]}>
                    {formatTime(message.createdAt)}
                  </Text>
                </View>
                
                <MessageReactions
                  messageId={message.id}
                  reactions={messageReactions[message.id] || []}
                  currentUsername={currentUsername}
                  onReactionAdd={handleReactionAdd}
                  onReactionRemove={handleReactionRemove}
                />
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 16,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '80%',
  },
  ownMessageWrapper: {
    flexDirection: 'row-reverse',
  },
  otherMessageWrapper: {
    flexDirection: 'row',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  ownUserAvatar: {
    backgroundColor: '#8B5CF6', // purple-500
  },
  otherUserAvatar: {
    backgroundColor: '#4B5563', // gray-600
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageContent: {
    flex: 1,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  ownMessageBubble: {
    backgroundColor: '#8B5CF6', // purple-600
  },
  otherMessageBubble: {
    backgroundColor: '#4B5563', // gray-600
  },
  username: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB', // gray-300
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#F3F4F6', // gray-100
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTimestamp: {
    color: '#C4B5FD', // purple-200
  },
  otherTimestamp: {
    color: '#9CA3AF', // gray-400
  },
});
