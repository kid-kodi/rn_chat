import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import { moderateScaleVertical } from '../../assets/styles/responsiveSize';
import Modal from 'react-native-modal';
import { useUser } from '../../contexts/UserProvider';
import { useChat } from '../../contexts/ChatProvider';
import { useSocket } from '../../contexts/SocketProvider';
import { BASE_API_URL } from '@env';
import CustomImageView from '../../components/CustomImage';

const actions = [
    { id: '1', label: 'Call', icon: 'call-outline' },
    { id: '2', label: 'Send Message', icon: 'chatbubble-ellipses-outline' },
    { id: '3', label: 'Video Call', icon: 'videocam-outline' },
    { id: '4', label: 'Share Contact', icon: 'share-social-outline' },
];



export default function ContactItem({ item, navigation }) {
    const [isModalVisible, setModalVisible] = useState(false);

    const { create } = useChat();
    const { user } = useUser();
    const socket = useSocket();

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

    const userPressed = async () => {
        navigation.navigate('CHAT', {
            userId: item?._id,
        });
    };

    return (
        <>
            {
                item && <View>
                    <TouchableOpacity onPress={userPressed} style={[styles.card]}>
                        <CustomImageView
                            source={`${BASE_API_URL}/image/${item?.profilePicture}`}
                            firstName={item?.fullName}
                            size={40}
                            fontSize={20}
                        />
                        <View style={styles.cardBody}>
                            <Text style={styles.cardTitle}>{item?.fullName}</Text>
                        </View>
                    </TouchableOpacity>
                    <Modal isVisible={isModalVisible}>
                        <View style={styles.container}>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={toggleModal} style={styles.closeIcon}>
                                    <Icon name="close-outline" size={32} color="#333" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleEditImage} style={styles.profileWrapper}>
                                    {item?.profilePicture ? (
                                        <Image
                                            alt=""
                                            resizeMode="cover"
                                            source={{ uri: item?.profilePicture }}
                                            style={styles.profileImage}
                                        />
                                    ) : (
                                        <CustomImageView
                                            source={`${BASE_API_URL}/image/${item?.profilePicture}`}
                                            firstName={item?.fullName}
                                            size={40}
                                            fontSize={20}
                                        />
                                    )}
                                    {/* <View style={styles.editIcon}>
                                <Icon name="camera" size={16} color="#fff" />
                            </View> */}
                                </TouchableOpacity>
                                <Text style={styles.userName}>{item?.fullName}</Text>
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
                </View>
            }
        </>
    )
}

const styles = StyleSheet.create({
    card: {
        paddingVertical: moderateScaleVertical(8),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10
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
