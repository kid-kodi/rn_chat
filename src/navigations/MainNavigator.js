import {createStackNavigator} from '@react-navigation/stack';
import TabScreen from '../screens/main/TabScreen';
import GalleryViewer from '../screens/mediaGallery/GalleryViewer';
import MediaGallery from '../screens/mediaGallery/MediaGallery';
import ChatSetting from '../screens/chat/ChatSetting';
import MeetingPage from '../screens/call/MeetingPage';
import IncomingCall from '../screens/call/IncomingCall';
import NotificationScreens from '../screens/notification/NotificationScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NewChat from '../screens/conversations/NewChat';
import ManageUsers from '../screens/chat/ManageUsers';
import NewGroup from '../screens/conversations/NewGroup';
import GroupInfoScreen from '../screens/conversations/GroupInfoScreen';
import Chat from '../screens/chat/Chat';
import Contact from '../screens/chat/Contact';

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
