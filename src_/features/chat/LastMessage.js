import { View, Text, StyleSheet } from 'react-native';

export const LastMessage = ({ 
  message, 
  isOwnMessage = false, 
  isRead = false, 
  messageCount = 0,
  isTyping = false,
  maxWidth = 200 
}) => {
  const formatMessage = (msg) => {
    if (!msg) return '';
    
    const { type, content, senderName } = msg;
    
    switch (type) {
      case 'text':
        return content;
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎵 Audio';
      case 'document':
        return '📄 Document';
      case 'location':
        return '📍 Location';
      case 'contact':
        return '👤 Contact';
      case 'sticker':
        return '🎭 Sticker';
      case 'gif':
        return 'GIF';
      case 'deleted':
        return isOwnMessage ? 'You deleted this message' : 'This message was deleted';
      default:
        return content || '';
    }
  };

  const getMessagePrefix = () => {
    if (isTyping) return '';
    if (isOwnMessage) return 'You: ';
    if (message?.isGroupMessage && message?.senderName) {
      return `${message.senderName}: `;
    }
    return '';
  };

  const getMessageText = () => {
    if (isTyping) return 'typing...';
    return formatMessage(message);
  };

  const getTextColor = () => {
    if (isTyping) return '#25D366'; // WhatsApp green
    if (messageCount > 0) return '#000'; // Unread message
    return '#8E8E93'; // Read message (iOS gray)
  };

  const getFontWeight = () => {
    if (messageCount > 0) return '600';
    return '400';
  };

  return (
    <View style={[styles.container, { maxWidth }]}>
      <Text 
        style={[
          styles.messageText,
          { 
            color: getTextColor(),
            fontWeight: getFontWeight(),
            fontStyle: isTyping ? 'italic' : 'normal'
          }
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {getMessagePrefix()}{getMessageText()}
      </Text>
      
      {/* Message count badge */}
      {messageCount > 0 && !isTyping && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {messageCount > 999 ? '999+' : messageCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});