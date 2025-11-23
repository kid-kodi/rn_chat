import React, { useState, useRef } from 'react';
import { 
  View, 
  PanResponder, 
  Animated, 
  Dimensions, 
  StyleSheet, 
  TouchableOpacity,
  Text 
} from 'react-native';
import { navigate } from './RootNavigation';

const BUBBLE_SIZE = 80; // Size of the video bubble
const WINDOW = Dimensions.get('window');

const DraggableVideoBubble = ({ 
  videoComponent, 
  onExpand, 
  onMinimize, 
  onClose 
}) => {
  // Track if we're dragging to differentiate from taps
  const [isDragging, setIsDragging] = useState(false);
  // Track touch start time for tap detection
  const touchStartTime = useRef(0);
  
  // Animated values for position
  const pan = useRef(new Animated.ValueXY({ 
    x: WINDOW.width - BUBBLE_SIZE - 20, 
    y: 100 
  })).current;
  
  // Create the pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to movements with significant distance
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: (evt) => {
        // Track when touch started for tap detection
        touchStartTime.current = Date.now();
        setIsDragging(false);
        
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        // If we've moved more than a threshold, consider it a drag
        if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
          setIsDragging(true);
        }
        
        Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          { useNativeDriver: false }
        )(evt, gestureState);
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        
        // Detect tap - short press without much movement
        const touchTime = Date.now() - touchStartTime.current;
        if (!isDragging && touchTime < 300) {
          console.log("Tap detected on video bubble!");
          onExpand && onExpand();
          return;
        }
        
        // If it was a drag, handle edge snapping
        let posX = pan.x._value;
        let posY = pan.y._value;
        
        // Snap to right edge if close
        if (posX > WINDOW.width - BUBBLE_SIZE - 40) {
          posX = WINDOW.width - BUBBLE_SIZE - 20;
        }
        // Snap to left edge if close
        else if (posX < 40) {
          posX = 20;
        }
        
        // Ensure bubble stays within vertical bounds
        posY = Math.max(50, Math.min(WINDOW.height - BUBBLE_SIZE - 20, posY));
        
        Animated.spring(pan, {
          toValue: { x: posX, y: posY },
          useNativeDriver: false,
          friction: 5
        }).start();
        
        // Reset dragging state
        setIsDragging(false);
      }
    })
  ).current;
  
  return (
    <Animated.View
      style={[
        styles.bubble,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.videoWrapper}>
        {videoComponent}
      </View>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={onClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: '#000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  videoWrapper: {
    flex: 1,
    borderRadius: BUBBLE_SIZE / 2,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DraggableVideoBubble;