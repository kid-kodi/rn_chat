import { Dimensions, Platform, StyleSheet } from "react-native";

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contactTextInfo: {
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  contactStatus: {
    fontSize: 12,
    color: '#8E8E93',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesList: {
    paddingTop: 16,
    paddingBottom: 32
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: "center",
    marginVertical: 4,
    paddingHorizontal: 16,
    gap:3,
    
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  contactMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageSenderAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#25D366',
    borderBottomRightRadius: 4,
  },
  contactBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },
  contactMessageText: {
    color: '#333333',
  },
  // Continuation of the styles object from the previous code
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 4,
    opacity: 0.8,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contactTimestamp: {
    color: '#8E8E93',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  videoContainer: {
    position: 'relative',
    width: 200,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
    paddingVertical: 4,
  },
  audioPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5F77F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  audioWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    justifyContent: 'space-evenly',
  },
  audioWaveformBar: {
    width: 3,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
  audioDuration: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 180,
  },
  fileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5F77F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attachButton: {
    padding: 8,
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 8,
    marginHorizontal: 8,
  },
  input: {
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    padding: 8,
  },
  micButton: {
    padding: 8,
  },
  attachmentOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexWrap: 'wrap',
  },
  attachmentOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
    marginTop: 16,
  },
  attachmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentText: {
    fontSize: 12,
    color: '#333333',
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  previewVideoContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 4,
    overflow: 'hidden',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  previewPlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  previewAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
  },
  previewAudioText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  previewFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
  },
  previewFileName: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    maxWidth: windowWidth - 100,
  },
  previewText: {
    fontSize: 14,
    color: '#333333',
  },
  cancelPreviewButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingTime: {
    fontSize: 16,
    color: '#FF6B6B',
    marginRight: 8,
  },
  cancelRecordingButton: {
    padding: 8,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  uploadingText: {
    marginLeft: 8,
    color: '#333333',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullScreenButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  fullScreenVideoContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  }
});


export default styles;