import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Screen from '../core/components/Screen'
import ProfileImage from '../core/components/ProfileImage';
import { useUser } from '../core/contexts/UserProvider';
import { BASE_API_URL } from '@env';
import Colors from '../core/constants/Colors';
import DataItem from '../core/components/DataItem';
import { useApi } from '../core/contexts/ApiProvider';
import Button from '../core/components/Button';
import { useChat } from '../core/contexts/ChatProvider';

export default function Contact(props) {
    const api = useApi();
    const { user } = useUser();
    const { removeUserFromChat } = useChat();

    const [isLoading, setIsLoading] = useState(false);
    const callee = props.route?.params?.callee;
    const chat = props.route?.params?.chat;

    const [commonChats, setCommonChats] = useState([]);

    useEffect(() => {
        (async () => {
            const response = await api.get(`/api/chats/common/${callee?._id}`);
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

    return (
        <Screen>
            <View style={styles.container}>
                <ProfileImage
                    size={80}
                    uri={
                        callee?.profilePicture &&
                            callee?.profilePicture !== "" ?
                            `${BASE_API_URL}/image/${callee?.profilePicture}` : null
                    }
                    style={{ marginBottom: 20 }}
                />
                <Text style={styles.name}>{callee?.fullName}</Text>
                {
                    callee?.about &&
                    <Text>{callee?.about}</Text>
                }


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
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20
    },
    name: {
        fontFamily: 'bold',
        fontSize: 20,
        letterSpacing: 0.3,
        fontWeight: "bold"
    },
    about: {
        fontFamily: 'medium',
        fontSize: 16,
        letterSpacing: 0.3,
        color: Colors.grey
    },
    heading: {
        fontFamily: 'bold',
        letterSpacing: 0.3,
        color: Colors.textColor,
        marginVertical: 8
    }
});