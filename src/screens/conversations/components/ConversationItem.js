// components/ConversationItem.jsx
import React from 'react';
import DataItem from '../../../components/DataItem';
import { formatChatDate } from '../../../utils/Utility';
import { useConversation } from '../../../contexts/ConversationProvider';
import { formatLastMessageForList } from '../../../utils/messageFormatter';

const ConversationItem = ({
  onLongPress,
  chat,
  unreadMessages,
  onPress,
  type,
  isChecked,
  onJoinCall,
  currentUserId
}) => {
  const { getUnreadCount } = useConversation();
  const isGroup = chat.isGroupChat;
  const user = chat.users.find(user => user._id !== currentUserId);

  // Get unread count for this chat
  const unreadCount = getUnreadCount(chat._id);

  // Format last message based on type (image, audio, file, etc.)
  const lastMessagePreview = chat.lastMessage
    ? formatLastMessageForList(chat.lastMessage, currentUserId, isGroup)
    : (user?.about || 'Say hi! 👋');

  return (
    <DataItem
      title={isGroup ? chat.chatName : user?.fullName}
      subTitle={lastMessagePreview}
      rightText={formatChatDate(chat.lastMessage?.createdAt)}
      unreadCount={unreadCount}
      image={isGroup ? chat?.image?.name : user?.profilePicture}
      onPress={() => onPress(chat)}
      ongoingCall={chat.ongoingCall}
      joinCall={() => onJoinCall(chat)}
      onLongPress={onLongPress}
      type={type}
      isChecked={isChecked}
    />
  );
};

export default ConversationItem;
