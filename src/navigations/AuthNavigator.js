import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../../auth/Login';
import Register from '../../auth/Register';
import CheckOtp from '../../auth/CheckOtp';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="LOGIN">
      <Stack.Screen
        name="LOGIN"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="REGISTER"
        component={Register}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="OTP"
        component={CheckOtp}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
