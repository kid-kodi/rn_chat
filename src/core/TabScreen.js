import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatList from '../chat/ChatList';
// import Settings from './Settings';

import Icon from 'react-native-vector-icons/Ionicons';
import ContactList from '../contacts/ContactList';
import UserScreen from './UserScreen';
import Navbar from './components/Navbar';
import SettingsScreen from '../settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabScreen() {
  return (
    <>
      <Tab.Navigator>
        <Tab.Screen
          name="CHATLIST"
          component={ChatList}
          options={{
            header: ({navigation}) => (
              <Navbar navigation={navigation}/>
            ),
            tabBarLabel: 'Chats',
            tabBarIcon: ({ color, size }) => (
              <Icon name="chatbubble-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="CONTACTS"
          component={ContactList}
          options={{
            header: ({navigation}) => (
              <Navbar navigation={navigation}/>
            ),
            tabBarLabel: 'Contacts',
            tabBarIcon: ({ color, size }) => (
              <Icon name="people-outline" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="SETTINGS"
          component={SettingsScreen}
          options={{
            header: ({navigation}) => (
              <Navbar navigation={navigation}/>
            ),
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Icon name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}
