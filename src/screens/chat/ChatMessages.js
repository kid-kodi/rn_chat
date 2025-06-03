import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import { useUser } from '../core/contexts/UserProvider';
import moment from 'moment';

export default function ChatMessages(props) {

    const { user } = useUser();

    const groupMessagesByDate = (messages) => {
        const result = [];
        let currentDate = '';

        // Sort messages by date (newest first)
        const sortedMessages = [...messages].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        sortedMessages.forEach((msg) => {
            const msgDate = msg.createdAt.split('T')[0];

            if (msgDate !== currentDate) {
                currentDate = msgDate;
                result.push({ type: 'date', date: currentDate });
            }

            result.push({ type: 'message', message: msg });
        });

        return result;
    };

    // const renderMessageContent = (message) => {
    //     switch (message.type) {
    //         case 'text':
    //             return <Text style={styles.messageText}>{message.content}</Text>;

    //         case 'image':
    //             return (
    //                 <Image
    //                     source={{ uri: message.content }}
    //                     style={styles.messageImage}
    //                     resizeMode="cover"
    //                 />
    //             );

    //         case 'video':
    //             return (
    //                 <Video
    //                     source={{ uri: message.content }}
    //                     style={styles.messageVideo}
    //                     useNativeControls
    //                     resizeMode="contain"
    //                     shouldPlay={false}
    //                 />
    //             );

    //         default:
    //             return <Text style={styles.messageText}>Unsupported type</Text>;
    //     }
    // };

    // const formatDate = (dateStr) => {
    //     const today = new Date().toISOString().split('T')[0];
    //     const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    //     if (dateStr === today) return "Aujourd'hui";
    //     if (dateStr === yesterday) return "Hier";
    //     return dateStr;
    // };

    return (
        <SafeAreaView style={styles.chatMessages}>
            <FlatList
                data={Object.entries(groupMessagesByDate(props.messages))}
                keyExtractor={([date]) => date}
                renderItem={({ item: [date, msgs] }) => (
                    <>
                        <Text>{moment(date).format('LL')}</Text>
                        {msgs.map((msg, index) => (
                            <Text key={index}>{msg.content}</Text>
                        ))}
                    </>
                )}
                onEndReachedThreshold={0.1}
                onEndReached={() => {
                    if (props.messages.length > 0) {
                        props.loadMessages(props.messages[0].createdAt);
                    }
                }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    chatMessages: {
        flex: 1,
    },
    dateSeparator: {
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    dateText: {
        color: '#555',
    },
    messageContainer: {
        marginHorizontal: 10,
        marginVertical: 4,
        maxWidth: '75%',
        padding: 10,
        borderRadius: 10,
    },
    messageLeft: {
        backgroundColor: '#e0f7fa',
        alignSelf: 'flex-start',
        borderTopLeftRadius: 0,
    },
    messageRight: {
        backgroundColor: '#dcedc8',
        alignSelf: 'flex-end',
        borderTopRightRadius: 0,
    },
    messageText: {
        fontSize: 16,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 10,
    },
    messageVideo: {
        width: 200,
        height: 150,
        borderRadius: 10,
    },
})