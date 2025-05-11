import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import HomeScreen from './HomeScreen';
import Colors from '../core/constants/Colors';
import SettingsScreen from './SettingsScreen';
import CallsScreen from './CallScreen';
import ContactListScreen from './ContactListScreen';
import ChatListScreen from './ChatListScreen';


const Tab = createBottomTabNavigator();

export default function TabScreen() {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            // Set different icons based on route name
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Chats') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Calls') {
              iconName = focused ? 'call' : 'call-outline';
            } else if (route.name === 'Contacts') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            height: 60,
            paddingBottom: 5,
            paddingTop: 5,
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home', headerShown: false }}
        />
        <Tab.Screen
          name="Chats"
          component={ChatListScreen}
          options={{ title: 'Chats', headerShown: false }}
        />
        <Tab.Screen
          name="Calls"
          component={CallsScreen}
          options={{ title: 'Appels', headerShown: false }}
        />
        <Tab.Screen
          name="Contacts"
          component={ContactListScreen}
          options={{ title: 'Contacts', headerShown: false }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Paramètres', headerShown: false }}
        />
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({});