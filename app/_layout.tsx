import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { LanguageProvider, useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { user, isLoading: authLoading } = useAuth();
  const { languageSelected, isLoading: langLoading } = useLanguage();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || langLoading) return;

    const onLangSelect = segments[0] === 'language-select';
    const inAuthGroup = segments[0] === '(auth)';

    if (!languageSelected) {
      if (!onLangSelect) router.replace('/language-select' as any);
      return;
    }

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, authLoading, langLoading, languageSelected, segments]);

  return (
    <Stack>
      <Stack.Screen name="language-select" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="provider" options={{ headerShown: false }} />
      <Stack.Screen name="transport" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LanguageProvider>
        <AuthProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
