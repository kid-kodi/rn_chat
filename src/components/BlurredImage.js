// components/BlurredImage.js
import React, {useState, useEffect} from 'react';
import {View, Image, StyleSheet, ActivityIndicator} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import ImageCacheManager from '../utils/ImageCacheManager';

const BlurredImage = ({source, style, onLoad, onError}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [localUri, setLocalUri] = useState(null);

  useEffect(() => {
    const checkAndDownload = async () => {
      try {
        const isCached = await ImageCacheManager.isImageCached(source.uri);
        setIsDownloaded(isCached);
        
        if (!isCached) {
          setIsLoading(false);
          return;
        }
        
        const uri = await ImageCacheManager.getLocalImagePath(source.uri);
        setLocalUri(uri);
        setIsLoading(false);
        setIsDownloaded(true);
        if (onLoad) onLoad();
      } catch (error) {
        console.error('Error handling image:', error);
        setIsLoading(false);
        if (onError) onError(error);
      }
    };

    checkAndDownload();
  }, [source.uri]);

  const handlePress = async () => {
    if (!isDownloaded) {
      setIsLoading(true);
      try {
        const uri = await ImageCacheManager.downloadImage(source.uri);
        setLocalUri(uri);
        setIsDownloaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Download failed:', error);
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {localUri ? (
        <Image
          source={{uri: localUri}}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.blurContainer}>
          <Image
            source={{uri: source.uri}}
            style={styles.image}
            resizeMode="cover"
          />
          <BlurView
            style={styles.absolute}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default BlurredImage;