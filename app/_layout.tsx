import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_400Regular, Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import '../i18n';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { mergeAndSyncFromCloud } from '../lib/syncProgress';
import { setupDailyReminder } from '../lib/notifications';

// Show alerts for in-foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

try { SplashScreen.preventAutoHideAsync(); } catch {}

const IS_WEB = Platform.OS === 'web';

export default function RootLayout() {
  const { setSession, setLoading } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Baloo2_400Regular,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
    const isConfigured = url && url !== 'https://placeholder.supabase.co';
    if (!isConfigured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) mergeAndSyncFromCloud(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session?.user) {
        mergeAndSyncFromCloud(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        // progreso local se mantiene en AsyncStorage para el modo invitado
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    try { SplashScreen.hideAsync(); } catch {}
    setupDailyReminder();
  }, [fontsLoaded]);

  const nav = (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[id]" />
        <Stack.Screen name="lesson/result" />
        <Stack.Screen name="game/trivia" />
        <Stack.Screen name="game/precio-correcto" />
        <Stack.Screen name="game/inflacion-run" />
        <Stack.Screen name="game/mercado" />
        <Stack.Screen name="game/presupuesto" />
        <Stack.Screen name="character" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="legal/privacy" />
        <Stack.Screen name="legal/terms" />
      </Stack>
    </>
  );

  if (IS_WEB) {
    return (
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#4c1d95']}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={{
          width: 390,
          height: '100%' as any,
          maxHeight: 844,
          overflow: 'hidden',
          borderRadius: 40,
          boxShadow: '0px 24px 48px rgba(0,0,0,0.6)',
          // thin border to simulate phone edge
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          backgroundColor: '#EEF2FF',
        }}>
          {nav}
        </View>
      </LinearGradient>
    );
  }

  return nav;
}
