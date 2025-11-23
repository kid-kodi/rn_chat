import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * Attachment picker modal component
 * Allows selecting different types of files: images, videos, documents, audio
 */
const AttachmentPicker = memo(({ visible, onClose, onSelectType }) => {
  const attachmentOptions = [
    {
      id: 'image',
      icon: 'image',
      label: 'Photo & Video',
      color: '#FF6B6B',
    },
    {
      id: 'camera',
      icon: 'camera',
      label: 'Camera',
      color: '#4ECDC4',
    },
    {
      id: 'document',
      icon: 'document-text',
      label: 'Document',
      color: '#45B7D1',
    },
    {
      id: 'audio',
      icon: 'musical-notes',
      label: 'Audio',
      color: '#F7B731',
    },
  ];

  const handleSelect = (type) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Share</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {attachmentOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.option}
                onPress={() => handleSelect(option.id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon} size={28} color="#fff" />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

AttachmentPicker.displayName = 'AttachmentPicker';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  option: {
    alignItems: 'center',
    width: '22%',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default AttachmentPicker;
