import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import { useUser } from '../../contexts/UserProvider';
import Navbar from '../../components/Navbar';
import { MyAlert } from '../../components/MyAlert';
import { useState } from 'react';
import { TextButton } from '../../components/MyButton';
import { navigate } from '../../utils/RootNavigation';

export default function SettingsScreen({ navigation }) {
	const [isVisible, setIsVisible] = useState(false);
	const { logout, removeAccount } = useUser();

	const handleLogout = async () => {
		await logout();
		navigation.navigate("LOGIN");
	}

	const handleRemoveAccount = async () => {
		setIsVisible(true);
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
				</View>

				<View style={styles.section}>

					<TouchableOpacity
						style={[styles.navigationItem, styles.logoutButton]}
						onPress={handleLogout}
					>
						<Text style={styles.logoutText}>Déconnexion</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.navigationItem, styles.logoutButton]}
						onPress={handleRemoveAccount}
					>
						<Text style={styles.logoutText}>Supprimer le compte</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
			<MyAlert
				title={"Supprimer mon compte"}
				content={
					<View>
						<View>
							<Text>La suppression de votre compte va :</Text>
							<Text>Suprimer vos informations de compte photo de profil</Text>
							<Text>Vous faire quitter tous les groupes</Text>
						</View>
					</View>
				}
				visible={isVisible}
				okButton={
					<>

						<TextButton
							text={'Confirmer'}
							pressEvent={async () => {
								console.log("first")
								const response = await removeAccount();
								if (response.success) {
									navigate("START")
								}
							}}
							containerStyle={{
								borderColor: 'green',
								borderWidth: 1,
								borderRadius: 5,
							}}
							fontStyle={{ fontSize: 14, color: 'green' }}
						/>
					</>
				}
				cancelButton={
					<TextButton
						text={'Annuler'}
						pressEvent={() => {
							setIsVisible(false);
						}}
						containerStyle={{
							borderColor: 'green',
							borderWidth: 1,
							backgroundColor: 'green',
							borderRadius: 5,
						}}
						fontStyle={{ fontSize: 14, color: 'white' }}
					/>
				}
				backEvent={
					() => {
						setIsVisible(false);
					}
				}
			/>
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