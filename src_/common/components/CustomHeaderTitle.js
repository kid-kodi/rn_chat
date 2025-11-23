import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import defaultProfile from '../../assets/images/defaultProfile.jpeg';

import fontFamily from '../../assets/styles/fontFamily';
import Colors from '../../assets/styles/Colors';

const CustomHeaderTitle = ({avatar, title, subtitle, onPress}) => {
  const source = avatar ? {uri: avatar} : defaultProfile;
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}>
      <Image
        source={source} // Replace with your image URL
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 10,
    marginLeft: -20,
    borderWidth:1,
    borderColor:Colors.grey
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent : "center"
  },
  title: {
    fontFamily : fontFamily.bold,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.blackOpacity60
  },
  subtitle: {
    fontFamily : fontFamily.regular,
    fontSize: 12,
    color: Colors.blackOpacity40
  },
});

export default CustomHeaderTitle;
