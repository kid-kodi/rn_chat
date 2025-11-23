import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { BASE_API_URL } from '@env';

/**
 * AudioMessage Component
 * WhatsApp-style audio player with:
 * - Play/Pause functionality
 * - Animated pulse bars
 * - Duration display
 * - Progress tracking
 * - Supports both 'voice' (recorded) and 'audio' (uploaded) types
 */
const AudioMessage = ({ message, isUserMessage, isVoiceNote = false, onLongPress }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  // Animated values for pulse bars
  const pulseAnims = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    // Get audio duration on mount
    getAudioDuration();

    return () => {
      // Cleanup on unmount
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isPlaying]);

  /**
   * Start pulse animation for audio bars
   */
  const startPulseAnimation = () => {
    const animations = pulseAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 300 + (index % 3) * 100,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 300 + (index % 3) * 100,
            useNativeDriver: true,
          }),
        ])
      );
    });

    Animated.stagger(50, animations).start();
  };

  /**
   * Stop pulse animation
   */
  const stopPulseAnimation = () => {
    pulseAnims.forEach(anim => {
      anim.stopAnimation();
      anim.setValue(0.3);
    });
  };

  /**
   * Format time in MM:SS
   */
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Get audio duration from metadata or by preparing the audio
   */
  const getAudioDuration = async () => {
    try {
      // First, check if duration is stored in the message metadata
      if (message.file?.data?.duration) {
        setDuration(message.file.data.duration);
        console.log('Duration from metadata:', message.file.data.duration);
        return;
      }

      // If not, we need to prepare the audio to get duration
      // const audioUrl = `${BASE_API_URL}/image/${message.file.data.filename}`;
      // console.log('Getting duration for:', audioUrl);

      // // Start player briefly to get metadata
      // await audioRecorderPlayer.startPlayer(audioUrl);

      // // Set up listener
      // const subscription = audioRecorderPlayer.addPlayBackListener((e) => {
      //   if (e.duration > 0 && duration === 0) {
      //     console.log('Got duration from playback:', e.duration);
      //     setDuration(e.duration);
      //   }
      // });

      // // Stop after a short delay
      // setTimeout(async () => {
      //   try {
      //     await audioRecorderPlayer.stopPlayer();
      //     audioRecorderPlayer.removePlayBackListener();
      //   } catch (err) {
      //     console.error('Error stopping duration check:', err);
      //   }
      // }, 200);
    } catch (error) {
      console.error('Error getting audio duration:', error);
    }
  };

  /**
   * Play audio
   */
  const playAudio = async () => {
    try {
      const audioUrl = `${BASE_API_URL}/image/${message.file.data.filename}`;
      console.log('Playing audio:', audioUrl);

      const msg = await audioRecorderPlayer.startPlayer(audioUrl);
      console.log('Audio started:', msg);

      audioRecorderPlayer.addPlayBackListener((e) => {
        setCurrentTime(e.currentPosition);
        setDuration(e.duration);

        // Check if audio finished
        if (e.currentPosition >= e.duration && e.duration > 0) {
          onAudioComplete();
        }
      });

      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  /**
   * Pause audio
   */
  const pauseAudio = async () => {
    try {
      await audioRecorderPlayer.pausePlayer();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  /**
   * Stop audio (cleanup)
   */
  const stopAudio = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setCurrentTime(0);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  /**
   * Handle audio completion
   */
  const onAudioComplete = async () => {
    setIsPlaying(false);
    setCurrentTime(0);
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
  };

  /**
   * Toggle play/pause
   */
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      if (currentTime > 0 && currentTime < duration) {
        // Resume from pause
        audioRecorderPlayer.resumePlayer();
        setIsPlaying(true);
      } else {
        // Start from beginning
        playAudio();
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={1}
    >
      {/* Voice Note Icon (only for recorded audio) */}
      {isVoiceNote && (
        <View style={styles.voiceIconContainer}>
          <Ionicons
            name="mic"
            size={14}
            color={isUserMessage ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.7)'}
          />
        </View>
      )}

      {/* Play/Pause Button */}
      <TouchableOpacity
        style={[
          styles.playButton,
          { backgroundColor: isUserMessage ? '#128C7E' : '#075E54' }
        ]}
        onPress={togglePlayPause}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Audio Visualizer - Pulse Bars */}
      <View style={styles.waveformContainer}>
        {pulseAnims.map((anim, index) => {
          const scaleY = anim.interpolate({
            inputRange: [0.3, 1],
            outputRange: [0.4, 1.2],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  transform: [{ scaleY }],
                  backgroundColor: isUserMessage
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(255, 255, 255, 0.6)',
                },
              ]}
            />
          );
        })}
      </View>

      {/* Duration */}
      <Text style={[
        styles.duration,
        { color: isUserMessage ? '#000' : '#fff' }
      ]}>
        {currentTime > 0 ? formatTime(currentTime) : formatTime(duration)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 200,
  },
  voiceIconContainer: {
    marginRight: 8,
    opacity: 0.7,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  waveformBar: {
    width: 3,
    height: 16,
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
  duration: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
    minWidth: 40,
  },
});

export default AudioMessage;
