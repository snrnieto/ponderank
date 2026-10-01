import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Href } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { Platform, View } from 'react-native';

import { BrandTitle } from '@/components/ui/brand-title';
import { AppearanceSwitcher } from '@/components/ui/appearance-switcher';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { APP_NAME } from '@/constants/brand';
import { useTheme } from '@/hooks/use-theme';
import { I18nProvider, useI18n } from '@/i18n';
import { HeaderBackButton } from '@/navigation/header-back-button';
import { AppearanceProvider } from '@/state/appearance';
import { ListsProvider } from '@/state/lists-context';

SplashScreen.preventAutoHideAsync();

/** Opciones para pantallas hijas de una lista: volver lleva a la lista si no hay historial. */
function withListBack(title: string) {
  return ({ route }: { route: { params?: object } }) => {
    const listId = (route.params as { listId?: string } | undefined)?.listId;
    return {
      title,
      headerLeft: () => (
        <HeaderBackButton fallback={(listId ? `/list/${listId}` : '/list') as Href} />
      ),
    };
  };
}

function RootNavigator() {
  const theme = useTheme();
  const { t } = useI18n();

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
      <Head>
        <title>{APP_NAME}</title>
        <meta name="description" content={t.brand.description} />
      </Head>
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
        <Stack.Screen name="index" options={{ title: APP_NAME, headerShown: false }} />
        <Stack.Screen
          name="list/index"
          options={{
            title: t.titles.lists,
            headerTitle: () => <BrandTitle href={'/' as Href} />,
            headerRight: () => (
              <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginRight: theme.spacing[2] }}>
                <AppearanceSwitcher />
                <LanguageSwitcher />
              </View>
            ),
            // Es la pantalla base de la app: no tiene sentido volver a la landing con una flecha.
            headerBackVisible: false,
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="list/[listId]/index"
          options={{ title: t.titles.list, headerLeft: () => <HeaderBackButton fallback={'/list' as Href} /> }}
        />
        <Stack.Screen name="list/[listId]/schema" options={withListBack(t.titles.schema)} />
        <Stack.Screen name="list/[listId]/items/new" options={withListBack(t.titles.newOption)} />
        <Stack.Screen name="list/[listId]/items/import" options={withListBack(t.titles.import)} />
        <Stack.Screen name="list/[listId]/items/[itemId]" options={withListBack(t.titles.editOptionGeneric)} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <I18nProvider>
        <ListsProvider>
          <RootNavigator />
        </ListsProvider>
      </I18nProvider>
    </AppearanceProvider>
  );
}
