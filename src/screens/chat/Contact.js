import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useCallback, useEffect, useState } from 'react'
import Screen from '../../components/Screen'
import { useUser } from '../../contexts/UserProvider';
import { BASE_API_URL } from '@env';
import Colors from '../../constants/Colors';
import DataItem from '../../components/DataItem';
import Header from '../../components/Header';
import { useApi } from '../../contexts/ApiProvider';
import { useChat } from '../../contexts/ChatProvider';
import CustomImageView from '../../components/CustomImage';
import { TimeAgo } from '../../utils/Utility';
import Icon from 'react-native-vector-icons/Ionicons';
import { navigate } from '../../utils/RootNavigation';
import { MeetingVariable } from '../../MeetingVariable';

import uuid from 'react-native-uuid';
import Button from '../../components/Button';

export default function Contact(props) {
	const api = useApi();
	const { user } = useUser();
	const { removeUserFromChat } = useChat();

	const [isLoading, setIsLoading] = useState(false);
	const id = props.route?.params?.id;
	const chat = props.route?.params?.chat;

	const [callee, setCallee] = useState();
	const [commonChats, setCommonChats] = useState([]);

	useEffect(() => {
		(async () => {
			const response = await api.get(`/api/users/${id}`);
			console.log(response)
			if (response.success) {
				setCallee(response.data);
			}
		})()
	}, [id]);

	useEffect(() => {
		(async () => {
			const response = await api.get(`/api/chats/common/${id}`);
			if (response.success) {
				setCommonChats(response.chats);
			}
		})()
	}, [callee]);

	const removeFromChat = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await removeUserFromChat(chat._id, user, callee);
			if (response.success) {
				props.navigation.goBack();
				setIsLoading(false);
			}
		} catch (error) {
			setIsLoading(false);
		}
	}, [])

	const initiateCall = async (callType) => {
		try {

			// Generate a unique call ID
			const callId = uuid.v4();

			// Prepare call data
			const callData = {
				chatId: chat._id,
				callId,
				callType,
				caller: user,
			};

			// Call the backend API to initiate call
			const response = await api.post(`/api/call/initiate-call`, callData);
			// setChat(response.chat);

			MeetingVariable.callService.setup();

			const callUUID = MeetingVariable.callService.startCall(
				callId, chat._id, chatInfo.name, chatInfo.isGroupChat, callData.callType === "video");

			// Navigate to call screen
			navigate('CALL', {
				callUUID,
				chatId: callData.chatId,
				cameraStatus: callData.callType === "video",
				microphoneStatus: false,
			});
		} catch (error) {
			console.error('Failed to initiate call:', error);
		} finally {
			// setIsCallLoading(false);
		}
	};

	return (
		<Screen>
			<Header leftText="Infos du contact" />
			<ScrollView contentContainerStyle={styles.scrollView}>
				<View style={styles.ImageContainer}>
					<CustomImageView
						source={`${BASE_API_URL}/image/${user.profilePicture}`}
						firstName={callee?.fullName}
						size={80}
						fontSize={40}
					/>
					<Text style={styles.name}>{callee?.fullName}</Text>
					<Text style={styles.about}>Derniere connexion {TimeAgo(callee?.lastSeen)}</Text>
					{
						callee?.bio &&
						<Text>{callee?.bio}</Text>
					}

				</View>

				{/* Section for some actions */}
				<View style={styles.section}>
					<TouchableOpacity
						style={styles.navigationItem}
						onPress={() => initiateCall('audio')}
					>
						<Icon name="call-outline" size={24} color="#999" />
						<Text style={styles.navigationLabel}>Appel audio</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.navigationItem}
						onPress={() => initiateCall('video')}
					>
						<Icon name="videocam-outline" size={24} color="#999" />
						<Text style={styles.navigationLabel}>Appel video</Text>
					</TouchableOpacity>
				</View>


				{
					commonChats.length > 0 &&
					<>
						<Text style={styles.heading}>{commonChats.length} {commonChats.length === 1 ? "Group" : "Groups"} in Common</Text>
						{
							commonChats.map(chatData => {
								return <DataItem
									key={chatData?._id}
									title={chatData?.chatName}
									subTitle={chatData?.latestMessage}
									type="link"
									onPress={() => props.navigation.push("CHAT", { chatId: chatData?._id })}
									image={chatData?.image?.name}
								/>
							})
						}
					</>
				}

				{
					chat && chat.isGroupChat &&
						isLoading ?
						<ActivityIndicator size={"small"} color={Colors.primary} /> :
						<Button title="Supprimer du chat"
							color={Colors.red}
							onPress={removeFromChat}
						/>
				}
			</ScrollView>
		</Screen>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginVertical: 20,
	},
	scrollView: {
		padding: 16,
	},
	ImageContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	name: {
		fontSize: 20,
		letterSpacing: 0.3,
		fontWeight: "bold",
		marginVertical: 10
	},
	about: {
		fontSize: 16,
		letterSpacing: 0.3,
		color: Colors.grey
	},
	heading: {
		letterSpacing: 0.3,
		color: Colors.textColor,
		marginVertical: 8
	},
	infoSection: {
		width: '100%',
		paddingHorizontal: 20,
		marginTop: 16,
	},
	section: {
		backgroundColor: '#fff',
		marginTop: 16,
		paddingVertical: 12
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		marginBottom: 12,
	},
	navigationItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 20,
		gap: 12
	},
	navigationItemIcon: {

	},
	navigationLabel: {
		fontSize: 16,
		color: '#333',
	},
});