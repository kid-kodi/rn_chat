import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import fontFamily from '../styles/fontFamily';
import { moderateScale } from '../styles/scaling';
import { t } from 'i18next';
import useIsRTL from '../hooks/useIsRTL';
import { useTheme } from '../contexts/ThemeProvider';
import { Colors, commonColors } from '../styles/colors';

const TextInputComp = ({
  containerStyle,
  inputStyle,
  error,
  touched,
  placeholder,
  rightIcon,
  onRightIconPress,
  ...props
}) => {

  const { theme } = useTheme();
  const isRTL = useIsRTL()
  const styles = useRTLStyles(isRTL, theme);
  const colors = Colors[theme];

  return (
    <View
      style={[
        styles.container,
        error && touched && styles.errorContainer,
        containerStyle,
      ]}
    >
      <TextInput
        style={[
          styles.input,
          error && touched && styles.errorInput,
          inputStyle
        ]}
        placeholderTextColor={colors.inputPlaceholder}
        placeholder={t(placeholder)}
        textAlign={isRTL ? 'right' : 'left'}
        {...props}
      />
      {rightIcon && (
        <TouchableOpacity
          onPress={onRightIconPress}
          disabled={!onRightIconPress}
        >
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
  );
};

const useRTLStyles = (isRTL, theme) => {
  const colors = Colors[theme];

  return StyleSheet.create({
    container: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: moderateScale(7),
      padding: moderateScale(14),
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      fontFamily: fontFamily.regular,
      fontSize: moderateScale(14),
      color: colors.text,
      padding: 0,
      margin: 0,
    },

    errorContainer: {
      borderColor: commonColors.error,
    },
    errorInput: {
      color: commonColors.error,
    },
  });
};

export default React.memo(TextInputComp);