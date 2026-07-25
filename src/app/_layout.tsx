import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { Platform } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { ListsProvider } from '@/state/lists-context';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const theme = useTheme();

  const navigationTheme = useMemo(
    () => ({
      ...(theme.scheme === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(theme.scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.background,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.danger,
      },
    }),
    [theme],
  );

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
    SplashScreen.hideAsync();
  }, [theme.colors.background]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: {
            color: theme.colors.text,
            fontWeight: theme.typography.weights.semibold,
          },
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
          animationDuration: 280,
          gestureEnabled: true,
          fullScreenGestureEnabled: Platform.OS === 'ios',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Mis listas' }} />
        <Stack.Screen name="lists/[listId]/index" options={{ title: 'Lista' }} />
        <Stack.Screen name="lists/[listId]/schema" options={{ title: 'Esquema' }} />
        <Stack.Screen name="lists/[listId]/items/new" options={{ title: 'Nuevo item' }} />
        <Stack.Screen name="lists/[listId]/items/[itemId]" options={{ title: 'Editar item' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ListsProvider>
      <RootNavigator />
    </ListsProvider>
  );
}
