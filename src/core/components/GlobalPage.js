// GlobalPage.js
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  PanResponder,
  Dimensions
} from 'react-native';

const GlobalPage = forwardRef((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);
  // Add video bubble state
  const [isVideoBubble, setIsVideoBubble] = useState(false);
  const [content, setContent] = useState(null);
  
  // Animation values
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  
  // For video bubble positioning
  const bubblePosition = useRef(new Animated.ValueXY({
    x: Dimensions.get('window').width - 150,
    y: Dimensions.get('window').height / 2
  })).current;
  
  // For video bubble size
  const bubbleSize = useRef(new Animated.Value(1)).current;
  
  // Initialize pan responder for dragging the video bubble
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        bubblePosition.setOffset({
          x: bubblePosition.x._value,
          y: bubblePosition.y._value
        });
        bubblePosition.setValue({ x: 0, y: 0 });
        
        // Slightly scale down when dragging starts
        Animated.spring(bubbleSize, {
          toValue: 0.95,
          friction: 5,
          useNativeDriver: false
        }).start();
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: bubblePosition.x, dy: bubblePosition.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        bubblePosition.flattenOffset();
        
        // Ensure bubble stays within screen bounds
        const maxX = Dimensions.get('window').width - 120;
        const maxY = Dimensions.get('window').height - 120;
        
        let newX = bubblePosition.x._value;
        let newY = bubblePosition.y._value;
        
        if (newX < 0) newX = 0;
        if (newX > maxX) newX = maxX;
        if (newY < 50) newY = 50; // Keep some space from top
        if (newY > maxY) newY = maxY;
        
        Animated.parallel([
          Animated.spring(bubblePosition, {
            toValue: { x: newX, y: newY },
            friction: 5,
            useNativeDriver: false
          }),
          Animated.spring(bubbleSize, {
            toValue: 1,
            friction: 5,
            useNativeDriver: false
          })
        ]).start();
      }
    })
  ).current;
  
  useImperativeHandle(ref, () => ({
    init: (initialState = {}) => {
      const { visible = true, maximized = true, videoBubble = false, content } = initialState;
      setIsVisible(visible);
      setIsMaximized(maximized);
      setIsVideoBubble(videoBubble);
      
      if (content) {
        setContent(content);
        if (props.onContentChange) {
          props.onContentChange(content);
        }
      }
      
      if (visible) {
        if (videoBubble) {
          showAsBubble();
        } else {
          showWithAnimation(maximized);
        }
      }
    },
    maximize: () => {
      setIsMaximized(true);
      setIsVideoBubble(false);
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    },
    minimize: () => {
      setIsMaximized(false);
      setIsVideoBubble(false);
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0.2, // minimized to 20% height
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    },
    // New method to convert to video bubble
    convertToVideoBubble: () => {
      if (!isVisible) {
        setIsVisible(true);
      }
      showAsBubble();
    },
    show: () => {
      setIsVisible(true);
      if (isVideoBubble) {
        showAsBubble();
      } else {
        showWithAnimation(isMaximized);
      }
    },
    hide: () => {
      if (isVideoBubble) {
        // Special animation for hiding the bubble
        Animated.parallel([
          Animated.timing(bubbleSize, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start(() => {
          setIsVisible(false);
          setIsVideoBubble(false);
        });
      } else {
        Animated.parallel([
          Animated.timing(animatedOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(animatedHeight, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start(() => {
          setIsVisible(false);
        });
      }
    },
    toggle: () => {
      if (isVisible) {
        ref.current.hide();
      } else {
        ref.current.show();
      }
    },
    updateContent: (newContent) => {
      setContent(newContent);
      if (props.onContentChange) {
        props.onContentChange(newContent);
      }
    }
  }));
  
  const showWithAnimation = (maximized) => {
    // Reset video bubble state when showing as regular panel
    setIsVideoBubble(false);
    
    // Reset the height value based on maximized state
    animatedHeight.setValue(maximized ? 0 : 0);
    
    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedHeight, {
        toValue: maximized ? 1 : 0.2, // Full height or 20% height
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };
  
  const showAsBubble = () => {
    setIsVideoBubble(true);
    setIsMaximized(false);
    
    // Reset bubble size if needed
    bubbleSize.setValue(0);
    
    // Pop-in animation for the bubble
    Animated.spring(bubbleSize, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };
  
  // Map the animated height value to actual height in styles
  const animatedStyle = {
    opacity: animatedOpacity,
    height: animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [50, props.fullHeight || 500],
    }),
  };
  
  // Video bubble style
  const bubbleStyle = {
    transform: [
      { translateX: bubblePosition.x },
      { translateY: bubblePosition.y },
      { scale: bubbleSize }
    ]
  };
  
  if (!isVisible) {
    return null;
  }
  
  // Render video bubble mode
  if (isVideoBubble) {
    return (
      <Animated.View 
        style={[styles.videoBubble, bubbleStyle]} 
        {...panResponder.panHandlers}
      >
        {/* Video/content area */}
        <View style={styles.bubbleContent}>
          {content ? (
            typeof content === 'string' ? (
              <Text numberOfLines={2} style={styles.bubbleText}>{content}</Text>
            ) : (
              content
            )
          ) : (
            props.videoBubbleContent || <Text style={styles.bubbleText}>Video Content</Text>
          )}
        </View>
        
        {/* Bubble controls */}
        <View style={styles.bubbleControls}>
          <TouchableOpacity
            style={styles.bubbleButton}
            onPress={() => ref.current.maximize()}
          >
            <Text style={styles.bubbleButtonText}>⬆️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bubbleButton}
            onPress={() => ref.current.hide()}
          >
            <Text style={styles.bubbleButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
  
  // Render normal panel mode
  return (
    <Animated.View style={[styles.container, animatedStyle, props.style]}>
      {/* <View style={styles.header}>
        <Text style={styles.headerText}>{props.title || 'Global Page'}</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => ref.current.convertToVideoBubble()}
          >
            <Text>📺</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => isMaximized ? ref.current.minimize() : ref.current.maximize()}
          >
            <Text>{isMaximized ? '▼' : '▲'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => ref.current.hide()}
          >
            <Text>✕</Text>
          </TouchableOpacity>
        </View>
      </View> */}
      
      <View style={styles.content}>
        {/* Show dynamic content or children */}
        {content ? (
          typeof content === 'string' ? (
            <Text>{content}</Text>
          ) : (
            content
          )
        ) : (
          props.children
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    padding: 8,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  // Video bubble styles
  videoBubble: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
    overflow: 'hidden',
  },
  bubbleContent: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleText: {
    textAlign: 'center',
    fontSize: 12,
    padding: 4,
  },
  bubbleControls: {
    flexDirection: 'row',
    height: 26,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bubbleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleButtonText: {
    fontSize: 12,
  }
});

export default GlobalPage;