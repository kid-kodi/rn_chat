import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { styles } from '../chatStyles';

/**
 * CallLogMessage - Displays call logs in chat (like WhatsApp)
 * Shows call type, status, duration, and provides callback option
 */
export default function CallLogMessage({ message, isMyMessage, onCallBack }) {
  const { metadata } = message;
  const {
    callType,
    callStatus,
    callDuration,
    declinedBy,
    cancelledBy,
    endedBy
  } = metadata || {};

  // Determine icon based on call type and status
  const getCallIcon = () => {
    const isOutgoing = isMyMessage;
    const isMissed = callStatus === 'missed' || callStatus === 'declined' || callStatus === 'cancelled';

    // Icon name
    let iconName = callType === 'video' ? 'videocam' : 'call';

    // For outgoing calls
    if (isOutgoing) {
      return isMissed ? `${iconName}-outline` : iconName;
    }

    // For incoming calls
    return isMissed ? `${iconName}-outline` : iconName;
  };

  // Determine icon color based on status
  const getCallColor = () => {
    if (callStatus === 'missed' || callStatus === 'declined') {
      return '#E74C3C'; // Red for missed/declined
    }
    if (callStatus === 'cancelled') {
      return '#95A5A6'; // Gray for cancelled
    }
    if (callStatus === 'completed') {
      return '#27AE60'; // Green for completed
    }
    if (callStatus === 'initiated') {
      return '#3498DB'; // Blue for ongoing/initiated
    }
    return '#3498DB'; // Blue default
  };

  // Format duration (seconds to mm:ss)
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status text
  const getStatusText = () => {
    const isOutgoing = isMyMessage;

    switch (callStatus) {
      case 'initiated':
        return isOutgoing ? 'Calling...' : 'Incoming call...';
      case 'missed':
        return isOutgoing ? 'No answer' : 'Missed call';
      case 'declined':
        return isOutgoing ? 'Declined' : 'Declined call';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        const duration = formatDuration(callDuration);
        return duration || 'Call ended';
      case 'no_answer':
        return 'No answer';
      default:
        return 'Call';
    }
  };

  // Determine if should show arrow icon
  const showArrowIcon = () => {
    const isOutgoing = isMyMessage;
    const isMissed = callStatus === 'missed' || callStatus === 'declined';

    // Show arrow for outgoing calls or incoming missed
    return isOutgoing || isMissed;
  };

  const getArrowIcon = () => {
    const isOutgoing = isMyMessage;
    return isOutgoing ? 'arrow-up-outline' : 'arrow-down-outline';
  };

  return (
    <View style={[
      styles.callLogContainer,
      isMyMessage ? styles.callLogContainerMy : styles.callLogContainerOther
    ]}>
      <View style={styles.callLogContent}>
        {/* Call Icon */}
        <View style={[styles.callLogIconContainer, { backgroundColor: `${getCallColor()}20` }]}>
          <Ionicons
            name={getCallIcon()}
            size={20}
            color={getCallColor()}
          />
        </View>

        {/* Call Info */}
        <View style={styles.callLogInfo}>
          <View style={styles.callLogHeader}>
            <Text style={[styles.callLogTitle, { color: getCallColor() }]}>
              {callType === 'video' ? 'Video call' : 'Voice call'}
            </Text>
            {showArrowIcon() && (
              <Ionicons
                name={getArrowIcon()}
                size={16}
                color={getCallColor()}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          <Text style={styles.callLogStatus}>
            {getStatusText()}
          </Text>
        </View>

        {/* Callback Button (only for completed calls) */}
        {callStatus === 'completed' && onCallBack && (
          <TouchableOpacity
            style={styles.callLogCallbackButton}
            onPress={() => onCallBack(callType)}
          >
            <Ionicons
              name={callType === 'video' ? 'videocam' : 'call'}
              size={20}
              color="#25D366"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Timestamp */}
      <Text style={styles.callLogTime}>
        {moment(message.createdAt).format('HH:mm')}
      </Text>
    </View>
  );
}
