import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Colors from '../constants/Colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';
import { useUser } from '../contexts/UserProvider';
import { BASE_API_URL } from '@env';
import CustomImageView from './CustomImage';
import { moderateScale } from '../../assets/styles/responsiveSize';

export default function Navbar({ navigation }) {
    const { user } = useUser();

    return (
        <SafeAreaView style={styles.container}>
            {user && <TouchableOpacity
                onPress={() => {
                    navigation.navigate('PROFILE');
                }} style={styles.left}>
                <CustomImageView
                    source={`${BASE_API_URL}/image/${user.profilePicture}`}
                    firstName={user?.fullName}
                    size={32}
                    fontSize={16}
                />
                <View style={styles.info}>
                    <Text style={styles.infoPrimary} numberOfLines={1} ellipsizeMode="tail">{user.fullName}</Text>
                    <Text style={styles.infoSecondary}>{user.status}</Text>
                </View>
            </TouchableOpacity>}
            <View style={styles.right}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('NOTIFICATION');
                    }}>
                    <Icon name={'notifications-outline'} size={30} color={Colors.textColor} />
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
        padding: moderateScale(16),
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
        fontSize: 16,
        color: Colors.textColor
    },
    infoSecondary: {
        color: Colors.textColor
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