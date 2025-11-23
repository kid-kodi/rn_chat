import {createStackNavigator} from '@react-navigation/stack';
import TabScreen from '../features/main/TabScreen';
import GalleryViewer from '../features/mediaGallery/GalleryViewer';
import MediaGallery from '../features/mediaGallery/MediaGallery';
import ChatSetting from '../features/chat/ChatSetting';
import MeetingPage from '../features/call/MeetingPage';
import IncomingCall from '../features/call/IncomingCall';
import NotificationScreens from '../features/notification/NotificationScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import EditProfileScreen from '../features/profile/EditProfileScreen';
import NewChat from '../features/chat/NewChat';
import ManageUsers from '../features/chat/ManageUsers';
import NewGroup from '../features/chat/NewGroup';
import GroupInfoScreen from '../features/chat/GroupInfoScreen';
import Chat from '../features/chat/Chat';
import Contact from '../features/chat/Contact';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name={'TAB'}
          component={TabScreen}
          options={{headerShown: false}}
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
          name="CHAT"
          component={Chat}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="INCOMING_CALL"
          component={IncomingCall}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CALL"
          component={MeetingPage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CHAT_SETTINGS"
          component={ChatSetting}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CONTACT"
          component={Contact}
          options={{headerShown: false}}
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
      <Stack.Group screenOptions={{presentation: 'containedModal'}}>
        <Stack.Screen
          name="NEWCHAT"
          component={NewChat}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MANAGE_USERS"
          component={ManageUsers}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="NEW_GROUP_PARTICIPANTS"
          component={NewGroup}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="NEW_GROUP_INFOS"
          component={GroupInfoScreen}
          options={{headerShown: false}}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
