import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Sound from 'react-native-sound';

const { width } = Dimensions.get('window');

const AudioMessageItem = ({
  audioUri,
  duration = 30,
  isOutgoing = false,
  timestamp,
  onPlay,
  onPause,
  waveformData = [0.3, 0.7, 0.5, 0.9, 0.4, 0.8, 0.6, 0.2, 0.9, 0.5, 0.7, 0.3, 0.8, 0.4, 0.6],
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const waveAnimValues = useRef(
    waveformData.map(() => new Animated.Value(1))
  ).current;

  // Initialize sound
  useEffect(() => {
    if (audioUri) {
      const soundInstance = new Sound(audioUri, '', (error) => {
        if (error) {
          console.log('Failed to load sound', error);
          return;
        }
        setSound(soundInstance);
      });

      return () => {
        if (soundInstance) {
          soundInstance.release();
        }
      };
    }
  }, [audioUri]);

  // Pulse animation
  useEffect(() => {
    if (isPlaying) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isPlaying) pulse();
        });
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, pulseAnim]);

  // Waveform animation
  useEffect(() => {
    if (isPlaying) {
      const animateWaves = () => {
        const animations = waveAnimValues.map((anim, index) => 
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: Math.random() * 0.5 + 0.5,
                duration: 300 + Math.random() * 200,
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: Math.random() * 0.5 + 1,
                duration: 300 + Math.random() * 200,
                useNativeDriver: true,
              }),
            ])
          )
        );
        
        Animated.stagger(50, animations).start();
      };
      animateWaves();
    } else {
      waveAnimValues.forEach(anim => {
        anim.stopAnimation();
        anim.setValue(1);
      });
    }
  }, [isPlaying, waveAnimValues]);

  const togglePlayPause = () => {
    if (!sound) return;

    if (isPlaying) {
      sound.pause();
      setIsPlaying(false);
      onPause && onPause();
    } else {
      sound.play((success) => {
        if (success) {
          setIsPlaying(false);
          setCurrentTime(0);
          progressAnim.setValue(0);
        }
      });
      setIsPlaying(true);
      onPlay && onPlay();
      
      // Animate progress
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const PlayIcon = () => (
    <View style={styles.playIconContainer}>
      <View style={[styles.playIcon, isOutgoing && styles.playIconOutgoing]} />
    </View>
  );

  const PauseIcon = () => (
    <View style={styles.pauseIconContainer}>
      <View style={[styles.pauseBar, isOutgoing && styles.pauseBarOutgoing]} />
      <View style={[styles.pauseBar, isOutgoing && styles.pauseBarOutgoing]} />
    </View>
  );

  return (
    <View style={[styles.container, isOutgoing && styles.containerOutgoing]}>
      <Animated.View style={[styles.playButton, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity onPress={togglePlayPause} style={styles.playButtonTouchable}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.waveformContainer}>
        <View style={styles.waveform}>
          {waveformData.map((height, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: height * 20,
                  backgroundColor: isOutgoing ? '#000' : '#007AFF',
                  transform: [{ scaleY: waveAnimValues[index] }],
                },
              ]}
            />
          ))}
        </View>
        
        <Animated.View
          style={[
            styles.progressOverlay,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          {waveformData.map((height, index) => (
            <View
              key={index}
              style={[
                styles.waveformBar,
                styles.waveformBarPlayed,
                { height: height * 20 },
              ]}
            />
          ))}
        </Animated.View>
      </View>

      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, isOutgoing && styles.timeTextOutgoing]}>
          {currentTime || duration}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    padding: 8,
    marginVertical: 2,
    maxWidth: width * 0.7,
    minWidth: 200,
  },
  containerOutgoing: {
    backgroundColor: '#D1FFBD',
    alignSelf: 'flex-end',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: '#fff',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  playIconOutgoing: {
    borderLeftColor: '#000',
  },
  pauseIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 8,
    height: 12,
  },
  pauseBar: {
    width: 2,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  pauseBarOutgoing: {
    backgroundColor: '#000',
  },
  waveformContainer: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 8,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    justifyContent: 'space-between',
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
    marginHorizontal: 0.5,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  waveformBarPlayed: {
    backgroundColor: '#34D399',
    width: 2,
    borderRadius: 1,
    marginHorizontal: 0.5,
  },
  timeContainer: {
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
  },
  timeTextOutgoing: {
    color: '#000',
  },
});

export default AudioMessageItem;