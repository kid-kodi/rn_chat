import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import Colors from '../constants/Colors';

const Button = props => {
  const enabledBgColor = props.color || Colors.primary;
  const disabledBgColor = Colors.lightGrey;

  return (
    <TouchableOpacity
      onPress={props.disabled ? () => {} : props.onPress}
      style={{
        ...styles.button,
        ...props.style,
      }}>
      {!!props.isLoading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <Text style={{...styles.textStyle, ...props.textStyle}}>
          {props.title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    paddingHorizontal: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.primary,
  },
  textStyle: {
    color: Colors.white,
    fontSize: 16,
  },
});

export default Button;
