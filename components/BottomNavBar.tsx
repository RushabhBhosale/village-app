import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AuthColors } from '@/constants/theme';

const TABS = [
  { label: 'Home', icon: 'home' as const, path: '/(tabs)' },
  { label: 'Settings', icon: 'settings' as const, path: '/(tabs)/settings' },
];

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom || 8 }]}>
      {TABS.map((tab) => {
        const active = pathname === tab.path || pathname.startsWith(tab.path + '/');
        const color = active ? AuthColors.primary : AuthColors.textSecondary;
        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.tab}
            onPress={() => router.push(tab.path as any)}
            activeOpacity={0.7}
          >
            <Ionicons name={active ? tab.icon : (`${tab.icon}-outline` as any)} size={24} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: AuthColors.white,
    borderTopWidth: 1,
    borderTopColor: AuthColors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});
