import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

import Icon from 'react-native-vector-icons/Feather';
import Colors from '../../constants/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ReplyTo(props) {


    const { message, onCancel } = props;

    const renderFile = () => {
        let preview;

        switch (props.message.type) {
            case 'image':
                preview = (
                    <Image
                        source={{ uri: props.message.uri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                    />
                );
                break;

            case 'video':
                preview = (
                    <>
                        <View style={styles.previewVideoContainer}>
                            <Image
                                source={{ uri: props.message.thumbnail || 'https://via.placeholder.com/300x200' }}
                                style={styles.previewVideo}
                                resizeMode="cover"
                            />
                            <View style={styles.previewPlayButton}>
                                <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.8)" />
                            </View>
                        </View>
                        <Text style={styles.previewFileName} numberOfLines={1}>
                            {props.message.name}
                        </Text>
                    </>
                );
                break;

            case 'audio':
                preview = (
                    <View style={styles.previewAudioContainer}>
                        <Ionicons name="mic" size={24} color="#5F77F6" />
                        <Text style={styles.previewAudioText}>
                            Audio Recording - {props.message.duration}
                        </Text>
                    </View>
                );
                break;

            case 'file':
                preview = (
                    <View style={styles.previewFileContainer}>
                        <Ionicons name="document-outline" size={24} color="#5F77F6" />
                        <Text style={styles.previewFileName} numberOfLines={1}>
                            {props.message.name}
                        </Text>
                    </View>
                );
                break;
            case 'replyTo':
                preview = (
                    <View style={styles.previewFileContainer}>
                        <Ionicons name="document-outline" size={24} color="#5F77F6" />
                        <Text style={styles.previewFileName} numberOfLines={1}>
                            Reply
                        </Text>
                    </View>
                );
                break;

            default:
                preview = (
                    <Text style={styles.previewText}>Unsupported media type</Text>
                );
        }

        return (
            <View style={styles.messageContainer}>
                {preview}
            </View>
        );
    }

    return <View style={styles.container}>
        <View style={styles.textContainer}>

            <Text numberOfLines={1} style={styles.name}>{message.sender?.fullName}</Text>
            <Text numberOfLines={1}>{message.content}</Text>

            {props.message.file && renderFile()}

        </View>

        <TouchableOpacity onPress={onCancel}>
            <Icon name="x-circle" size={24} color={Colors.blue} />
        </TouchableOpacity>
    </View>
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.extraLightGrey,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftColor: Colors.blue,
        borderLeftWidth: 4
    },
    textContainer: {
        flex: 1,
        marginRight: 5
    },
    name: {
        color: Colors.blue,
        fontFamily: 'medium',
        letterSpacing: 0.3
    }
});