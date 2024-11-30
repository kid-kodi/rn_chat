//import liraries
import React from 'react';
import {Text, StyleSheet} from 'react-native';
import fontFamily from '../../assets/styles/fontFamily';
import colors from '../../assets/styles/Colors';
import {textScale} from '../../assets/styles/responsiveSize';

// create a component
export default TextCustom = ({text = '', style = {}, children, ...props}) => {
  return (
    <Text
      style={{
        ...styles.textStyle,
        color: colors.blackColor,
        ...style,
      }}
      {...props}>
      {text} {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    fontFamily: fontFamily.regular,
    // color: colors.whiteColor,
    fontSize: textScale(12),
    textAlign: 'left',
  },
});
