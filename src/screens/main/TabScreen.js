import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Icon from 'react-native-vector-icons/Ionicons';
import ContactList from '../contacts/ContactList';
import SettingsScreen from '../settings/SettingsScreen';
import Colors from '../../constants/Colors';
import { View } from 'react-native';
import ConversationList from '../conversations/ConversationListScreen';

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
          component={ConversationList}
          options={{ title: 'Chats', headerShown: false }}
        />
        <Tab.Screen
          name="CONTACTS"
          component={ContactList}
          options={{ title: 'Contacts', headerShown: false }}
        />
        <Tab.Screen
          name="SETTINGS"
          component={SettingsScreen}
          options={{ title: 'Paramètres', headerShown: false }}
        />
      </Tab.Navigator>
    </>
  );
}

