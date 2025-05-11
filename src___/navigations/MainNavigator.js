import { View } from 'react-native'

import { createStackNavigator } from '@react-navigation/stack';
import { Login, Register } from '../screens';

// Main app component with navigation
const Stack = createStackNavigator();

export default function MainNavigator() {

  return (
    <View style={{ flex: 1 }}>
      <>
        <Stack.Navigator initialRouteName={'Login'}>
          <Stack.Group>
            <Stack.Screen
              name={'Login'}
              component={Login}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name={'Signup'}
              component={Register}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </>

    </View>)
}