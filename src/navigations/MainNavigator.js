import { Text, View } from 'react-native'

import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/splash/SplashScreen';
import StartScreen from '../screens/onboarding/StartScreen';
import EmailCheckScreen from '../screens/onboarding/EmailCheckScreen';
import OtpScreen from '../screens/onboarding/OtpScreen';
import EditPasswordScreen from '../screens/onboarding/EditPasswordScreen';
import EditNameScreen from '../screens/onboarding/EditNameScreen';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationScreens from '../screens/notification/NotificationScreen';

import Chat from '../screens/chat/Chat';
import IncomingCall from '../screens/call/IncomingCall';
import MeetingPage from '../screens/call/MeetingPage';
import Contact from '../screens/chat/Contact';
import ChatSetting from '../screens/chat/ChatSetting';
import NewChat from '../screens/chat/NewChat';
import ManageUsers from '../screens/chat/ManageUsers';
import NewGroup from '../screens/chat/NewGroup';
import GroupInfoScreen from '../screens/chat/GroupInfoScreen';
import MediaGallery from '../screens/mediaGallery/MediaGallery';
import GalleryViewer from '../screens/mediaGallery/GalleryViewer';
import TabScreen from '../screens/main/TabScreen';

// Main app component with navigation
const Stack = createStackNavigator();

export default function MainNavigator() {

  return (
    <View style={{ flex: 1 }}>
      <>
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
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="INCOMING_CALL"
              component={IncomingCall}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CALL"
              component={MeetingPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CHAT_SETTINGS"
              component={ChatSetting}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CONTACT"
              component={Contact}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MEDIA_GALLERY"
              component={MediaGallery}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="GALLERY_VIEWER"
              component={GalleryViewer}
              options={{
                headerShown: false,
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
              name="MANAGE_USERS"
              component={ManageUsers}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NEW_GROUP_PARTICIPANTS"
              component={NewGroup}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NEW_GROUP_INFOS"
              component={GroupInfoScreen}
              options={{ headerShown: false }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </>
    </View>)
}



// Video Component - replace with actual WebRTC implementation
const VideoComponent = () => (
  <View style={{
    flex: 1,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <Text style={{ color: 'white' }}>Video Stream</Text>
    {/* Replace with actual RTCView */}
    {/* <RTCView streamURL={stream.toURL()} style={{flex: 1}} /> */}
  </View>
);