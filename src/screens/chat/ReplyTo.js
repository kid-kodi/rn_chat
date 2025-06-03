import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

import Icon from 'react-native-vector-icons/Feather';
import Colors from '../../constants/Colors';

export default function ReplyTo(props) {

    
    const { message, onCancel } = props;

    return <View style={styles.container}>
        <View style={styles.textContainer}>

            <Text numberOfLines={1} style={styles.name}>{message.sender?.fullName}</Text>
            <Text numberOfLines={1}>{message.content}</Text>

        </View>

        <TouchableOpacity onPress={onCancel}>
            <Icon name="x-circle" size={24} color={Colors.blue} />
        </TouchableOpacity>
    </View>
}

const styles = StyleSheet.create({
    container:{
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