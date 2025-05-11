import { useTheme } from '../contexts/ThemeProvider';
import { Colors } from '../styles/colors';
import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const Screen = ({
  children,
  style,
  ...safeAreaProps
}) => {
  const { theme } = useTheme();
  const colors = Colors[theme ?? 'light'];

  return (
    <SafeAreaView
      style={[styles.container, style, { backgroundColor: colors.background }]}
      {...safeAreaProps}
    >
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

export default React.memo(Screen);