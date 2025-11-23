// components/EmptyState.jsx
import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Colors from '../../../constants/Colors';
import CommonStyles from '../../../constants/CommonStyles';

export const EmptyState = ({ message }) => (
  <View style={CommonStyles.center}>
    <Icon name="message-circle" size={55} color={Colors.lightGrey} />
    <Text style={{ marginTop: 10, color: Colors.grey }}>{message}</Text>
  </View>
);
