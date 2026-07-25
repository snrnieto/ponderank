import '@/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { ListsProvider } from '@/state/lists-context';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const theme = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
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
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mis listas' }} />
      <Stack.Screen name="lists/[listId]/index" options={{ title: 'Lista' }} />
      <Stack.Screen name="lists/[listId]/schema" options={{ title: 'Esquema' }} />
      <Stack.Screen name="lists/[listId]/items/new" options={{ title: 'Nuevo item' }} />
      <Stack.Screen name="lists/[listId]/items/[itemId]" options={{ title: 'Editar item' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ListsProvider>
      <RootNavigator />
    </ListsProvider>
  );
}
