import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useApi } from '../../contexts/ApiProvider';
import { useUser } from '../../contexts/UserProvider';
import { useConversation } from '../../contexts/ConversationProvider';
import CustomImageView from '../../components/CustomImage';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Colors from '../../constants/Colors';
import { BASE_API_URL } from '@env';
import { navigate } from '../../utils/RootNavigation';
import uuid from 'react-native-uuid';

/**
 * CallLogs Screen
 * Displays the user's call history with options to view details and initiate new calls
 */
export default function CallLogs() {
  const api = useApi();
  const { user } = useUser();
  const { setChat } = useConversation();

  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch call logs
  const fetchCallLogs = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(`/api/call/logs?page=${pageNum}&limit=20`);

      if (response.success) {
        if (refresh || pageNum === 1) {
          setCalls(response.calls);
        } else {
          setCalls(prev => [...prev, ...response.calls]);
        }

        setHasMore(response.pagination.page < response.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api]);

  useEffect(() => {
    fetchCallLogs(1);
  }, []);

  // Refresh handler
  const handleRefresh = () => {
    fetchCallLogs(1, true);
  };

  // Load more handler
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchCallLogs(page + 1);
    }
  };

  // Format call duration
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format call date
  const formatDate = (date) => {
    const callDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (callDate.toDateString() === today.toDateString()) {
      return callDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    // Check if yesterday
    if (callDate.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    }

    // Otherwise return date
    return callDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  // Get call status icon and color
  const getCallStatus = (call) => {
    const isOutgoing = call.callerId._id === user._id;

    // For calls with participants array, check user's specific status
    const userParticipant = call.participants?.find(
      p => p.userId?._id === user._id || p.userId === user._id
    );

    // Determine user's participation status
    let userStatus = call.status;
    if (userParticipant) {
      if (['declined', 'missed'].includes(userParticipant.status)) {
        userStatus = userParticipant.status;
      } else if (userParticipant.status === 'joined' && call.status === 'ended') {
        userStatus = 'ended';
      }
    }

    // For group calls, show different indicators
    if (call.isGroupCall) {
      switch (userStatus) {
        case 'missed':
          return { icon: 'people', color: Colors.red, text: 'Manqué' };
        case 'declined':
          return { icon: 'people', color: Colors.red, text: 'Refusé' };
        case 'ended':
        case 'ongoing':
          return {
            icon: isOutgoing ? 'people-outline' : 'people',
            color: Colors.green,
            text: formatDuration(userParticipant?.duration || call.duration)
          };
        default:
          return { icon: 'people-outline', color: Colors.grey, text: userStatus };
      }
    }

    // For 1-on-1 calls
    switch (userStatus) {
      case 'missed':
        return { icon: 'call', color: Colors.red, text: 'Manqué' };
      case 'declined':
        return { icon: 'call', color: Colors.red, text: 'Refusé' };
      case 'ended':
      case 'ongoing':
        return {
          icon: isOutgoing ? 'call-outline' : 'call',
          color: Colors.green,
          text: formatDuration(userParticipant?.duration || call.duration)
        };
      default:
        return { icon: 'call-outline', color: Colors.grey, text: userStatus };
    }
  };

  // Get contact name from chat
  const getContactName = (call) => {
    if (call.chatId?.isGroupChat) {
      return call.chatId.chatName;
    }

    // For 1-on-1 chats, show the other user's name
    const otherUser = call.chatId?.users?.find(u => u._id !== user._id);
    return otherUser?.fullName || call.callerId.fullName;
  };

  // Get contact image
  const getContactImage = (call) => {
    if (call.chatId?.isGroupChat && call.chatId?.image?.name) {
      return call.chatId.image.name;
    }

    // For 1-on-1 chats, show the other user's profile picture
    const otherUser = call.chatId?.users?.find(u => u._id !== user._id);
    return otherUser?.profilePicture || call.callerId.profilePicture;
  };

  // Handle call back
  const handleCallBack = async (call) => {
    try {
      const callId = uuid.v4();
      const callData = {
        chatId: call.chatId._id,
        callId,
        callType: call.callType,
        caller: user,
      };

      const response = await api.post(`/api/call/initiate-call`, callData);
      if (response.chat) {
        setChat(response.chat);
      }

      navigate('CALL', {
        chatId: callData.chatId,
        cameraStatus: callData.callType === "video",
        microphoneStatus: false,
      });
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  // Navigate to chat
  const handleNavigateToChat = (call) => {
    navigate('CHAT', { chatId: call.chatId._id });
  };

  // Render call item
  const renderCallItem = ({ item: call }) => {
    const status = getCallStatus(call);
    const contactName = getContactName(call);
    const contactImage = getContactImage(call);
    const isOutgoing = call.callerId._id === user._id;

    return (
      <TouchableOpacity
        style={styles.callItem}
        onPress={() => handleNavigateToChat(call)}
      >
        <CustomImageView
          source={`${BASE_API_URL}/image/${contactImage}`}
          firstName={contactName}
          size={50}
          fontSize={24}
        />

        <View style={styles.callInfo}>
          <Text style={styles.contactName}>{contactName}</Text>
          <View style={styles.callMeta}>
            <Icon
              name={status.icon}
              size={16}
              color={status.color}
              style={[
                styles.callIcon,
                isOutgoing && call.status === 'ended' && styles.outgoingIcon
              ]}
            />
            <Text style={[styles.callStatus, { color: status.color }]}>
              {status.text}
            </Text>
            <Text style={styles.callTime}> • {formatDate(call.startedAt)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCallBack(call)}
        >
          <Icon
            name={call.callType === 'video' ? 'videocam' : 'call'}
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="call-outline" size={64} color={Colors.lightGrey} />
      <Text style={styles.emptyText}>Aucun appel</Text>
      <Text style={styles.emptySubtext}>Vos appels récents apparaîtront ici</Text>
    </View>
  );

  // Footer loader
  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  if (loading && page === 1) {
    return (
      <Screen>
        <Header leftText="Appels" />
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header leftText="Appels" />
      <FlatList
        data={calls}
        renderItem={renderCallItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={calls.length === 0 && styles.emptyContainer}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  callInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textColor,
    marginBottom: 4,
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callIcon: {
    marginRight: 4,
  },
  outgoingIcon: {
    transform: [{ rotate: '135deg' }],
  },
  callStatus: {
    fontSize: 14,
  },
  callTime: {
    fontSize: 14,
    color: Colors.grey,
  },
  callButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textColor,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
