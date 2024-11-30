import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';
import React from 'react';

import Screen from '../core/components/Screen';
import Header from '../core/components/Header';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../assets/styles/responsiveSize';
import TextCustom from '../core/components/TextCustom';
import Strings from '../core/constants/Strings';
import fontFamily from '../assets/styles/fontFamily';
import Input from '../core/components/Input';

import {useFormik} from 'formik';
import * as Yup from 'yup';
import Button from '../core/components/Button';
import {useUser} from '../core/contexts/UserProvider';
import Colors from '../core/constants/Colors';

const Schema = Yup.object().shape({
  firstName: Yup.string().required(Strings.FIRST_NAME_ERROR),
  lastName: Yup.string().required(Strings.LAST_NAME_ERROR),
});

export default function EditNameScreen({route, navigation}) {
  const {updateProfile} = useUser();
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
    },
    validationSchema: Schema,
    onSubmit: async values => {
      values.fullName = values.firstName + ' ' + values.lastName;
      const response = await updateProfile(values);
      if (response.success) {
        navigation.navigate('TAB');
      } else {
        toast.show(response.message, {
          type: 'danger',
          duration: 5000,
          placement: 'top',
        });
      }
    },
  });

  return (
    <Screen>
      <Header />
      <KeyboardAvoidingView
        style={{flex: 1, margin: moderateScale(16)}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <View style={{flex: 0.8}}>
              <TextCustom
                style={styles.headerStyle}
                text={Strings.UPDATE_YOUR_PROFILE_LBL}
              />
              <TextCustom
                style={styles.descStyle}
                text={Strings.ENTER_YOUR_FULLNAME_LBL}
              />

              <Input
                placeholder={Strings.FIRST_NAME}
                errorText={formik.errors.firstName}
                onChangeText={formik.handleChange('firstName')}
              />

              <Input
                placeholder={Strings.LAST_NAME}
                errorText={formik.errors.lastName}
                onChangeText={formik.handleChange('lastName')}
              />
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: 'flex-end',
                marginBottom: moderateScaleVertical(16),
              }}>
              <Button
                title={Strings.DONE}
                disabled={formik.isSubmitting}
                onPress={formik.handleSubmit}
                isLoading={formik.isSubmitting}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// define your styles
const styles = StyleSheet.create({
  headerStyle: {
    fontSize: textScale(30),
    fontFamily: fontFamily.medium,
    color: Colors.black,
  },
  descStyle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.regular,
    marginTop: moderateScaleVertical(8),
    marginBottom: moderateScaleVertical(52),
  },
});
