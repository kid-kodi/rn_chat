import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function PageTitle(props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{props.title}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 20,
        textAlign: "center",
        color: "black",
    },
    title: {
        textAlign: "center",
        color: "black",
        fontSize: 20
    }
})