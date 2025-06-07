import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import CallKeepService from '../services/CallKeepService';

const CallKeepImp = () => {
  const [callActive, setCallActive] = useState(false);

  useEffect(() => {
    // Initialize when component mounts
    CallKeepService.initialize();

    return () => {
      // Optional: Clean up when component unmounts
      // CallKeepService.cleanup();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      
      return (
        granted['android.permission.READ_PHONE_STATE'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.CALL_PHONE'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  const handleIncomingCall = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      console.warn('Required permissions not granted');
      return;
    }

    try {
      await CallKeepService.displayIncomingCall(
        'John Doe', 
        '+1 555-123-4567'
      );
      setCallActive(true);
    } catch (error) {
      console.error('Failed to display call:', error);
    }
  };

  const handleEndCall = () => {
    CallKeepService.endCurrentCall();
    setCallActive(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CallKeep Demo</Text>
      
      <Button
        title="Simulate Incoming Call"
        onPress={handleIncomingCall}
        disabled={callActive}
      />
      
      {callActive && (
        <Button
          title="End Call"
          onPress={handleEndCall}
          color="red"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default CallKeepImp;