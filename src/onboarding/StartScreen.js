import {Image, Text, View} from 'react-native';
import React from 'react';

import {useNavigation} from '@react-navigation/native';

import Screen from '../core/components/Screen';
import Button from '../core/components/Button';
import TextCustom from '../core/components/TextCustom';
import Colors from '../assets/styles/Colors';
import {
  moderateScaleVertical,
  textScale,
} from '../assets/styles/responsiveSize';
import Strings from '../core/constants/Strings';

export default function StartScreen() {
  const navigation = useNavigation();

  const privacyPolicy = (type = 1) => {
    if (type == 1) {
      navigation.navigate(navigationStrings.WEBVIEW, {type});
    } else {
      navigation.navigate(navigationStrings.WEBVIEW, {type});
    }
  };

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{flex: 0.3, justifyContent: 'center'}}>
          <Image
            source={require('../assets/images/logo.png')}
            style={{height: 80, width: 80}}
          />
        </View>

        <TextCustom text={Strings.BY_CLICKING_LOG_IN} style={{fontSize: 14}}>
          <Text
            style={{color: Colors.blueColor}}
            onPress={() => privacyPolicy(1)}>
            {Strings.TERMS}
          </Text>
          . {Strings.LEARN_HOW_WE_PRCOESS}
          <Text
            style={{color: Colors.blueColor}}
            onPress={() => privacyPolicy(2)}>
            {Strings.PRIVACY_POLICY}
          </Text>
        </TextCustom>

        <Button
          title={Strings.LOG_IN_WITH_PHONE_NUMBER}
          onPress={() => navigation.navigate('LOGIN')}
          style={{marginTop: 20}}
        />

        <TextCustom
          text={Strings.OR}
          style={{
            alignSelf: 'center',
            marginVertical: moderateScaleVertical(16),
            fontSize: textScale(20),
          }}
        />

        <Button
          title={`${Strings.NEW_HERE} ${Strings.SIGN_UP}`}
          onPress={() => navigation.navigate('EMAIL_CHECK')}
          style={{backgroundColor: Colors.blackOpacity10}}
          textStyle={{color: Colors.blackColor}}
        />
      </View>
    </Screen>
  );
}
