
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/auth/Login';
import OtpScreen from '../screens/onboarding/OtpScreen';
import StartScreen from '../screens/onboarding/StartScreen';
import EmailCheckScreen from '../screens/onboarding/EmailCheckScreen';
import ForgotPassword from '../screens/auth/ForgotPassword';
import VerifyAccount from '../screens/auth/VerifyAccount';
import ResetPassword from '../screens/auth/ResetPassword';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="START">
      <Stack.Screen
        name={'START'}
        component={StartScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LOGIN"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={'EMAIL_CHECK'}
        component={EmailCheckScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'OTP'}
        component={OtpScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'FORGOT_PASSORD'}
        component={ForgotPassword}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'VERIFY_ACCOUNT'}
        component={VerifyAccount}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'RESET_PASSWORD'}
        component={ResetPassword}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
