import { createStackNavigator } from "@react-navigation/stack";
import EditPasswordScreen from "../screens/onboarding/EditPasswordScreen";
import EditNameScreen from "../screens/onboarding/EditNameScreen";

const Stack = createStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator initialRouteName="EDIT_PASSWORD">
      <Stack.Screen
        name={'EDIT_PASSWORD'}
        component={EditPasswordScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'EDIT_NAME'}
        component={EditNameScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
