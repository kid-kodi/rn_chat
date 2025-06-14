import { View, Text, StyleSheet, TouchableWithoutFeedback, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Feather';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { useRef } from 'react'
import uuid from 'react-native-uuid';
import Colors from '../constants/Colors';
import Clipboard from '@react-native-clipboard/clipboard';
import { useUser } from '../contexts/UserProvider';
import { formatToTime } from '../utils/Utility';
import { BASE_API_URL } from '@env';
import fontFamily from '../assets/styles/fontFamily';
import axiosInstance from '../utils/AxiosInstance';

const MenuItem = props => {

    return <MenuOption onSelect={props.onSelect}>
        <View style={styles.menuItemContainer}>
            <Text style={styles.menuText}>{props.text}</Text>
            <Icon name={props.icon} size={18} />
        </View>
    </MenuOption>
}

export default function Bubble(props) {
    const { user } = useUser();

    let {
        replyingTo, sender, text, type, messageType, likes, messageId,
        createdAt, setReply, removeMessage, file, updateMessage, onPress
    } = props;

    const bubbleStyle = { ...styles.container };
    const textStyle = { ...styles.text };
    const wrapperStyle = { ...styles.wrapperStyle }

    const menuRef = useRef(null);
    const id = useRef(uuid.v4());

    let isLiked = likes?.indexOf(user._id) !== -1;

    let isUserMessage = false;

    let Container = View;

    switch (messageType) {
        case "system":
            textStyle.color = '#65644A';
            bubbleStyle.backgroundColor = Colors.beige;
            bubbleStyle.alignItems = 'center';
            bubbleStyle.marginTop = 10;
            break;
        case "error":
            bubbleStyle.backgroundColor = Colors.red;
            textStyle.color = 'white';
            bubbleStyle.marginTop = 10;
            break;
        case "myMessage":
            wrapperStyle.justifyContent = 'flex-end';
            bubbleStyle.backgroundColor = '#E7FED6';
            bubbleStyle.maxWidth = '90%';
            Container = TouchableWithoutFeedback;
            isUserMessage = true;
            break;
        case "theirMessage":
            wrapperStyle.justifyContent = 'flex-start';
            bubbleStyle.maxWidth = '90%';
            Container = TouchableWithoutFeedback;
            isUserMessage = true;
            break;

        case "reply":
            bubbleStyle.backgroundColor = '#F2F2F2';
            break;

        case "info":
            bubbleStyle.backgroundColor = '#ffffff';
            bubbleStyle.alignItems = 'center';
            textStyle.color = Colors.textColor;
            break;

        default:
            break;
    }


    const copyToClipboard = text => {
        try {
            Clipboard.setString(text);
        } catch (error) {
            console.log(error);
        }
    }

    const handleLike = async (messageId) => {
        const response = await axiosInstance.put(`/api/messages/${messageId}/like`, {
            userId: user._id,
            type: 'like',
        });
        if (response.success) {
            updateMessage(messageId, { likes: response.result.likes });
        }
    }



    const handleUnLike = async messageId => {
        const response = await axiosInstance.put(`/api/messages/${messageId}/unlike`, {
            userId: user._id,
            type: 'unlike',
        });
        if (response.success) {
            updateMessage(messageId, { likes: response.result.likes });
        }
    };

    const handleRemoveMessage = async messageId => {
        const response = await axiosInstance.delete(`/api/messages/${messageId}`);
        if (response.success) {
            removeMessage(messageId);
        }
    };

    return (
        <View>

            <View style={wrapperStyle}>

                <Container
                    onPress={() => onPress(type)}
                    onLongPress={() => menuRef.current.props.ctx.menuActions.openMenu(id.current)} style={{ width: '100%' }}>

                    <View style={bubbleStyle}>

                        {
                            sender._id !== user._id && type !== "info" &&
                            <Text style={styles.name}>{sender.fullName}</Text>
                        }

                        {
                            replyingTo &&
                            <Bubble
                                type="reply"
                                text={replyingTo.message.content}
                                sender={replyingTo.user}
                            />
                        }

                        <Text style={textStyle}>
                            {text}
                        </Text>

                        {
                            file &&
                            <Image source={{ uri: `${BASE_API_URL}/image/${file.name}` }} style={styles.image} />
                        }

                        {
                            createdAt && messageType !== "info" &&
                            <Text style={styles.date}>
                                {formatToTime(createdAt)}
                            </Text>
                        }

                        <Menu name={id.current} ref={menuRef}>
                            <MenuTrigger />

                            <MenuOptions>
                                <MenuItem text='Copy to clipboard' icon={'copy'} onSelect={() => copyToClipboard(text)} />
                                {isUserMessage && !isLiked && <MenuItem text='Like message' icon={'thumbs-up'} onSelect={() => handleLike(messageId)} />}
                                {isUserMessage && isLiked && <MenuItem text='Unlke message' icon={'thumbs-down'} onSelect={() => handleUnLike(messageId)} />}
                                <MenuItem text='Reply' icon={'corner-up-left'} onSelect={setReply} />
                                {user._id === sender._id && <MenuItem text='Delete' icon={'trash'} onSelect={() => handleRemoveMessage(messageId)} />}
                            </MenuOptions>
                        </Menu>
                    </View>
                </Container>
                {isUserMessage && isLiked && <Icon name={'thumbs-up'} size={18} />}
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    wrapperStyle: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
    },
    text: {
        fontFamily: fontFamily.regular,
        letterSpacing: 0.3,
        fontSize: 16,
        color : Colors.textColor
    },
    date: {
        fontSize: 10,
        textAlign: "right"
    },
    menuItemContainer: {
        flexDirection: 'row',
        padding: 5
    },
    menuText: {
        flex: 1,
        fontFamily: fontFamily.regular,
        letterSpacing: 0.3,
        fontSize: 16
    },
    name: {
        fontWeight:"bold",
        color:Colors.grey,
        letterSpacing: 0.3,
        fontSize: 12
    },
    image: {
        width: 200,
        height: 200,
        padding: 5
    }
})