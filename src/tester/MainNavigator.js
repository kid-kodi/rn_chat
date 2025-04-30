import { Text, View } from 'react-native'
import React from 'react'

import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from './ProfileScreen';
import TabScreen from './TabScreen';
import ChatScreen from './ChatScreen';
import NewContactScreen from './NewContactScreen';

// Main app component with navigation
const Stack = createStackNavigator();

export default function MainNavigator() {

  return (
    <View style={{ flex: 1 }}>
      <>
        <Stack.Navigator initialRouteName={'TAB'}>
          <Stack.Group>
            <Stack.Screen
              name={'TAB'}
              component={TabScreen}
              options={{ headerShown: false }}
            />
          </Stack.Group>
          <Stack.Group
            screenOptions={{ presentation: 'containedModal' }}>
            <Stack.Screen
              name="PROFILE"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CHAT"
              component={ChatScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NEW_CONTACT"
              component={NewContactScreen}
              options={{ headerShown: false }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </>
    </View>
  )
}
