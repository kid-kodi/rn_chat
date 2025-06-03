import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { goBack } from '../../utils/RootNavigation';
import axiosInstance from '../../utils/AxiosInstance';
import ImageViewer from 'react-native-image-zoom-viewer';
import { BASE_API_URL } from '@env';

const { width, height } = Dimensions.get('window');

const GalleryViewer = (props) => {
  const chatId = props.route.params.chatId;
  const file = props.route.params.file;
  const [mediaItems, setMediaItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageViewerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const response = await axiosInstance.get(`/api/chats/${chatId}/medias`);
      if (response.success) {
        setMediaItems(response.mediaItems);
        const initialIndex = response.mediaItems.findIndex(item => item._id === file._id);
        setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
      }
    })();
  }, [chatId]);

  const handleThumbnailPress = (index) => {
    setCurrentIndex(index);
    // The correct way to change images is by updating the index prop
  };

  const handleImageChange = (index) => {
    setCurrentIndex(index);
  };

  const renderThumbnail = ({ item, index }) => {
    const isSelected = index === currentIndex;

    return (
      <TouchableOpacity
        onPress={() => handleThumbnailPress(index)}
        style={[
          styles.thumbnail,
          isSelected && styles.selectedThumbnail
        ]}
      >
        <Image 
          source={{ uri: `${BASE_API_URL}/image/${item.name}` }} 
          style={styles.thumbnailImage} 
        />
        {item.type === 'video' && (
          <View style={styles.videoIconOverlay}>
            <Icon name="play-circle" size={20} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const prepareImageUrls = () => {
    return mediaItems.map(item => ({
      url: `${BASE_API_URL}/image/${item.name}`,
      props: {
        // Custom props can be added here
      }
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <Modal visible={true} transparent={true}>
        <View style={styles.fullscreenContainer}>
          <ImageViewer 
            key={currentIndex} // Force re-render when index changes
            imageUrls={prepareImageUrls()}
            index={currentIndex}
            onChange={handleImageChange}
            enableSwipeDown={true}
            onSwipeDown={() => goBack()}
            backgroundColor="rgba(0,0,0,0.9)"
            renderHeader={() => (
              <TouchableOpacity 
                onPress={() => goBack()}
                style={styles.closeButton}
              >
                <Icon name="close" size={28} color="white" />
              </TouchableOpacity>
            )}
          />
          
          {/* Thumbnail bar */}
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
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1001,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 1000,
  },
  thumbnailList: {
    paddingHorizontal: 10,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 4,
    marginHorizontal: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#1e90ff',
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