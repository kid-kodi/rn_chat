//import liraries
import {View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {moderateScale, textScale} from '../assets/styles/responsiveSize';
import imagePath from '../constants/imagePath';
import {useNavigation} from '@react-navigation/native';

import colors from '../assets/styles/Colors';
import TextWithFont from './TextWithFont';
import fontFamily from '../assets/styles/fontFamily';

export default function Header({
  onPressLeft,
  leftText = '',
  isLeftImage = true,
  style = {},
  rightTextStyle = {},
  rightText = '',
  onPressRight = () => {},
  rightImage = null,
}) {
  const navigation = useNavigation();

  
  
  return (
    <View style={{...styles.container, ...style}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {isLeftImage ? (
          <TouchableOpacity
            style={{marginRight: moderateScale(16)}}
            onPress={!!onPressLeft ? onPressLeft : () => navigation.goBack()}>
            <Image
              style={{
                tintColor:colors.blackColor
              }}
              source={imagePath.icBack}
            />
          </TouchableOpacity>
        ) : null}

        {!!leftText ? (
          <TextWithFont style={styles.textStyle} text={leftText} />
        ) : null}
      </View>

      {!!rightText ? (
        <TouchableOpacity onPress={onPressRight}>
          <TextWithFont style={{...styles.textStyle, ...rightTextStyle}}>
            {rightText}
          </TextWithFont>
        </TouchableOpacity>
      ) : null}

      {!!rightImage ? (
        <TouchableOpacity onPress={onPressRight}>
          <Image
            style={{
              tintColor: colors.blackColor,
            }}
            source={rightImage}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}


// define your styles
const styles = StyleSheet.create({
    container: {
        height: moderateScale(42),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(16)
    },
    textStyle: {
        fontSize: textScale(20),
        fontFamily: fontFamily.bold,
    }
});