import {Component} from 'react';
import {Avatar} from 'react-native-elements';
import {ImageBackground, Text, View} from 'react-native';
import * as React from 'react';
import {StyleSheet} from 'react-native';

export default function UserInf({avatarUri, customStyle, username}) {
  return (
    <View style={[customStyle]}>
      <ImageBackground
        source={require('../../assets/images/headerBg.png')}
        style={styles.rowContainer}>
        <Avatar
          rounded
          size={70}
          source={
            avatarUri
              ? {
                  uri: avatarUri,
                }
              : require('../../assets/images/defaultProfile.jpeg')
          }
        />
        <Text style={styles.titleText}>{username}</Text>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    padding: 15,
    flexDirection: 'row',
  },
  titleText: {
    marginLeft: 15,
    textAlignVertical: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
