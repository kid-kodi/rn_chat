import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { BASE_API_URL } from '@env';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../assets/styles/Colors';
import { moderateScaleVertical } from '../assets/styles/responsiveSize';
import CustomImageView from './CustomImage';

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
    ongoingCall,
    checkboxRight
  } = props;

  const hideImage = props.hideImage && props.hideImage === true;

  const renderCheckbox = () => (
    <View style={checkboxRight ? styles.checkboxContainerRight : styles.checkboxContainer}>
      {isChecked ? (
        <View style={styles.checkedStyle}>
          <Icon name="checkmark-circle" size={24} color={Colors.primary} />
        </View>
      ) : (
        <View style={styles.uncheckedStyle}>
          <Icon name="ellipse-outline" size={24} color={Colors.grey} />
        </View>
      )}
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={props.onPress} onLongPress={props.onLongPress}>
      <View style={[styles.container, props.customStyles]}>
        {type === 'checkbox' && !checkboxRight && renderCheckbox()}

        {!icon && !hideImage && (
          // <ProfileImage
          //   uri={
          //     image && image !== '' ? `${BASE_API_URL}/image/${image}` : null
          //   }
          //   size={imageSize}
          // />
          <CustomImageView
            source={`${BASE_API_URL}/image/${image}`}
            firstName={title}
            size={40}
            fontSize={20}
          />
        )}

        {icon && (
          <View style={[styles.leftIconContainer, { backgroundColor: Colors.blueColor }]}>
            <Icon name={icon} size={20} color={Colors.whiteColor} />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            style={{
              ...styles.title,
              ...{ color: type === 'button' ? Colors.primary : Colors.blackColor },
            }}>
            {title}
          </Text>

          {subTitle && (
            <Text numberOfLines={1} style={styles.subTitle}>
              {subTitle}
            </Text>
          )}
        </View>

        {type === 'link' && (
          <View>
            <Icon
              name="chevron-forward-outline"
              size={18}
              color={Colors.grey}
            />
          </View>
        )}

        {/* Right side container for date and unread badge */}
        {(rightText || unreadCount > 0) && !ongoingCall && (
          <View style={styles.rightContainer}>
            {rightText && (
              <Text style={styles.rightText}>
                {rightText}
              </Text>
            )}
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        )}

        {rightAction && !ongoingCall && (
          <View>
            <TouchableOpacity
              onPress={props.rightActionPress}
              style={{ fontSize: 11, color: Colors.blackOpacity40 }}>
              <Icon
                name="chevron-forward-outline"
                size={18}
                color={Colors.grey}
              />
            </TouchableOpacity>
          </View>
        )}

        {ongoingCall?.chatId && (
          <TouchableOpacity style={styles.joinButton} onPress={props.joinCall}>
            <Text style={styles.joinButtonText}>Rejoindre</Text>
          </TouchableOpacity>
        )}

        {type === 'checkbox' && checkboxRight && renderCheckbox()}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: moderateScaleVertical(8),
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontFamily: 'medium',
    fontSize: 14,
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
  checkboxContainer: {
    marginRight: 10,
  },
  checkboxContainerRight: {
    marginLeft: 10,
  },
  checkedStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    backgroundColor: Colors.blackOpacity10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: imageSize,
    height: imageSize,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  rightText: {
    fontSize: 11,
    color: Colors.blackOpacity40,
    marginBottom: 4,
  },
  badgeContainer: {
    backgroundColor: '#FF3B30', // Red background
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF', // White text
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  joinButton: {
    backgroundColor: Colors.green,
    padding: 5,
    borderRadius: 100
  },
  joinButtonText: {
    color: Colors.whiteColor,
  }
});
