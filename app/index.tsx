import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_KEY } from '../constants/keys';

export default function RootIndex() {
  const [target, setTarget] = useState<'/(auth)' | '/(tabs)' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      setTarget(v === 'true' ? '/(tabs)' : '/(auth)');
    });
  }, []);

  if (!target) {
    return <View style={{ flex: 1, backgroundColor: '#4F46E5' }} />;
  }
  return <Redirect href={target} />;
}
