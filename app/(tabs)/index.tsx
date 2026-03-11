import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { styles } from '@/styles/home.styles';

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{t('welcomeGreeting')}</Text>
            <Text style={styles.username}>{user.fullName}</Text>
          </View>
        </View>

        <View style={styles.villageBanner}>
          <Text style={styles.villageBannerLabel}>{t('yourVillage')}</Text>
          <Text style={styles.villageBannerName}>{user.villageName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('yourProfile')}</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.fullName[0].toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.fullName}</Text>
              <Text style={styles.profilePhone}>{user.phone}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
