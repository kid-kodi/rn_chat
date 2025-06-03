import Icon from 'react-native-vector-icons/Feather';
import React from 'react';
import { HeaderButton } from 'react-navigation-header-buttons';
import Colors from '../../assets/styles/Colors';


export default function CustomHeaderButton(props) {
    return <HeaderButton
        {...props}
        IconComponent={Icon}
        iconSize={20}
        color={props.color ?? Colors.green}
    />
}