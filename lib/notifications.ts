import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERM_KEY = '@obol_notif_v1';
const REMINDER_ID = 'obol-daily-reminder';

async function createAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('obol-reminders', {
    name: 'Recordatorio diario',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4F46E5',
    sound: null,
  });
}

async function scheduleReminder() {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  if (existing.some((n) => n.identifier === REMINDER_ID)) return;
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: '¡Tu racha te necesita! 🔥',
      body: 'Hacé tu lección de hoy y seguí construyendo el hábito.',
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

export async function setupDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;

  const stored = await AsyncStorage.getItem(PERM_KEY);
  if (stored === 'denied') return;

  // If already granted in a previous session, just ensure the notification is scheduled
  if (stored === 'granted') {
    await createAndroidChannel();
    await scheduleReminder();
    return;
  }

  const { status: current } = await Notifications.getPermissionsAsync();
  let finalStatus = current;

  if (current !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    await AsyncStorage.setItem(PERM_KEY, 'denied');
    return;
  }

  await AsyncStorage.setItem(PERM_KEY, 'granted');
  await createAndroidChannel();
  await scheduleReminder();
}

export async function cancelDailyReminder() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
}

export async function rescheduleReminder() {
  await cancelDailyReminder();
  if (Platform.OS !== 'web') {
    await createAndroidChannel();
    await scheduleReminder();
  }
}
