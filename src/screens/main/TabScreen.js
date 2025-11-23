import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Icon from 'react-native-vector-icons/Ionicons';
import ContactList from '../contacts/ContactList';
import SettingsScreen from '../settings/SettingsScreen';
import Colors from '../../constants/Colors';
import { StyleSheet, View } from 'react-native';
import ConversationList from '../conversations/ConversationListScreen';

const Tab = createBottomTabNavigator();

export default function TabScreen() {
  return (
    <>
      <Tab.Navigator 
        id="myTabs"
        screenOptions={{
          headerShown: false,
          tabBarStyle : {display: "flex"},
          tabBarActiveTintColor: Colors.primary,
          tabBarShowLabel: false,
          size: 30,
        }}
      >
        <Tab.Screen
          name="CHATLIST"
          component={ConversationList}
          options={{
            tabBarIcon: ({color, size, focused}) =>
              focused ? (
                <Icon name="chatbubbles" size={size} color={color} />
              ) : (
                <Icon name="chatbubbles-outline" size={size} color={color} />
              ),
          }}
        />
        <Tab.Screen
          name="CONTACTS"
          component={ContactList}
          options={{
            tabBarIcon: ({color, size, focused}) =>
              focused ? (
                <Icon name="people" size={size} color={color} />
              ) : (
                <Icon name="people-outline" size={size} color={color} />
              ),
          }}
        />
        <Tab.Screen
          name="SETTINGS"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({color, size, focused}) =>
              focused ? (
                <Icon name="settings" size={size} color={color} />
              ) : (
                <Icon name="settings-outline" size={size} color={color} />
              ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  customBottomtabsStyle: {
    //height: moderateScale(60)
    backgroundColor: 'red',
  },
});