import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import { moderateScale } from '../assets/styles/responsiveSize';
import Modal from 'react-native-modal';

const actions = [
    { id: '1', label: 'Call', icon: 'call-outline' },
    { id: '2', label: 'Send Message', icon: 'chatbubble-ellipses-outline' },
    { id: '3', label: 'Video Call', icon: 'videocam-outline' },
    { id: '4', label: 'Share Contact', icon: 'share-social-outline' },
    { id: '5', label: 'Add to Favorites', icon: 'star-outline' },
];



export default function ContactItem({ item }) {
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const renderAction = ({ item }) => (
        <TouchableOpacity style={styles.actionButton}>
            <Icon name={item.icon} size={24} color="#0078D7" />
            <Text style={styles.actionLabel}>{item.label}</Text>
        </TouchableOpacity>
    );

    const handleEditImage = () => {
        // Implement image picker or navigation here
        alert('Edit profile image');
    };

    return (
        <>
            <TouchableOpacity onPress={toggleModal} style={[styles.card]}>
                {item.profilePicture ? (
                    <Image
                        alt=""
                        resizeMode="cover"
                        source={{ uri: item.profilePicture }}
                        style={styles.cardImg}
                    />
                ) : (
                    <View style={[styles.cardImg, styles.cardAvatar]}>
                        <Text style={styles.cardAvatarText}>
                            {item.fullName[0]}
                        </Text>
                    </View>
                )}
                <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.fullName}</Text>
                </View>
            </TouchableOpacity>
            <Modal isVisible={isModalVisible}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={toggleModal} style={styles.closeIcon}>
                            <Icon name="close-outline" size={32} color="#333"/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleEditImage} style={styles.profileWrapper}>
                            {item.profilePicture ? (
                                <Image
                                    alt=""
                                    resizeMode="cover"
                                    source={{ uri: item.profilePicture }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={[styles.profileImage, styles.cardAvatar]}>
                                    <Text style={styles.cardAvatarText}>
                                        {item.fullName[0]}
                                    </Text>
                                </View>
                            )}
                            {/* <View style={styles.editIcon}>
                                <Icon name="camera" size={16} color="#fff" />
                            </View> */}
                        </TouchableOpacity>
                        <Text style={styles.userName}>{item.fullName}</Text>
                        <Text style={styles.userStatus}>Online</Text>
                    </View>

                    <View style={styles.actionsContainer}>
                        <FlatList
                            data={actions}
                            keyExtractor={(item) => item.id}
                            renderItem={renderAction}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    card: {
        paddingVertical: moderateScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    cardImg: {
        width: 42,
        height: 42,
        borderRadius: 50,
    },
    cardAvatar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9ca1ac',
    },
    cardAvatarText: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#fff',
    },
    cardBody: {
        marginRight: 'auto',
        marginLeft: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    cardPhone: {
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '500',
        color: '#616d79',
        marginTop: 3,
    },
    cardAction: {
        paddingRight: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 50,
        backgroundColor: '#F3F3F3',
    },
    profileWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    closeIcon: {
        position: 'absolute',
        top: 25,
        left: 4,
        padding: 4,
    },
    editIcon: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#0078D7',
        borderRadius: 12,
        padding: 4,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 15,
    },
    userStatus: {
        fontSize: 16,
        color: 'gray',
    },
    actionsContainer: {
        flex: 1,
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    actionLabel: {
        marginLeft: 20,
        fontSize: 16,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 20,
    },
})
