import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSocketStatus } from '../../../contexts/SocketProvider';

/**
 * Socket connection status indicator
 * Shows a small badge when socket is disconnected
 */
export default function SocketStatusIndicator() {
  const socketStatus = useSocketStatus();

  // Only show when disconnected
  if (socketStatus.connected) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.text}>Reconnecting...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
