import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { shadow } from '../../constants/platform';

const ACTIVE_COLOR   = '#4F46E5';
const INACTIVE_COLOR = '#94A3B8';
const BG_COLOR       = '#FFFFFF';

function TabIcon({
  name, nameActive, label, focused,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  nameActive: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.wrap, focused && styles.wrapActive]}>
      {focused && <View style={[styles.activePill, { backgroundColor: ACTIVE_COLOR + '18' }]} />}
      <Ionicons
        name={focused ? nameActive : name}
        size={24}
        color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
      <Text style={[styles.label, { color: focused ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 6,
    paddingHorizontal: 4,
    position: 'relative',
    minWidth: 54,
  },
  wrapActive: {},
  activePill: {
    position: 'absolute',
    top: 2, left: -6, right: -6, bottom: 0,
    borderRadius: 14,
  },
  label: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 9.5,
    letterSpacing: 0.1,
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: BG_COLOR,
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 0,
          elevation: 12,
          ...shadow(-4, 16, '#4F46E5', 0.08),
        },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="map-outline"
              nameActive="map"
              label="Inicio"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="calculator-outline"
              nameActive="calculator"
              label="Calcular"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="game-controller-outline"
              nameActive="game-controller"
              label="Juegos"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="league"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="trophy-outline"
              nameActive="trophy"
              label="Liga"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="person-outline"
              nameActive="person"
              label="Perfil"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
