
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { goBack } from '../core/helpers/RootNavigation';
import axiosInstance from '../core/networks/AxiosInstance';
import { BASE_API_URL } from '@env';

const { width, height } = Dimensions.get('window');

// Example media items
// const mediaItems = [
//   {
//     uri: 'https://example.com/image1.jpg',
//     type: 'image',
//   },
//   {
//     uri: 'https://example.com/video1.mp4',
//     type: 'video',
//     thumbnail: 'https://example.com/thumbnail1.jpg',
//   },
//   {
//     uri: 'https://example.com/image2.jpg',
//     type: 'image',
//   },
//   {
//     uri: 'https://example.com/video2.mp4',
//     type: 'video',
//     thumbnail: 'https://example.com/thumbnail2.jpg',
//   },
//   // Add more media items as needed
// ];

const GalleryViewer = (props) => {
  const chatId = props.route.params.chatId;
  const file = props.route.params.file;
  // State for selected media index and UI visibility
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState();
  const [showUI, setShowUI] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  // Get currently selected media item
  // const selectedMedia = mediaItems[selectedIndex];


  useEffect(() => {
    (async () => {
      const response = await axiosInstance.get(`/api/chats/${chatId}/medias`);
      if (response.success) {
        setMediaItems(response.mediaItems);
        setSelectedItem(response.mediaItems.find(item => item._id === file._id))
      }
    })()
  }, [chatId])

  // Toggle header and footer visibility
  const toggleUI = () => {
    setShowUI(!showUI);
  };

  // Render thumbnail for media item in bottom scroll
  const renderThumbnail = ({ item, index }) => {
    const isSelected = item?._id === selectedItem?._id;

    return (
      <TouchableOpacity
        onPress={() => setSelectedItem(item)}
        style={[
          styles.thumbnail,
          isSelected && styles.selectedThumbnail
        ]}
      >
        {item.type === 'video' ? (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: `${BASE_API_URL}/image/${item.name}` }} style={styles.thumbnailImage} />
            <View style={styles.videoIconOverlay}>
              <Icon name="play-circle" size={20} color="white" />
            </View>
          </View>
        ) : (
          <Image source={{ uri: `${BASE_API_URL}/image/${item.name}` }} style={styles.thumbnailImage} />
        )}
      </TouchableOpacity>
    );
  };

  // Video control functions
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Render video controls if video is selected
  const renderVideoControls = () => {
    if (selectedItem?.type === 'video' && showUI) {
      return (
        <View style={styles.videoControls}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
            <Icon
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={50}
              color="white"
            />
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  // Render the main content (image or video)
  const renderMainContent = () => {
    if (selectedItem?.type === 'video') {
      return (
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: `${BASE_API_URL}/image/${selectedItem?.name}` }}
            style={styles.mainContent}
            resizeMode="contain"
            paused={!isPlaying}
            repeat={true}
          />
          {renderVideoControls()}
        </View>
      );
    } else {
      return (
        <Image
          source={{ uri: `${BASE_API_URL}/image/${selectedItem?.name}` }}
          style={styles.mainContent}
          resizeMode="contain"
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Main content area with touch handler to toggle UI */}
      <Pressable style={styles.mainContentContainer} onPress={toggleUI}>
        {renderMainContent()}
      </Pressable>

      {/* Header with close button - conditionally visible */}
      {showUI && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.closeButton}>
            <Icon name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Footer with horizontal media scroll - conditionally visible */}
      {showUI && (
        <View style={styles.footer}>
          <FlatList
            data={mediaItems}
            renderItem={renderThumbnail}
            keyExtractor={(item, index) => `media-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    width: width,
    height: height,
  },
  videoContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoControls: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  playPauseButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  thumbnailList: {
    paddingHorizontal: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginHorizontal: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#1e90ff',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

export default GalleryViewer;