import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatList from '../chat/ChatList';

import Icon from 'react-native-vector-icons/Ionicons';
import ContactList from '../contacts/ContactList';
import Navbar from './components/Navbar';
import SettingsScreen from '../settings/SettingsScreen';
import DraggableVideoBubble from '../call/VideoDraggable';
import { Text, View } from 'react-native';
import { useChat } from './contexts/ChatProvider';
// import ChatScreen from '../tester/ChatScreen';

const Tab = createBottomTabNavigator();

export default function TabScreen() {
  return (
    <>
      <Tab.Navigator screenOptions={{
        tabBarStyle: {
          paddingBottom: 10,  // <- custom bottom padding
          height: 60,         // <- increase height if needed
        },
      }}>
        <Tab.Screen
          name="CHATLIST"
          component={ChatList}
          options={{
            header: ({ navigation }) => (
              <Navbar navigation={navigation} />
            ),
            tabBarLabel: 'Chats',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name={focused ? "chatbubble" : "chatbubble-outline"} size={size * 1.2} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="CONTACTS"
          component={ContactList}
          options={{
            header: ({ navigation }) => (
              <Navbar navigation={navigation} />
            ),
            tabBarLabel: 'Contacts',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name={focused ? "people" : "people-outline"} size={size * 1.2} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="SETTINGS"
          component={SettingsScreen}
          options={{
            header: ({ navigation }) => (
              <Navbar navigation={navigation} />
            ),
            tabBarLabel: 'Settings',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name={focused ? "settings" : "settings-outline"} size={size * 1.2} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}

