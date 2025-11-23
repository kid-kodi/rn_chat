import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import UserInf from './components/UserInf';
import {useUser} from './contexts/UserProvider';
import {useNavigation} from '@react-navigation/native';

const Item = ({icon, text, func}) => {
  return (
    <TouchableOpacity
      onPress={func}
      style={{flexDirection: 'row', padding: 15}}>
      <Ionicons name={icon} size={23} color={'#058451'} style={{}} />
      <Text style={{fontSize: 15, textAlign: 'left', marginLeft: 20}}>
        {text}
      </Text>
      <View style={{alignItems: 'flex-end', flex: 1}}>
        <Ionicons name={'chevron-forward'} size={23} />
      </View>
    </TouchableOpacity>
  );
};

export default function UserScreen() {
  const {user} = useUser();
  const navigation = useNavigation();

  return (
    <View style={{flex: 1}}>
      <UserInf
        avatarUri={user.profilePicture}
        username={user.fullName}
        customStyle={styles.inf}
      />
      <View style={{height: 20}} />
      <View style={styles.optionsContainer}>
        <Item
          icon={'videocam-outline'}
          text={'Paramètres de réunion'}
          func={() => {
            navigation.navigate('MEETING_SETTING');
          }}
        />
      </View>
      <View style={styles.optionsContainer}>
          <Item
            icon={'person-circle-outline'}
            text={'Informations personnelles'}
            func={() => {
              navigation.navigate('USER_SETTING');
            }}
          />
        </View>
        <View style={styles.optionsContainer}>
          <Item
            icon={'settings-outline'}
            text={'Universel'}
            func={() => {
              navigation.navigate('NORMAL_SETTING');
            }}
          />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inf: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
  },
  optionsContainer: {
    marginRight: 13,
    marginLeft: 13,
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
});
