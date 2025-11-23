/**
 * Format message preview for display in conversation list and chat header
 * Shows appropriate text based on message type (text, image, audio, file, etc.)
 */

/**
 * Get a preview text for a message based on its type and content
 * @param {Object} message - The message object
 * @param {string} currentUserId - Current user's ID to show "Moi: " prefix
 * @returns {string} Formatted preview text
 */
export const getMessagePreview = (message, currentUserId = null) => {
  if (!message) {
    return '';
  }

  // Determine if message is from current user
  const isFromCurrentUser = currentUserId &&
    (message.sender?._id === currentUserId || message.sender === currentUserId);
  const prefix = isFromCurrentUser ? 'Moi: ' : '';

  // Get message type
  const messageType = message.type || 'text';

  // Handle different message types
  switch (messageType.toLowerCase()) {
    case 'image':
      return `${prefix}📷 Photo`;

    case 'video':
      return `${prefix}🎥 Video`;

    case 'audio':
      return `${prefix}🎵 Audio`;

    case 'voice':
      return `${prefix}🎤 Voice message`;

    case 'document':
    case 'file':
      // Try to get file name if available
      const fileName = message.file?.data?.originalname || message.file?.name;
      return fileName ? `${prefix}📄 ${fileName}` : `${prefix}📄 Document`;

    case 'location':
      return `${prefix}📍 Location`;

    case 'contact':
      return `${prefix}👤 Contact`;

    case 'sticker':
      return `${prefix}🎭 Sticker`;

    case 'gif':
      return `${prefix}GIF`;

    case 'text':
    default:
      // For text messages, return the content (truncated if too long)
      const content = message.content || '';

      // If there's a file but type is text, it might be an attachment with caption
      if (message.file && content) {
        const fileIcon = getFileIcon(message.file);
        return `${prefix}${fileIcon} ${content}`;
      }

      // Plain text message
      return content ? `${prefix}${content}` : `${prefix}Message`;
  }
};

/**
 * Get appropriate icon/emoji for file type
 * @param {Object} file - File object
 * @returns {string} Icon/emoji representing the file type
 */
const getFileIcon = (file) => {
  if (!file) return '📄';

  const mimeType = file.data?.mimetype || file.mimetype || '';

  if (mimeType.startsWith('image/')) return '📷';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return '🗜️';

  return '📄';
};

/**
 * Format last message for conversation list with sender name (for group chats)
 * @param {Object} message - The message object
 * @param {string} currentUserId - Current user's ID
 * @param {boolean} isGroupChat - Whether this is a group chat
 * @returns {string} Formatted message with sender name if needed
 */
export const formatLastMessageForList = (message, currentUserId, isGroupChat = false) => {
  if (!message) {
    return '';
  }

  const preview = getMessagePreview(message, currentUserId);

  // For group chats, show sender name if not current user
  if (isGroupChat && message.sender?._id !== currentUserId) {
    const senderName = message.sender?.fullName || message.sender?.name || 'Someone';
    const firstName = senderName.split(' ')[0]; // Get first name only
    return `${firstName}: ${preview.replace('Moi: ', '')}`;
  }

  return preview;
};

/**
 * Get a short file size display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '';

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * Get audio/voice message duration text
 * @param {number} duration - Duration in seconds
 * @returns {string} Formatted duration (e.g., "1:23")
 */
export const formatAudioDuration = (duration) => {
  if (!duration) return '';

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default {
  getMessagePreview,
  formatLastMessageForList,
  formatFileSize,
  formatAudioDuration,
};
