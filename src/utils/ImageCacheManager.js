// utils/ImageCacheManager.js
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

const CACHE_DIR = RNFS.CachesDirectoryPath + '/images/';

// Initialize cache directory
const initCache = async () => {
  const exists = await RNFS.exists(CACHE_DIR);
  if (!exists) {
    await RNFS.mkdir(CACHE_DIR);
  }
};

// Check if image exists in cache
const isImageCached = async (imageUrl) => {
  const filename = imageUrl.split('/').pop();
  const localPath = CACHE_DIR + filename;
  return await RNFS.exists(localPath);
};

// Download image to cache
const downloadImage = async (imageUrl) => {
  try {
    const filename = imageUrl.split('/').pop();
    const localPath = CACHE_DIR + filename;
    
    const options = {
      fromUrl: imageUrl,
      toFile: localPath,
      progress: (res) => {
        const progress = (res.bytesWritten / res.contentLength);
        console.log(`Download progress: ${progress}`);
      }
    };
    
    await RNFS.downloadFile(options).promise;
    return localPath;
  } catch (error) {
    console.error('Download error:', error);
    return null;
  }
};

// Get local path for image (downloads if not cached)
const getLocalImagePath = async (imageUrl) => {
  await initCache();
  
  const filename = imageUrl.split('/').pop();
  const localPath = CACHE_DIR + filename;
  
  const exists = await RNFS.exists(localPath);
  if (exists) {
    return localPath;
  }
  
  return await downloadImage(imageUrl);
};

// Clear cache
const clearCache = async () => {
  await RNFS.unlink(CACHE_DIR);
  await initCache();
};

export default {
  isImageCached,
  downloadImage,
  getLocalImagePath,
  clearCache
};