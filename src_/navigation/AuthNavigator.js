
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../features/auth/Login';
import OtpScreen from '../features/onboarding/OtpScreen';
import StartScreen from '../features/onboarding/StartScreen';
import EmailCheckScreen from '../features/onboarding/EmailCheckScreen';
import ForgotPassword from '../features/auth/ForgotPassword';
import VerifyAccount from '../features/auth/VerifyAccount';
import ResetPassword from '../features/auth/ResetPassword';

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
