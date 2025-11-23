import { Animated, KeyboardAvoidingView, PanResponder, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './Styles';
import { useRef, useState } from 'react';
import { Platform } from 'react-native';

export default function VoiceRecorder() {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [isCancelled, setIsCancelled] = useState(false);

	const scaleAnim = useRef(new Animated.Value(1)).current;
	const slideAnim = useRef(new Animated.Value(0)).current;
	const pulseAnim = useRef(new Animated.Value(1)).current;
	const inputWidthAnim = useRef(new Animated.Value(1)).current;


	const timerRef = useRef(null);
	const recordingStartTime = useRef(null);

	// Format time as MM:SS
	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	// Handle send text message
	const handleSend = () => {
		if (message.trim()) {
			onSendMessage?.(message);
			setMessage('');
		}
	};

	// Start recording
	const startRecording = () => {
		setIsRecording(true);
		setIsCancelled(false);
		setRecordingTime(0);
		recordingStartTime.current = Date.now();

		// Haptic feedback
		Vibration.vibrate(50);

		// Start timer
		timerRef.current = setInterval(() => {
			const elapsed = Math.floor((Date.now() - recordingStartTime.current) / 1000);
			setRecordingTime(elapsed);
		}, 1000);

		// Animations
		Animated.parallel([
			Animated.spring(scaleAnim, {
				toValue: 1.2,
				useNativeDriver: true,
			}),
			Animated.timing(inputWidthAnim, {
				toValue: 0.3,
				duration: 200,
				useNativeDriver: false,
			}),
		]).start();

		// Pulse animation
		const pulseAnimation = Animated.loop(
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1.3,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 800,
					useNativeDriver: true,
				}),
			])
		);
		pulseAnimation.start();
	};

	// Stop recording
	const stopRecording = () => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}

		setIsRecording(false);

		// Reset animations
		Animated.parallel([
			Animated.spring(scaleAnim, {
				toValue: 1,
				useNativeDriver: true,
			}),
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
			}),
			Animated.timing(pulseAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}),
			Animated.timing(inputWidthAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: false,
			}),
		]).start();

		if (!isCancelled && recordingTime > 0) {
			onSendVoice?.(recordingTime);
			console.log('Voice message sent!', `Duration: ${recordingTime}s`);
		} else {
			console.log('Recording cancelled or too short');
		}

		setIsCancelled(false);
	};

	// Cancel recording
	const cancelRecording = () => {
		setIsCancelled(true);
		Vibration.vibrate(100);
		stopRecording();
	};

	// Pan responder for tap, hold, and drag to cancel
	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: () => true,

		onPanResponderGrant: () => {
			// Start recording when touch begins
			if (!isRecording) {
				startRecording();
			}
		},

		onPanResponderMove: (_, gestureState) => {
			if (!isRecording) return;

			const { dx } = gestureState;
			const maxSlide = -120;
			const slideValue = Math.max(Math.min(dx, 0), maxSlide);

			slideAnim.setValue(slideValue);

			// Change to cancel state if dragged far enough
			if (dx < -80) {
				setIsCancelled(true);
			} else {
				setIsCancelled(false);
			}
		},

		onPanResponderRelease: (_, gestureState) => {
			if (!isRecording) return;

			const { dx } = gestureState;

			if (dx < -80) {
				cancelRecording();
			} else {
				stopRecording();
			}
		},

		onPanResponderTerminate: () => {
			// Handle if gesture is terminated
			if (isRecording) {
				stopRecording();
			}
		},
	});


	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<View style={styles.container}>
				{isRecording && (
					<Animated.View
						style={[
							styles.recordingOverlay,
							{
								transform: [{ translateX: slideAnim }],
							},
						]}
					>
						<View style={styles.recordingInfo}>
							<View style={styles.recordingIndicator}>
								<Animated.View
									style={[
										styles.redDot,
										{
											transform: [{ scale: pulseAnim }],
										},
									]}
								/>
								<Text style={styles.recordingText}>Recording...</Text>
							</View>
							<Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
						</View>

						{/* Cancel indicator */}
						<View style={[
							styles.cancelIndicator,
							{ opacity: isCancelled ? 1 : 0.5 }
						]}>
							<Text style={styles.cancelText}>🗑️ Cancel</Text>
						</View>
					</Animated.View>
				)}
				<Animated.View {...panResponder.panHandlers}>
					<Ionicons name="mic-outline" size={24} color="#333" />
				</Animated.View>
			</View>
		</KeyboardAvoidingView>
	)
}