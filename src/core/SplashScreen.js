import {View, Text, ActivityIndicator, Alert} from 'react-native';
import React, {useEffect} from 'react';
import {useUser} from './contexts/UserProvider';
import {useNavigation} from '@react-navigation/native';
import Colors from './constants/Colors';
import CommonStyles from './constants/CommonStyles';
import {getFromStorage} from './helpers/StorageUtils';

export default function SplashScreen() {
  const navigation = useNavigation();
  const {autoLogin} = useUser();

  useEffect(() => {
    (async () => {
      let token = await getFromStorage('user');

      if (token) {
        const response = await autoLogin();
        if (response.user) {
          navigation.navigate('TAB');
        } else {
          navigation.navigate('START');
        }
      } else {
        navigation.navigate('START');
      }
    })();
  }, []);

  return (
    <View style={CommonStyles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
