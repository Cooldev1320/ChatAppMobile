import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import EmojiPicker from './EmojiPicker';

interface MessageReactionsProps {
  messageId: number;
  reactions: Array<{ emoji: string; users: string[]; count: number }>;
  currentUsername: string;
  onReactionAdd?: (messageId: number, emoji: string) => Promise<void>;
  onReactionRemove?: (messageId: number, emoji: string) => Promise<void>;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function MessageReactions({
  messageId,
  reactions,
  currentUsername,
  onReactionAdd,
  onReactionRemove,
}: MessageReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleReactionPress = async (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    const hasUserReacted = existingReaction?.users.includes(currentUsername);

    try {
      if (hasUserReacted && onReactionRemove) {
        await onReactionRemove(messageId, emoji);
      } else if (onReactionAdd) {
        await onReactionAdd(messageId, emoji);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const renderReaction = (reaction: { emoji: string; users: string[]; count: number }) => {
    const hasUserReacted = reaction.users.includes(currentUsername);
    
    return (
      <TouchableOpacity
        key={reaction.emoji}
        style={[
          styles.reactionButton,
          hasUserReacted && styles.reactionButtonActive,
        ]}
        onPress={() => handleReactionPress(reaction.emoji)}
      >
        <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
        <Text style={[
          styles.reactionCount,
          hasUserReacted && styles.reactionCountActive,
        ]}>
          {reaction.count}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleEmojiSelect = (emoji: string) => {
    if (onReactionAdd) {
      onReactionAdd(messageId, emoji);
    }
  };

  const renderAddReactionButton = () => (
    <TouchableOpacity
      style={styles.addReactionButton}
      onPress={() => setShowEmojiPicker(true)}
    >
      <Text style={styles.addReactionText}>+</Text>
    </TouchableOpacity>
  );

  if (reactions.length === 0) {
    return (
      <View style={styles.container}>
        {renderAddReactionButton()}
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {reactions.map(renderReaction)}
        {renderAddReactionButton()}
      </View>
      
      <EmojiPicker
        visible={showEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        onClose={() => setShowEmojiPicker(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reactionButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  reactionCountActive: {
    color: '#8B5CF6',
  },
  addReactionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addReactionText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
});
