import {View, Text, TextInput, StyleSheet} from 'react-native';
import React from 'react';
import Colors from '../constants/Colors';

export default function Input(props) {
  return (
    <View style={styles.container}>
      {props.label && <Text style={styles.label}>{props.label}</Text>}
      <View style={styles.inputContainer}>
        {props.icon && (
          <props.iconPack
            name={props.icon}
            size={props.iconSize || 20}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor={props.placeholderTextColor}
          {...props}
        />
        {!!props.secureText ? (
          <Text style={{...styles.textStyle, flex: 0}} onPress={props.onPressSecure}>
            {props.secureText}
          </Text>
        ) : null}
      </View>
      {props.errorText && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{props.errorText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginVertical: 10,
    fontFamily: 'bold',
    letterSpacing: 0.3,
    color: Colors.textColor,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: Colors.nearlyWhite,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
    color: Colors.grey,
  },
  input: {
    color: Colors.textColor,
    flex: 1,
    fontFamily: 'regular',
    letterSpacing: 0.3,
    paddingTop: 0,
  },
  errorContainer: {
    marginVertical: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },
});
