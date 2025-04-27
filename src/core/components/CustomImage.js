import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const getColorFromName = (name) => {
    // Simple hash function to generate consistent color from name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
};

const CustomImageView = ({ source, firstName, size = 60, fontSize = 24, style, online }) => {
    const [error, setError] = useState(false);
    const initials = firstName ? firstName.charAt(0).toUpperCase() : '?';
    const bgColor = getColorFromName(firstName || '');

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: error ? bgColor : 'transparent',
                },
                style,
            ]}
        >
            {!error ? (
                <Image
                    source={{ uri: source }}
                    style={{ width: size, height: size, borderRadius: size / 2 }}
                    onError={(e) => {
                        setError(true)}}
                />
            ) : (
                <Text style={[styles.initial, { fontSize }]}>{initials}</Text>
            )}

            {online !== undefined && (
                <View
                    style={[
                        styles.statusIndicator,
                        {
                            backgroundColor: online ? '#4CAF50' : '#9E9E9E',
                            right: 0,
                            bottom: 0,
                            width: size / 4,
                            height: size / 4,
                            borderRadius: size / 8
                        }
                    ]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    initial: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusIndicator: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
});

export default CustomImageView;
