import {Text, StyleSheet} from 'react-native';
import fontFamily from '../assets/styles/fontFamily';
import Colors from '../assets/styles/Colors';
import {textScale} from '../assets/styles/responsiveSize';

export default function TextWithFont({
  text = '',
  style = {},
  children,
  ...props
}) {
  return (
    <Text
      style={{
        ...styles.textStyle,
        color: Colors.blackColor,
        ...style,
      }}
      {...props}>
      {text} {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontFamily: fontFamily.regular,
    color: Colors.whiteColor,
    fontSize: textScale(12),
    textAlign: 'left',
  },
});
