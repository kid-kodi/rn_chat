import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * File preview component
 * Shows preview of selected file before sending
 */
const FilePreview = memo(({ file, onRemove }) => {
  if (!file) return null;

  const isImage = file.type?.startsWith('image/');
  const isVideo = file.type?.startsWith('video/');
  const isAudio = file.type?.startsWith('audio/');
  const isDocument = !isImage && !isVideo && !isAudio;

  const getFileIcon = () => {
    if (isVideo) return 'videocam';
    if (isAudio) return 'musical-notes';
    if (file.type?.includes('pdf')) return 'document-text';
    if (file.type?.includes('excel') || file.type?.includes('spreadsheet')) return 'stats-chart';
    if (file.type?.includes('word') || file.type?.includes('document')) return 'document';
    if (file.type?.includes('powerpoint') || file.type?.includes('presentation')) return 'easel';
    return 'document-attach';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        {isImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: file.uri }} style={styles.imagePreview} />
            {isVideo && (
              <View style={styles.videoOverlay}>
                <Ionicons name="play-circle" size={40} color="#fff" />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.fileContainer}>
            <View style={styles.fileIconContainer}>
              <Ionicons name={getFileIcon()} size={32} color="#007AFF" />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="close-circle" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {isImage && (
        <View style={styles.infoRow}>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
        </View>
      )}
    </View>
  );
});

FilePreview.displayName = 'FilePreview';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  previewContainer: {
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  infoRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default FilePreview;
