import "./lang"
import AuthProvider from './contexts/AuthProvider'
import { SignalProvider } from './contexts/SignalProvider'

import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './helpers/RootNavigation';
import MainNavigator from './navigations/MainNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './contexts/ThemeProvider';
import { useLayoutEffect } from 'react';
import { I18nManager } from 'react-native';
import { getLocalItem } from './helpers/checkStorage';

export default function App() {

  useLayoutEffect(() => {
    // Disable automatic RTL handling - we manage this explicitly through i18n
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);

    // Initialize app from stored user preferences (theme, language, auth state)

    const init = async () => {
      await getLocalItem();
    };

    init().finally(async () => {
      console.log("first")
      // setTimeout(async () => {
      //   BootSplash.hide({ fade: true });
      // }, 1500);
    });

  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SignalProvider>
            <NavigationContainer
              ref={navigationRef}>
              <MainNavigator />
            </NavigationContainer>
          </SignalProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}