import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  FlatList,
  TouchableOpacity,
  Text,
  StatusBar,
  Platform,
  ActivityIndicator,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_API_URL } from '@env';
const THUMBNAIL_SIZE = 60;
const THUMBNAIL_MARGIN = 8;

/**
 * Image Gallery Viewer Component with Native Behavior
 * Features:
 * - Native image zoom and pan
 * - Horizontal swipe between images
 * - Bottom thumbnail strip
 * - Smooth animations
 */
const ImageGalleryViewer = ({ visible, images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const thumbnailScrollRef = useRef(null);
  const opacity = useRef(new Animated.Value(1)).current;
  const thumbnailOpacity = useRef(new Animated.Value(1)).current;
  const navHintOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      // Scroll to selected thumbnail after a short delay
      setTimeout(() => {
        scrollToThumbnail(initialIndex);
      }, 300);

      // Show navigation hint on first load if there are multiple images
      if (images.length > 1) {
        Animated.sequence([
          Animated.timing(navHintOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(navHintOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [visible, initialIndex]);

  const scrollToThumbnail = (index) => {
    if (thumbnailScrollRef.current) {
      thumbnailScrollRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const handleIndexChange = (index) => {
    setCurrentIndex(index);
    scrollToThumbnail(index);
  };

  const handleThumbnailPress = (index) => {
    setCurrentIndex(index);
    // The ImageViewer will automatically update when currentIndex changes
  };

  const navigatePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const navigateNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const toggleControls = () => {
    Animated.timing(opacity, {
      toValue: opacity._value === 1 ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const toggleThumbnails = () => {
    const newValue = showThumbnails ? 0 : 1;
    setShowThumbnails(!showThumbnails);

    Animated.timing(thumbnailOpacity, {
      toValue: newValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  if (!visible || images.length === 0) {
    return null;
  }

  // Prepare images for ImageViewer
  const imageUrls = images.map((item) => ({
    url: `${BASE_API_URL}/image/${item.file.data.filename}`,
    props: {
      // Additional props can be passed here
    },
  }));

  const renderThumbnail = (item, index) => {
    const isSelected = index === currentIndex;
    const imageUrl = `${BASE_API_URL}/image/${item.file.data.filename}`;

    return (
      <TouchableOpacity
        key={`thumb-${item._id}-${index}`}
        onPress={() => handleThumbnailPress(index)}
        style={[
          styles.thumbnailContainer,
          isSelected && styles.thumbnailSelected,
        ]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {isSelected && <View style={styles.thumbnailOverlay} />}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity }]}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={30} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.counterText}>
        {currentIndex + 1} / {images.length}
      </Text>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {/* Caption */}
      <Animated.View style={{ opacity }}>
        {images[currentIndex]?.content && (
          <Text style={styles.captionText} numberOfLines={2}>
            {images[currentIndex].content}
          </Text>
        )}
        <Text style={styles.dateText}>
          {new Date(images[currentIndex]?.createdAt).toLocaleString()}
        </Text>

        {/* Toggle Thumbnails Button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleThumbnails}
        >
          <Ionicons
            name={showThumbnails ? "chevron-down" : "chevron-up"}
            size={24}
            color="#fff"
          />
          <Text style={styles.toggleButtonText}>
            {showThumbnails ? "Hide Thumbnails" : "Show Thumbnails"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Thumbnail Strip with FlatList */}
      {showThumbnails && (
        <View style={styles.thumbnailStripContainer}>
          <FlatList
            ref={thumbnailScrollRef}
            data={images}
            renderItem={({ item, index }) => renderThumbnail(item, index)}
            keyExtractor={(item, index) => `thumbnail-${item._id}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_data, index) => ({
              length: THUMBNAIL_SIZE + THUMBNAIL_MARGIN * 2,
              offset: (THUMBNAIL_SIZE + THUMBNAIL_MARGIN * 2) * index,
              index,
            })}
            initialScrollIndex={initialIndex}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                thumbnailScrollRef.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                  viewPosition: 0.5,
                });
              }, 100);
            }}
            contentContainerStyle={styles.thumbnailStripContent}
          />
        </View>
      )}
    </View>
  );

  const renderIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );

  const renderNavigationHints = () => (
    <>
      {/* Left Navigation Button */}
      {currentIndex > 0 && (
        <Animated.View style={[styles.navButton, styles.navButtonLeft, { opacity }]}>
          <TouchableOpacity onPress={navigatePrevious} style={styles.navButtonInner}>
            <Ionicons name="chevron-back" size={32} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Right Navigation Button */}
      {currentIndex < images.length - 1 && (
        <Animated.View style={[styles.navButton, styles.navButtonRight, { opacity }]}>
          <TouchableOpacity onPress={navigateNext} style={styles.navButtonInner}>
            <Ionicons name="chevron-forward" size={32} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Swipe Hint (shows briefly on first load) */}
      {images.length > 1 && (
        <Animated.View style={[styles.swipeHint, { opacity: navHintOpacity }]}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.swipeHintText}>Swipe to navigate</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </Animated.View>
      )}
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <View style={styles.container}>
        <ImageViewer
          imageUrls={imageUrls}
          index={currentIndex}
          onChange={handleIndexChange}
          enableSwipeDown={true}
          onSwipeDown={onClose}
          onClick={toggleControls}
          renderIndicator={renderIndicator}
          backgroundColor="#000"
          enableImageZoom={true}
          maxOverflow={0}
          saveToLocalByLongPress={false}
          renderHeader={renderHeader}
          renderFooter={renderFooter}
          footerContainerStyle={styles.footerContainer}
        />
        {renderNavigationHints()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  closeButton: {
    padding: 8,
  },
  counterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    backgroundColor: 'transparent',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  captionText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  thumbnailStripContainer: {
    marginTop: 8,
  },
  thumbnailStripContent: {
    paddingHorizontal: 8,
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    marginHorizontal: THUMBNAIL_MARGIN,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#fff',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    zIndex: 10,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
  navButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  swipeHint: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 30,
    alignSelf: 'center',
    marginHorizontal: 40,
    zIndex: 5,
  },
  swipeHintText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
});

export default ImageGalleryViewer;
