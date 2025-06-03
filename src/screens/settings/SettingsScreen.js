import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import { useUser } from '../../contexts/UserProvider';
import Navbar from '../../components/Navbar';

export default function SettingsScreen({ navigation }) {

	const { logout } = useUser();

	const handleLogout = async () => {
		await logout();
		navigation.navigate("LOGIN");
	}

	return (
		<SafeAreaView>
			<Navbar navigation={navigation} />
			<ScrollView>
				<View style={styles.section}>

					<TouchableOpacity
						style={styles.navigationItem}
						onPress={() => navigation.navigate('PROFILE')}
					>
						<Text style={styles.navigationLabel}>Mon Compte</Text>
						<Icon name="chevron-forward" size={20} color="#999" />
					</TouchableOpacity>
					{/* <TouchableOpacity
                    style={styles.navigationItem}
                    onPress={() => navigation.navigate('NOTIFICATIONS')}
                >
                    <Text style={styles.navigationLabel}>Notifications</Text>
                    <Icon name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navigationItem}
                    onPress={() => navigation.navigate('PrivacySettings')}
                >
                    <Text style={styles.navigationLabel}>Confidentialite</Text>
                    <Icon name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navigationItem}
                    onPress={() => navigation.navigate('ChangePassword')}
                >
                    <Text style={styles.navigationLabel}>Inviter un proche</Text>
                    <Icon name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity> */}
				</View>

				<View style={styles.section}>
					{/* <TouchableOpacity
                    style={styles.navigationItem}
                    onPress={() => navigation.navigate('Help')}
                >
                    <Text style={styles.navigationLabel}>Aide</Text>
                    <Icon name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navigationItem}
                    onPress={() => navigation.navigate('About')}
                >
                    <Text style={styles.navigationLabel}>Apropos</Text>
                    <Icon name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity> */}

					<TouchableOpacity
						style={[styles.navigationItem, styles.logoutButton]}
						onPress={handleLogout}
					>
						<Text style={styles.logoutText}>Déconnexion</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	section: {
		backgroundColor: '#fff',
		marginTop: 16,
		paddingHorizontal: 16,
		paddingTop: 12,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#eee',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		marginBottom: 12,
	},
	navigationItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	navigationLabel: {
		fontSize: 16,
		color: '#333',
	},
	logoutButton: {
		borderBottomWidth: 0,
		justifyContent: 'center',
	},
	logoutText: {
		fontSize: 16,
		color: '#e74c3c',
		fontWeight: '500',
	},
})