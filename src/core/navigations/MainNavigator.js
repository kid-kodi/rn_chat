import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Icon from 'react-native-vector-icons/Ionicons';
import ChatList from '../../chat/ChatList';
import Chat from '../../chat/Chat';
import Settings from '../Settings';
import NewChat from '../../chat/NewChat';
import Contact from '../../chat/Contact';
import ChatSetting from '../../chat/ChatSetting';
import DataList from '../DataList';
import Call from '../../call/Call';
import MeetingPage from '../../call/MeetingPage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({navigation}) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
      }}>
      <Tab.Screen
        name="CHATLIST"
        component={ChatList}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({color, size}) => (
            <Icon name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CHATLIST"
        component={ChatList}
        options={{
          tabBarLabel: 'Contacts',
          tabBarIcon: ({color, size}) => (
            <Icon name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SETTINGS"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({color, size}) => (
            <Icon name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="HOME">
      <Stack.Group>
        <Stack.Screen
          name="HOME"
          component={TabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CHAT"
          component={Chat}
          options={{headerTitle: '', headerShadowVisible: false}}
        />
        <Stack.Screen
          name="CHAT_SETTINGS"
          component={ChatSetting}
          options={{headerTitle: '', headerShadowVisible: false}}
        />
        <Stack.Screen
          name="CONTACT"
          component={Contact}
          options={{headerTitle: '', headerShadowVisible: false}}
        />
        <Stack.Screen
          name="CALL"
          component={MeetingPage}
          options={{headerShown: false}}
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
      <Stack.Group screenOptions={{presentation: 'containedModal'}}>
        <Stack.Screen name="NEWCHAT" component={NewChat} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
