import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../core/networks/AxiosInstance';

const MediaGallery = (props) => {
  const chatId = props.route.params.chatId;

  // Sample data for the gallery
  const [mediaItems, setMediaItems] = useState([]);
  // State for filtering
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      const response = await axiosInstance.get(`/api/chats/${chatId}/medias`);
      if (response.success) {
        setMediaItems(response.mediaItems);
      }
    })()
  }, [chatId])

  // Filter items based on the selected filter
  const filteredItems = filter === 'all'
    ? mediaItems
    : mediaItems.filter(item => item.type === filter);

  // Calculate dimensions for grid layout
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 40) / 3; // 3 columns with some padding

  // Render individual media item
  const renderMediaItem = ({ item }) => {
    let mediaContent;
    let iconName;

    switch (item.type) {
      case 'image':
        mediaContent = <Image source={{ uri: item.uri }} style={styles.mediaPreview} />;
        iconName = 'image';
        break;
      case 'video':
        mediaContent = (
          <View style={styles.mediaPreview}>
            <Video
              source={{ uri: item.uri }}
              style={{ width: '100%', height: '100%' }}
              useNativeControls={false}
              resizeMode="cover"
            />
            <View style={styles.playIconContainer}>
              <Icon name="play-circle" size={30} color="#fff" />
            </View>
          </View>
        );
        iconName = 'video';
        break;
      case 'link':
        mediaContent = (
          <View style={[styles.mediaPreview, styles.linkPreview]}>
            <Icon name="link" size={30} color="#4a4a4a" />
          </View>
        );
        iconName = 'link';
        break;
      case 'file':
        let fileIcon = item.fileType === 'pdf' ? 'file-pdf-box' : 'file-word';
        mediaContent = (
          <View style={[styles.mediaPreview, styles.filePreview]}>
            <Icon name={fileIcon} size={30} color="#4a4a4a" />
          </View>
        );
        iconName = 'file';
        break;
      default:
        mediaContent = <View style={styles.mediaPreview} />;
        iconName = 'help-circle';
    }

    return (
      <TouchableOpacity style={[styles.itemContainer, { width: itemWidth }]}>
        {mediaContent}
        <View style={styles.itemDetails}>
          <Icon name={iconName} size={16} color="#4a4a4a" style={styles.itemIcon} />
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Media Gallery</Text>

      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Icon name="view-grid" size={18} color={filter === 'all' ? '#fff' : '#333'} />
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'image' && styles.activeFilter]}
          onPress={() => setFilter('image')}
        >
          <Icon name="image" size={18} color={filter === 'image' ? '#fff' : '#333'} />
          <Text style={[styles.filterText, filter === 'image' && styles.activeFilterText]}>Images</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'video' && styles.activeFilter]}
          onPress={() => setFilter('video')}
        >
          <Icon name="video" size={18} color={filter === 'video' ? '#fff' : '#333'} />
          <Text style={[styles.filterText, filter === 'video' && styles.activeFilterText]}>Videos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'link' && styles.activeFilter]}
          onPress={() => setFilter('link')}
        >
          <Icon name="link" size={18} color={filter === 'link' ? '#fff' : '#333'} />
          <Text style={[styles.filterText, filter === 'link' && styles.activeFilterText]}>Links</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'file' && styles.activeFilter]}
          onPress={() => setFilter('file')}
        >
          <Icon name="file" size={18} color={filter === 'file' ? '#fff' : '#333'} />
          <Text style={[styles.filterText, filter === 'file' && styles.activeFilterText]}>Files</Text>
        </TouchableOpacity>
      </View>

      {/* Grid gallery */}
      <FlatList
        data={filteredItems}
        renderItem={renderMediaItem}
        keyExtractor={item => item._id}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  itemContainer: {
    marginHorizontal: 5,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: 100,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkPreview: {
    backgroundColor: '#f0f0f0',
  },
  filePreview: {
    backgroundColor: '#f0f0f0',
  },
  playIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  itemIcon: {
    marginRight: 6,
  },
  itemTitle: {
    flex: 1,
    fontSize: 12,
  },
});

export default MediaGallery;