import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatList from '../chat/ChatList';

import Icon from 'react-native-vector-icons/Ionicons';
import ContactList from '../contacts/ContactList';
import Navbar from './components/Navbar';
import SettingsScreen from '../settings/SettingsScreen';
import Colors from './constants/Colors';

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
            } else if (route.name === 'CHATLIST') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Calls') {
              iconName = focused ? 'call' : 'call-outline';
            } else if (route.name === 'CONTACTS') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'SETTINGS') {
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
          name="CHATLIST"
          component={ChatList}
          options={{
            title: 'Chats', header: ({ navigation }) => (
              <Navbar navigation={navigation} />
            ),
          }}
        />
        <Tab.Screen
          name="CONTACTS"
          component={ContactList}
          options={{
            title: 'Contacts', header: ({ navigation }) => (
              <Navbar navigation={navigation} />
            ),
          }}
        />
        <Tab.Screen
          name="SETTINGS"
          component={SettingsScreen}
          options={{
            title: 'Paramètres', header: ({ navigation }) => (
              <Navbar navigation={navigation} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
    // <>
    //   <Tab.Navigator screenOptions={{
    //     tabBarStyle: {
    //       paddingBottom: 10,  // <- custom bottom padding
    //       height: 60,         // <- increase height if needed
    //     },
    //     swipeEnabled: false,
    //     tabBarActiveTintColor: Colors.primaryDark
    //   }}>
    //     <Tab.Screen
    //       name="CHATLIST"
    //       component={ChatList}
    //       options={{
    //         header: ({ navigation }) => (
    //           <Navbar navigation={navigation} />
    //         ),
    //         tabBarLabel: 'Chats',
    //         tabBarIcon: ({ focused, color, size }) => (
    //           <Icon name={focused ? "chatbubble" : "chatbubble-outline"} size={size * 1.2} color={focused ? Colors.primaryGreen : Colors.lightGrey} />
    //         ),
    //       }}
    //     />
    //     <Tab.Screen
    //       name="CONTACTS"
    //       component={ContactList}
    //       options={{
    //         header: ({ navigation }) => (
    //           <Navbar navigation={navigation} />
    //         ),
    //         tabBarLabel: 'Contacts',
    //         tabBarIcon: ({ focused, color, size }) => (
    //           <Icon name={focused ? "people" : "people-outline"} size={size * 1.2} color={focused ? Colors.primaryGreen : Colors.lightGrey} />
    //         ),
    //       }}
    //     />

    //     <Tab.Screen
    //       name="SETTINGS"
    //       component={SettingsScreen}
    //       options={{
    //         header: ({ navigation }) => (
    //           <Navbar navigation={navigation} />
    //         ),
    //         tabBarLabel: 'Settings',
    //         tabBarIcon: ({ focused, color, size }) => (
    //           <Icon name={focused ? "settings" : "settings-outline"} size={size * 1.2} color={focused ? Colors.primaryGreen : Colors.lightGrey} />
    //         ),
    //       }}
    //     />
    //   </Tab.Navigator>
    // </>
  );
}

