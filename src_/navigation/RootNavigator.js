import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

import SplashScreen from '../features/splash/SplashScreen';

import {useUser} from '../contexts/UserProvider';
import {navigationRef} from '../common/utils/RootNavigation';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';

import UpdateChecker from '../components/UpdateChecker';

// Main app component with navigation
const Stack = createStackNavigator();

export default function RootNavigator() {
  const {user, isLoading} = useUser();

  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? <MainNavigator /> : <AuthNavigator />}
      <UpdateChecker />
    </NavigationContainer>
  );
}
