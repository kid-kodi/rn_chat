import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_API_URL } from '@env';
import ThumbnailWithPlayButton from './ThumbnailWithPlayButton';

const VideoPlayerModal = ({ uri, visible, onClose }) => {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  return (
    <Modal visible={visible} transparent={false}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={28} color="white" />
        </TouchableOpacity>
        
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.videoPlayer}
          resizeMode="contain"
          controls={isReady} // Only enable after ready
          paused={!visible}
          onReadyForDisplay={() => setIsReady(true)}
          onLoad={() => setIsReady(true)}
          // bufferConfig={{
          //   minBufferMs: 15000,
          //   maxBufferMs: 30000,
          //   bufferForPlaybackMs: 2500,
          //   bufferForPlaybackAfterRebufferMs: 5000
          // }}
          ignoreSilentSwitch="obey"
          playWhenInactive={false}
          playInBackground={false}
        />
      </View>
    </Modal>
  );
};

const VideoMessage = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const videoUri = `${BASE_API_URL}/image/${message?.file?.name}`; // Changed from /image/ to /media/

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <ThumbnailWithPlayButton uri={`${BASE_API_URL}/thumbnails/${message?.file?.name}`} />
      </TouchableOpacity>
      
      <VideoPlayerModal 
        uri={videoUri}
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
});

export default VideoMessage;