import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../../../components/Screen';
import { styles } from '../chatStyles';

/**
 * Empty chat screen shown when creating a new chat
 */
const EmptyChatScreen = memo(({ onCreateChat, onBack }) => {
  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.contactName}>New Chat</Text>
      </View>

      <View style={styles.newChatContainer}>
        <Ionicons name="chatbubble-ellipses-outline" size={80} color="#ccc" />
        <Text style={styles.newChatTitle}>Start a Conversation</Text>
        <Text style={styles.newChatSubtitle}>
          Send your first message to begin chatting
        </Text>

        <TouchableOpacity
          style={styles.sendFirstMessageButton}
          onPress={onCreateChat}
        >
          <Text style={styles.sendFirstMessageButtonText}>Say Hi!</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
});

EmptyChatScreen.displayName = 'EmptyChatScreen';

export default EmptyChatScreen;
