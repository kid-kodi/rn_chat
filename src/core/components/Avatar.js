// Fichier: components/Avatar.js
import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

const Avatar = ({ letter, source, size = 50, online }) => {
  return (
    <View style={styles.container}>
      {source ? <Image
        source={{ uri: source }}
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
      /> : <View style={[styles.cardAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.cardAvatarText, {fontSize : size / 2}]}>
          {letter}
        </Text>
      </View>}
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
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#E1E1E1',
  },
  statusIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
});

export default Avatar;