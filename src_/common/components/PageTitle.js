import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Colors from '../constants/Colors'

export default function PageTitle(props) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{props.text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 8,
        textAlign: "center",
        color: "black",
    },
    text: {
        fontSize: 30,
        color: Colors.textColor,
        fontWeight:"bold",
        letterSpacing: 0.3
    }
})