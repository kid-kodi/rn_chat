import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useRef, useState } from 'react'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native';

export default function ChatInput(props) {
    const [inputMessage, setInputMessage] = useState("");

    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState('00:00');
    const [recordingPath, setRecordingPath] = useState('');
    const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [cameraType, setCameraType] = useState('back');
    const [mediaType, setMediaType] = useState('photo');
    const [isLoading, setIsLoading] = useState(false);
    const cameraRef = useRef(null);

    const takePhoto = () => {

    }

    const handleSendMessage = () => {
        if (message.trim()) {
            props.sendMessage({ content: message, type: "text" });
            setMessage('');
        }
    }

    // Start recording audio
    const startRecording = async () => {
        setIsRecording(true)
    }

    // Stop recording audio
    const stopRecording = async () => {
        setIsRecording(false);
    }

    // Handle camera capture
    const handleCameraCapture = async () => { }

    // Open camera for photo/video
    const openCamera = (type) => { }

    // Pick documents (pdf, docx, etc.)
    const pickDocument = async () => { }

    // Share location
    const shareLocation = async () => { }

    // Share contact
    const shareContact = async () => { }

    return (
        <View style={styles.container}>

            {/* Attachment Options Modal */}
            <Modal
                transparent
                visible={showAttachmentOptions}
                animationType="slide"
                onRequestClose={() => setShowAttachmentOptions(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowAttachmentOptions(false)}
                >
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.optionButton} onPress={() => openCamera('photo')}>
                            <Icon name="camera" size={24} color="#075E54" />
                            <Text style={styles.optionText}>Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={() => openCamera('video')}>
                            <Icon name="video" size={24} color="#075E54" />
                            <Text style={styles.optionText}>Video</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={pickDocument}>
                            <Icon name="file-document" size={24} color="#075E54" />
                            <Text style={styles.optionText}>Document</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={shareLocation}>
                            <Icon name="map-marker" size={24} color="#075E54" />
                            <Text style={styles.optionText}>Location</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={shareContact}>
                            <Icon name="account" size={24} color="#075E54" />
                            <Text style={styles.optionText}>Contact</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Loading Indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#075E54" />
                </View>
            )}



            {/* Main Chat Input */}
            <View style={styles.inputContainer}>
                <TouchableOpacity
                    style={styles.attachButton}
                    onPress={() => setShowAttachmentOptions(true)}
                >
                    <Icon name="paperclip" size={24} color="#075E54" />
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Tapez un message"
                    multiline
                />

                {message.trim() ? (
                    <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                        <Icon name="send" size={15} color="white" />
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity style={styles.attachButton} onPress={takePhoto}>
                            <Icon name="camera-outline" size={24} color="#075E54" />
                        </TouchableOpacity>
                        <View style={isRecording && { position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }}>
                            <View style={styles.recordingContainer}>
                                {/* Recording Indicator */}
                                {isRecording && (

                                    <View style={styles.recordingIndicator}>
                                        <Icon name="record" size={16} color="red" />
                                        <Text style={styles.recordingTime}>{recordingTime}</Text>
                                        <Text style={styles.recordingText}>Recording...</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.attachButton}
                                    onPressIn={startRecording}
                                    onPressOut={stopRecording}
                                >
                                    <Icon name={isRecording ? "stop" : "microphone-outline"} size={24} color={isRecording ? "red" : "#075E54"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </View>


        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 4,
        maxHeight: 120,
        marginHorizontal: 8,
    },
    attachButton: {
        padding: 8,
    },
    sendButton: {
        backgroundColor: '#075E54',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    micButton: {
        backgroundColor: '#075E54',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 8,
    },
    recordingIndicator: {
        flex:1,
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#f0f0f0',
        padding: 8,
    },
    recordingTime: {
        marginHorizontal: 8,
        fontWeight: 'bold',
    },
    recordingText: {
        color: 'red',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'flex-end',
    },
    optionsContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    optionText: {
        marginLeft: 16,
        fontSize: 16,
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    cameraControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureCircle: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: 'white',
    },
    flipButton: {
        padding: 10,
    },
    closeButton: {
        padding: 10,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        zIndex: 999,
    },
})