import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Switch,
	ScrollView,
	TouchableOpacity,
	Image,
	Platform,
	Alert,
	SafeAreaView
} from 'react-native';
import { requestNotifications } from 'react-native-permissions';

import Icon from "react-native-vector-icons/Ionicons";
import Colors from '../../core/constants/Colors';
import CustomImageView from '../../components/CustomImage';

// Initial Permissions Request Screen
const NotificationPermissionScreen = ({ onPermissionGranted }) => {
	const requestPermission = async () => {
		try {
			const { status } = await requestNotifications(['alert', 'sound', 'badge']);
			if (status === 'granted') {
				onPermissionGranted();
			} else {
				Alert.alert(
					'Permission Denied',
					'To receive chat notifications, please enable notifications in your device settings.',
					[{ text: 'OK' }]
				);
			}
		} catch (error) {
			console.error('Error requesting notification permission:', error);
		}
	};

	return (
		<View style={styles.container}>
			<Image
				source={{ uri: '/api/placeholder/150/150' }}
				style={styles.icon}
			/>
			<Text style={styles.title}>Enable Notifications</Text>
			<Text style={styles.description}>
				Stay up to date with messages, mentions, and activity in your chats.
			</Text>
			<TouchableOpacity
				style={styles.primaryButton}
				onPress={requestPermission}
			>
				<Text style={styles.buttonText}>Enable Notifications</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.secondaryButton}
				onPress={onPermissionGranted}
			>
				<Text style={styles.secondaryButtonText}>Not Now</Text>
			</TouchableOpacity>
		</View>
	);
};

// Notification Settings Screen
const NotificationSettingsScreen = () => {
	const [settings, setSettings] = useState({
		allNotifications: true,
		messageNotifications: true,
		groupNotifications: true,
		mentionNotifications: true,
		sound: true,
		vibration: true,
		preview: true,
		doNotDisturb: false,
	});

	const toggleSetting = (key) => {
		setSettings(prevSettings => ({
			...prevSettings,
			[key]: !prevSettings[key]
		}));
	};

	const NotificationSetting = ({ title, description, value, onToggle }) => (
		<View style={styles.settingContainer}>
			<View style={styles.settingInfo}>
				<Text style={styles.settingTitle}>{title}</Text>
				{description && <Text style={styles.settingDescription}>{description}</Text>}
			</View>
			<Switch
				value={value}
				onValueChange={onToggle}
				trackColor={{ false: '#d1d5db', true: '#10b981' }}
				thumbColor={Platform.OS === 'ios' ? '#ffffff' : value ? '#ffffff' : '#f4f3f4'}
			/>
		</View>
	);

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.sectionTitle}>Notification Settings</Text>

			<View style={styles.card}>
				<NotificationSetting
					title="All Notifications"
					description="Master toggle for all notifications"
					value={settings.allNotifications}
					onToggle={() => toggleSetting('allNotifications')}
				/>

				<View style={styles.divider} />

				<NotificationSetting
					title="Message Notifications"
					description="Notifications for direct messages"
					value={settings.messageNotifications}
					onToggle={() => toggleSetting('messageNotifications')}
				/>

				<View style={styles.divider} />

				<NotificationSetting
					title="Group Notifications"
					description="Notifications from group chats"
					value={settings.groupNotifications}
					onToggle={() => toggleSetting('groupNotifications')}
				/>

				<View style={styles.divider} />

				<NotificationSetting
					title="Mentions"
					description="Notifications when you're mentioned"
					value={settings.mentionNotifications}
					onToggle={() => toggleSetting('mentionNotifications')}
				/>
			</View>

			<Text style={styles.sectionTitle}>Notification Style</Text>

			<View style={styles.card}>
				<NotificationSetting
					title="Sound"
					description="Play sound with notifications"
					value={settings.sound}
					onToggle={() => toggleSetting('sound')}
				/>

				<View style={styles.divider} />

				<NotificationSetting
					title="Vibration"
					description="Vibrate with notifications"
					value={settings.vibration}
					onToggle={() => toggleSetting('vibration')}
				/>

				<View style={styles.divider} />

				<NotificationSetting
					title="Message Preview"
					description="Show message content in notifications"
					value={settings.preview}
					onToggle={() => toggleSetting('preview')}
				/>
			</View>

			<Text style={styles.sectionTitle}>Do Not Disturb</Text>

			<View style={styles.card}>
				<NotificationSetting
					title="Do Not Disturb"
					description="Mute all notifications temporarily"
					value={settings.doNotDisturb}
					onToggle={() => toggleSetting('doNotDisturb')}
				/>
			</View>
		</ScrollView>
	);
};

// In-App Notification Banner Component
const NotificationBanner = ({ notification, onPress, onDismiss }) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onDismiss();
		}, 5000);

		return () => clearTimeout(timer);
	}, [onDismiss]);

	return (
		<TouchableOpacity
			style={styles.notificationBanner}
			onPress={onPress}
			activeOpacity={0.9}
		>
			<View style={styles.bannerContent}>
				<Icon name="chevron-forward" size={20} color="#999" />
				<View style={styles.messageContainer}>
					<Text style={styles.senderName}>{notification.sender}</Text>
					<Text style={styles.messagePreview} numberOfLines={1}>
						{notification.message}
					</Text>
				</View>
			</View>
			<TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
				<Text style={styles.dismissText}>✕</Text>
			</TouchableOpacity>
		</TouchableOpacity>
	);
};

// No Notifications State Component
const NoNotificationsScreen = (props) => {
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.headerContainer}>
				<View style={{ flexDirection: "row", gap: 10 }}>
					<TouchableOpacity onPress={() => props.navigation.goBack()}>
						<Icon name={'arrow-back'} size={24} color={Colors.textColor} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Notifications</Text>
				</View>
			</View>

			<View style={styles.emptyContainer}>

				<Icon name={'notifications-outline'} size={50} color={Colors.textColor} />
				<Text style={styles.emptyTitle}>No Notifications Yet</Text>
				<Text style={styles.emptyDescription}>
					When you receive notifications, they'll appear here
				</Text>
			</View>
		</SafeAreaView>
	);
};

// {
//     id: '1',
//     sender: 'John Doe',
//     message: 'Hey, are you available for a meeting tomorrow?',
//     time: '5m ago',
//     read: false,
// },

// Notification Center Screen
const NotificationScreens = (props) => {
	const [notifications, setNotifications] = useState([]);

	const clearAllNotifications = () => {
		setNotifications([]);
	};

	const markAsRead = (id) => {
		setNotifications(notifications.map(notification =>
			notification.id === id ? { ...notification, read: true } : notification
		));
	};

	const deleteNotification = (id) => {
		setNotifications(notifications.filter(notification => notification.id !== id));
	};

	if (notifications.length === 0) {
		return <NoNotificationsScreen navigation={props.navigation} />;
	}

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<View style={{ flexDirection: "row", gap: 10 }}>
					<TouchableOpacity onPress={() => props.navigation.goBack()}>
						<Icon name={'arrow-back'} size={24} color={Colors.textColor} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Notifications</Text>
				</View>
				<TouchableOpacity onPress={clearAllNotifications}>
					<Text style={styles.clearAllText}>Clear All</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.notificationList}>
				{notifications.map(notification => (
					<TouchableOpacity
						key={notification.id}
						style={[
							styles.notificationItem,
							notification.read ? styles.readNotification : styles.unreadNotification
						]}
						onPress={() => markAsRead(notification.id)}
					>
						<CustomImageView
							source={notification.avatar}
							firstName={notification.sender}
							size={50}
							fontSize={25}
						/>
						<View style={styles.notificationContent}>
							<Text style={styles.notificationSender}>{notification.sender}</Text>
							<Text style={styles.notificationMessage}>{notification.message}</Text>
							<Text style={styles.notificationTime}>{notification.time}</Text>
						</View>
						<TouchableOpacity
							style={styles.deleteButton}
							onPress={() => deleteNotification(notification.id)}
						>
							<Text style={styles.deleteButtonText}>×</Text>
						</TouchableOpacity>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
};

// Main Component that combines all notification screens
// const NotificationScreens = () => {
//     const [permissionGranted, setPermissionGranted] = useState(false);
//     const [activeScreen, setActiveScreen] = useState('permission');
//     const [showBanner, setShowBanner] = useState(false);
//     const [currentBanner, setCurrentBanner] = useState(null);

//     useEffect(() => {
//         // Simulate receiving a notification after 3 seconds
//         const timer = setTimeout(() => {
//             if (permissionGranted) {
//                 const newNotification = {
//                     id: Date.now().toString(),
//                     sender: 'Mike Johnson',
//                     message: 'Just sent you the files you requested',
//                 };
//                 setCurrentBanner(newNotification);
//                 setShowBanner(true);
//             }
//         }, 3000);

//         return () => clearTimeout(timer);
//     }, [permissionGranted]);

//     const handlePermissionGranted = () => {
//         setPermissionGranted(true);
//         setActiveScreen('settings');
//     };

//     const navigateTo = (screen) => {
//         setActiveScreen(screen);
//     };

//     const dismissBanner = () => {
//         setShowBanner(false);
//     };

//     const renderScreen = () => {
//         switch (activeScreen) {
//             case 'permission':
//                 return <NotificationPermissionScreen onPermissionGranted={handlePermissionGranted} />;
//             case 'settings':
//                 return <NotificationSettingsScreen />;
//             case 'center':
//                 return <NotificationCenterScreen />;
//             default:
//                 return <NotificationPermissionScreen onPermissionGranted={handlePermissionGranted} />;
//         }
//     };

//     return (
//         <View style={styles.mainContainer}>
//             {renderScreen()}

//             {/* Bottom Navigation */}
//             <View style={styles.tabBar}>
//                 <TouchableOpacity
//                     style={styles.tabItem}
//                     onPress={() => navigateTo('settings')}
//                 >
//                     <Text style={activeScreen === 'settings' ? styles.activeTabText : styles.tabText}>
//                         Settings
//                     </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                     style={styles.tabItem}
//                     onPress={() => navigateTo('center')}
//                 >
//                     <Text style={activeScreen === 'center' ? styles.activeTabText : styles.tabText}>
//                         Notifications
//                     </Text>
//                 </TouchableOpacity>
//             </View>

//             {/* Notification Banner */}
//             {showBanner && currentBanner && (
//                 <NotificationBanner
//                     notification={currentBanner}
//                     onPress={() => {
//                         dismissBanner();
//                         navigateTo('center');
//                     }}
//                     onDismiss={dismissBanner}
//                 />
//             )}
//         </View>
//     );
// };

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		position: 'relative',
	},
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
		padding: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16,
		textAlign: 'center',
	},
	description: {
		fontSize: 16,
		marginBottom: 24,
		textAlign: 'center',
		color: '#4b5563',
		paddingHorizontal: 20,
	},
	icon: {
		width: 80,
		height: 80,
		marginBottom: 24,
		alignSelf: 'center',
	},
	primaryButton: {
		backgroundColor: '#10b981',
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		marginBottom: 12,
		width: '80%',
		alignSelf: 'center',
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	secondaryButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		width: '80%',
		alignSelf: 'center',
	},
	secondaryButtonText: {
		color: '#6b7280',
		fontSize: 16,
		textAlign: 'center',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 24,
		marginBottom: 12,
		color: '#1f2937',
	},
	card: {
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	settingContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8,
	},
	settingInfo: {
		flex: 1,
		paddingRight: 16,
	},
	settingTitle: {
		fontSize: 16,
		fontWeight: '500',
		color: '#1f2937',
	},
	settingDescription: {
		fontSize: 14,
		color: '#6b7280',
		marginTop: 2,
	},
	divider: {
		height: 1,
		backgroundColor: '#f3f4f6',
		marginVertical: 8,
	},
	notificationBanner: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		backgroundColor: 'white',
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 4,
		borderRadius: 8,
		margin: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	bannerContent: {
		flexDirection: 'row',
		flex: 1,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
	},
	messageContainer: {
		flex: 1,
	},
	senderName: {
		fontWeight: 'bold',
		fontSize: 16,
		color: '#1f2937',
	},
	messagePreview: {
		fontSize: 14,
		color: '#4b5563',
	},
	dismissButton: {
		padding: 4,
	},
	dismissText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#9ca3af',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f9fafb',
		padding: 16,
	},
	emptyIcon: {
		width: 80,
		height: 80,
		marginBottom: 16,
		opacity: 0.7,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
		color: '#4b5563',
	},
	emptyDescription: {
		fontSize: 16,
		color: '#6b7280',
		textAlign: 'center',
		paddingHorizontal: 40,
	},
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginBottom: 16,
		height: 50,
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#1f2937',
	},
	clearAllText: {
		fontSize: 14,
		color: '#10b981',
		fontWeight: '500',
	},
	notificationList: {
		flex: 1,
	},
	notificationItem: {
		flexDirection: 'row',
		padding: 16,
		backgroundColor: 'white',
		borderRadius: 8,
		marginBottom: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	unreadNotification: {
		borderLeftWidth: 4,
		borderLeftColor: '#10b981',
	},
	readNotification: {
		opacity: 0.8,
	},
	notificationAvatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 12,
	},
	notificationContent: {
		flex: 1,
	},
	notificationSender: {
		fontWeight: 'bold',
		fontSize: 16,
		marginBottom: 4,
		color: '#1f2937',
	},
	notificationMessage: {
		fontSize: 14,
		color: '#4b5563',
		marginBottom: 4,
	},
	notificationTime: {
		fontSize: 12,
		color: '#9ca3af',
	},
	deleteButton: {
		justifyContent: 'center',
		paddingHorizontal: 8,
	},
	deleteButtonText: {
		fontSize: 24,
		color: '#9ca3af',
	},
	tabBar: {
		flexDirection: 'row',
		backgroundColor: 'white',
		borderTopWidth: 1,
		borderTopColor: '#f3f4f6',
		paddingVertical: 12,
	},
	tabItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabText: {
		fontSize: 14,
		color: '#6b7280',
	},
	activeTabText: {
		fontSize: 14,
		color: '#10b981',
		fontWeight: '500',
	},
});

export default NotificationScreens;