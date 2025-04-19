import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from 'react-native-toast-notifications';
import Toast from 'react-native-toast-notifications';
import Orientation from 'react-native-orientation-locker';
import SplashScreen from './src/core/SplashScreen';
import Login from './src/auth/Login';
import Register from './src/auth/Register';
import TabScreen from './src/core/TabScreen';
import ApiProvider from './src/core/contexts/ApiProvider';
import { NavigationContainer } from '@react-navigation/native';
import UserProvider from './src/core/contexts/UserProvider';
import ChatProvider from './src/core/contexts/ChatProvider';
import DataList from './src/core/DataList';
import MeetingPage from './src/call/MeetingPage';
import Contact from './src/chat/Contact';
import ChatSetting from './src/chat/ChatSetting';
import Chat from './src/chat/Chat';
import NewChat from './src/chat/NewChat';
import SocketProvider from './src/core/contexts/SocketProvider';
import { MenuProvider } from 'react-native-popup-menu';
import EditProfile from './src/auth/EditProfile';
import { Alert, Linking } from 'react-native';

import StartScreen from './src/onboarding/StartScreen';
import Strings from './src/core/constants/Strings';
import EmailCheckScreen from './src/onboarding/EmailCheckScreen';
import OtpScreen from './src/onboarding/OtpScreen';
import EditPasswordScreen from './src/onboarding/EditPasswordScreen';
import EditNameScreen from './src/onboarding/EditNameScreen';
import NewGroup from './src/chat/NewGroup';
import AddParticipants from './src/chat/AddParticipants';

import messaging from '@react-native-firebase/messaging';
import { RequestUserPermission } from './src/core/helpers/NotificationService';
import NotificationProvider from './src/core/contexts/NotificationProvider';
import AutoLogin from './src/core/components/AutoLogin';
import RNCallKeep from 'react-native-callkeep';
import MeetingSettingScreen from './src/core/MeetingSettingScreen';
import UserSettingScreen from './src/core/UserSettingScreen';
import NormalSetting from './src/core/NormalSetting';
import EditProfileScreen from './src/profile/EditProfileScreen';
import ProfileScreen from './src/profile/ProfileScreen';
import NotificationScreens from './src/notification/NotificationScreen';

const Stack = createStackNavigator();

const NAVIGATION_IDS = ['call'];

function buildDeepLinkFromNotificationData(data) {
  const navigationId = data?.navigationId;
  if (navigationId && !navigationId.includes('ky92://')) {
    console.warn('Unverified navigationId', navigationId);
    return null;
  }
  return navigationId;
}

const linking = {
  prefixes: ['ky92://'],
  config: {
    screens: {
      CALL: 'call/:chatId/:cameraStatus/:microphoneStatus',
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (typeof url === 'string') {
      return url;
    }
    //getInitialNotification: When the application is opened from a quit state.
    const message = await messaging().getInitialNotification();
    const deeplinkURL = buildDeepLinkFromNotificationData(message?.data);
    if (typeof deeplinkURL === 'string') {
      return deeplinkURL;
    }
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }) => listener(url);

    // Listen to incoming links from deep linking
    const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

    //onNotificationOpenedApp: When the application is running, but in the background.
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      const url = buildDeepLinkFromNotificationData(remoteMessage.data);
      if (typeof url === 'string') {
        listener(url);
      }
    });

    return () => {
      linkingSubscription.remove();
      unsubscribe();
    };
  },
};

export default function App() {
  Orientation.lockToPortrait();

  useEffect(() => {
    RequestUserPermission();
    Strings.setLanguage('FR');
  }, [messaging]);

  useEffect(() => {
    const options = {
      ios: {
        appName: 'Solisakane',
      },
      android: {
        alertTitle: 'Permissions required',
        alertDescription:
          'This application needs to access your phone accounts',
        cancelButton: 'Annuler',
        okButton: 'Accepter',
        imageName: 'phone_account_icon',
      },
    };
    RNCallKeep.setup(options);
    RNCallKeep.setAvailable(true);
  }, []);

  return (
    <ToastProvider>
      <ApiProvider>
        <SocketProvider>
          <UserProvider>
            <ChatProvider>
              <SafeAreaProvider>
                <MenuProvider>
                  <NavigationContainer
                    linking={linking}
                    fallback={<AutoLogin />}>
                    <>
                      <NotificationProvider>
                        <Stack.Navigator initialRouteName={'SPLASH'}>
                          <Stack.Group>
                            <Stack.Screen
                              name={'SPLASH'}
                              component={SplashScreen}
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name={'START'}
                              component={StartScreen}
                              options={{
                                headerShown: false,
                              }}
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
                              name={'EDIT_PASSWORD'}
                              component={EditPasswordScreen}
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name={'EDIT_NAME'}
                              component={EditNameScreen}
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name={'LOGIN'}
                              component={Login}
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name={'REGISTER'}
                              component={Register}
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name={'EDIT_PROFILE'}
                              component={EditProfileScreen}
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name={'PROFILE'}
                              component={ProfileScreen}
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name={'NOTIFICATION'}
                              component={NotificationScreens}
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name={'TAB'}
                              component={TabScreen}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name="CHAT"
                              component={Chat}
                              options={{
                                headerShadowVisible: false,
                              }}
                            />
                            <Stack.Screen
                              name="CALL"
                              component={MeetingPage}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name="CHAT_SETTINGS"
                              component={ChatSetting}
                              options={{
                                headerTitle: '',
                                headerShadowVisible: false,
                              }}
                            />
                            <Stack.Screen
                              name="CONTACT"
                              component={Contact}
                              options={{
                                headerTitle: '',
                                headerShadowVisible: false,
                              }}
                            />
                            <Stack.Screen
                              name="PARTICIPANTS"
                              component={DataList}
                              options={{
                                headerTitle: '',
                                headerShadowVisible: false,
                              }}
                            />
                          </Stack.Group>
                          <Stack.Group
                            screenOptions={{ presentation: 'containedModal' }}>
                            <Stack.Screen
                              name="NEWCHAT"
                              component={NewChat}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name="NEWCONTACT"
                              component={NewChat}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name="NEW_GROUP"
                              component={NewGroup}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name="ADD_PARTICIPANTS"
                              component={AddParticipants}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name="MEETING_SETTING"
                              component={MeetingSettingScreen}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name="USER_SETTING"
                              component={UserSettingScreen}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name="NORMAL_SETTING"
                              component={NormalSetting}
                              options={{ headerShown: false }}
                            />
                          </Stack.Group>
                        </Stack.Navigator>
                      </NotificationProvider>
                    </>
                  </NavigationContainer>
                  <Toast ref={ref => (global['toast'] = ref)} />
                </MenuProvider>
              </SafeAreaProvider>
            </ChatProvider>
          </UserProvider>
        </SocketProvider>
      </ApiProvider>
    </ToastProvider>
  );
}
