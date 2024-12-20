import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import ProfileImage from './ProfileImage';
import {BASE_API_URL} from '@env';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/styles/Colors';

const imageSize = 40;

export default function DataItem(props) {
  const {
    title,
    subTitle,
    image,
    type,
    isChecked,
    icon,
    unreadCount,
    rightText,
    rightAction,
  } = props;

  const hideImage = props.hideImage && props.hideImage === true;

  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
      <View style={styles.container}>
        {!icon && !hideImage && (
          <ProfileImage
            uri={
              image && image !== '' ? `${BASE_API_URL}/image/${image}` : null
            }
            size={imageSize}
          />
        )}

        {icon && (
          <View style={styles.leftIconContainer}>
            <Icon name={icon} size={20} color={Colors.primary} />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            style={{
              ...styles.title,
              ...{color: type === 'button' ? Colors.primary : Colors.textColor},
            }}>
            {title}
          </Text>

          {subTitle && (
            <Text numberOfLines={1} style={styles.subTitle}>
              {subTitle}
            </Text>
          )}
        </View>

        {unreadCount > 0 && (
          <View style={styles.badgeConainer}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}

        {type === 'checkbox' && (
          <View
            style={{
              ...styles.iconContainer,
              ...(isChecked && styles.checkedStyle),
            }}>
            <Icon name="checkmark" size={18} color="white" />
          </View>
        )}

        {type === 'link' && (
          <View>
            <Icon
              name="chevron-forward-outline"
              size={18}
              color={Colors.grey}
            />
          </View>
        )}

        {rightText && (
          <View>
            <Text style={{fontSize: 11, color: Colors.blackOpacity40}}>
              {rightText}
            </Text>
          </View>
        )}

        {rightAction && (
          <View>
            <TouchableOpacity
              onPress={props.rightActionPress}
              style={{fontSize: 11, color: Colors.blackOpacity40}}>
              <Icon
                name="chevron-forward-outline"
                size={18}
                color={Colors.grey}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 7,
    alignItems: 'center',
    minHeight: 50,
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontFamily: 'medium',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subTitle: {
    fontFamily: 'regular',
    color: Colors.grey,
    letterSpacing: 0.3,
  },
  iconContainer: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.lightGrey,
    backgroundColor: 'white',
  },
  checkedStyle: {
    backgroundColor: Colors.primary,
    borderColor: 'transparent',
  },
  leftIconContainer: {
    backgroundColor: Colors.blackOpacity10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: imageSize,
    height: imageSize,
  },
  badgeConainer: {
    backgroundColor: Colors.red,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    textColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
