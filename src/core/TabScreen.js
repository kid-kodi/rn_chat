import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ChatList from '../chat/ChatList';
import Settings from './Settings';

import Icon from 'react-native-vector-icons/Ionicons';
import ContactList from '../contacts/ContactList';
import UserScreen from './UserScreen';

const Tab = createBottomTabNavigator();

export default function TabScreen() {
  return (
    <>
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
          name="CONTACTS"
          component={ContactList}
          options={{
            tabBarLabel: 'Contacts',
            tabBarIcon: ({color, size}) => (
              <Icon name="people-outline" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="SETTINGS"
          component={UserScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({color, size}) => (
              <Icon name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}
