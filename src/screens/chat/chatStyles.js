import { Dimensions, Platform, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
const windowWidth = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
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
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    gap: 5
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
    borderRadius: 18
  },
  userBubble: {
    backgroundColor: '#E7FED6',
    borderBottomRightRadius: 4,
  },
  contactBubble: {
    backgroundColor: '#eee',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  contactMessageText: {
    color: '#000',
  },
  // Continuation of the styles object from the previous code
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 4,
    opacity: 0.8,
  },
  userTimestamp: {
    color: 'rgba(7, 5, 5, 0.8)',
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
    color: '#000',
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
    color: '#000',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: 'rgba(3, 2, 2, 0.8)',
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
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  input: {
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
  },
  micButton: {
    padding: 8,
  },
  attachmentOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attachmentOption: {
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  actionMenu: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: 'red',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  joinButtonText: {
    color: Colors.white
  },
  firstMessageContainer: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  firstMessage: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: 20,
  },
  firstMessageEmote: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  firstMessageButton: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    paddingHorizontal: 16,
    marginTop: 10,
    borderColor: Colors.lightGrey,
    padding: 12,
    borderRadius: 50,
    backgroundColor: Colors.blue,
    color: Colors.white
  },
  firstMessageText: {
    color: Colors.white
  },
  newChatContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  newChatTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
  },
  newChatSubtitle: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
  firstMessageInput: {
    width: '100%',
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  sendFirstMessageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  sendFirstMessageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  customHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 15,
      paddingHorizontal: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#efefef"
    },
    customHeaderInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20
    },
    customHeaderInfoPrimary: {
      fontSize: 14,
      color: Colors.textColor,
      fontWeight: "bold"
    },
    customHeaderInfoSecondary: {
      fontSize: 14,
      color: Colors.secondaryTextColor
    },
    avatarStatusContainer: {
      position: 'relative',
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    statusDot: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#4CAF50',
      borderWidth: 2,
      borderColor: '#fff',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      justifyContent: "space-between",
      marginBottom: 20,
      gap: 5
    },
    searchInputContainer: {
      backgroundColor: Colors.extraLightGrey,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      height: 44,
      flex: 1
    },
    headerIcons: {
      flexDirection: 'row',
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.extraLightGrey,
      height: 44,
      width: 44,
      borderRadius: 15,
    }
});