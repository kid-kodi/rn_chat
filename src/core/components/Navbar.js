import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Colors from '../constants/Colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';
import { useUser } from '../contexts/UserProvider';
import Avatar from './Avatar';
import { BASE_API_URL } from '@env';

export default function Navbar({ navigation }) {
    const { user } = useUser();

    return (
        <SafeAreaView style={styles.container}>
            {user && <TouchableOpacity
                onPress={() => {
                    navigation.navigate('PROFILE');
                }} style={styles.left}>
                <Avatar
                size={42}
                    letter={user?.fullName[0]}
                    source={user.profilePicture ?
                        `${BASE_API_URL}/image/${user.profilePicture}` : null} />
                <View style={styles.info}>
                    <Text style={styles.infoPrimary}>{user.fullName}</Text>
                    <Text>status</Text>
                </View>
            </TouchableOpacity>}
            <View style={styles.right}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('NOTIFICATION');
                    }}>
                    <Icon name={'notifications-outline'} size={30} color={Colors.lightGrey} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 70,
        alignItems: "center",
        rowGap: 16,
        padding: 16,
        backgroundColor: Colors.white
    },
    left: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: "center",
        gap: 16,
        flex: 1
    },
    infoPrimary: {
        fontWeight: "bold",
        fontSize: 16
    },
    right: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    logo: {
        width: 50,
        height: 50,
    },
});