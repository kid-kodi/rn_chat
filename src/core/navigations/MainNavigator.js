import { Text, View } from 'react-native'
import React from 'react'

import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../SplashScreen';
import StartScreen from '../../onboarding/StartScreen';
import EmailCheckScreen from '../../onboarding/EmailCheckScreen';
import OtpScreen from '../../onboarding/OtpScreen';
import EditPasswordScreen from '../../onboarding/EditPasswordScreen';
import EditNameScreen from '../../onboarding/EditNameScreen';
import Login from '../../auth/Login';
import Register from '../../auth/Register';
import EditProfileScreen from '../../profile/EditProfileScreen';
import ProfileScreen from '../../profile/ProfileScreen';
import NotificationScreens from '../../notification/NotificationScreen';
import TabScreen from '../TabScreen';
import Chat from '../../chat/Chat';
import IncomingCall from '../../call/IncomingCall';
import MeetingPage from '../../call/MeetingPage';
import Contact from '../../chat/Contact';
import ChatSetting from '../../chat/ChatSetting';
import NewChat from '../../chat/NewChat';
import ManageUsers from '../../chat/ManageUsers';
import NewGroup from '../../chat/NewGroup';
import GroupInfoScreen from '../../chat/GroupInfoScreen';
import DraggableVideoBubble from '../../call/VideoDraggable';
import { useChat } from '../contexts/ChatProvider';
import { navigate } from '../helpers/RootNavigation';
import MediaGallery from '../../mediaGallery/MediaGallery';
import GalleryViewer from '../../mediaGallery/GalleryViewer';

// Main app component with navigation
const Stack = createStackNavigator();

export default function MainNavigator() {

  const { chat, showBubble, maximizeCall } = useChat();

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
              options={{
                headerTitle: '',
                headerShadowVisible: false,
              }}
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
      {/* Show floating bubble when call is active but minimized */}
      {showBubble && (
        <DraggableVideoBubble
          videoComponent={<VideoComponent />}
          onExpand={() => {
            maximizeCall();
            navigate("CALL", {
              chatId: chat._id,
              cameraStatus: false,
              microphoneStatus: true,
            })
          }} // This now calls the navigation function in context
          onClose={() => maximizeCall()}
          onMinimize={() => { }} // Not needed since we're already minimized
        />
      )}
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