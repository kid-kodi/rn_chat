import React, { memo, forwardRef } from 'react';
import { FlatList, View, ActivityIndicator, Text } from 'react-native';
import { TypingIndicator } from '../../../components/TypingIndicator';
import MessageItem from './MessageItem';
import { styles } from '../chatStyles';

/**
 * Message list component with infinite scroll
 */
const MessageList = forwardRef(({
  messages,
  userId,
  contactInfo,
  isGroupChat,
  isTyping,
  loadingMore,
  onEndReached,
  keyExtractor,
  onImagePress,
  isSelectMode,
  selectedMessages,
  onMessageLongPress,
  onMessageSelect,
  onCallBack
}, ref) => {
  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender?._id === userId || item.sender === userId;
    const isSelected = selectedMessages?.includes(item._id);

    return (
      <MessageItem
        item={item}
        isMyMessage={isMyMessage}
        contactInfo={contactInfo}
        isGroupChat={isGroupChat}
        onImagePress={onImagePress}
        isSelectMode={isSelectMode}
        isSelected={isSelected}
        onLongPress={() => onMessageLongPress?.(item._id)}
        onPress={() => isSelectMode && onMessageSelect?.(item._id)}
        onCallBack={onCallBack}
      />
    );
  };

  const renderLoadingHeader = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingMoreText}>Loading more messages...</Text>
      </View>
    );
  };

  const renderTypingFooter = () => {
    if (!isTyping) return null;

    return <TypingIndicator isVisible={isTyping} />;
  };

  return (
    <FlatList
      ref={ref}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.messagesList}
      style={styles.flex1}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      // inverted
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
      ListHeaderComponent={renderLoadingHeader}
      ListFooterComponent={renderTypingFooter}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      keyboardShouldPersistTaps="always"
      // keyboardDismissMode="on-drag"
      nestedScrollEnabled={true}
      scrollEnabled={true}
    />
  );
});

MessageList.displayName = 'MessageList';

export default memo(MessageList);
