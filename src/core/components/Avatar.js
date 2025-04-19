// Fichier: components/Avatar.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const Avatar = ({ source, size = 50, online }) => {
  return (
    <View style={styles.container}>
      <Image
        source={
          source
            ? { uri: source }
            : require('../../assets/images/defaultProfile.jpeg')
        }
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
      />
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
  }
});

export default Avatar;