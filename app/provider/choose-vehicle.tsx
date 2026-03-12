import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useLanguage } from '@/context/language-context';
import { styles } from '@/styles/provider/selection.styles';

export default function ChooseVehicleScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const VEHICLES = [
    { key: 'car' as const, emoji: '🚗', title: t('car'), subtitle: t('fourWheeler') },
    { key: 'bike' as const, emoji: '🏍️', title: t('bike'), subtitle: t('twoWheeler') },
    { key: 'tempo' as const, emoji: '🚐', title: t('tempo'), subtitle: t('tempoSubtitle') },
    { key: 'other' as const, emoji: '🚛', title: t('otherVehicle'), subtitle: t('otherVehicleSubtitle') },
  ];

  const handleSelect = (vehicleType: 'car' | 'bike' | 'tempo' | 'other') => {
    router.push({
      pathname: '/provider/vehicle-details',
      params: { vehicleType },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('transportTitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('whatVehicle')}</Text>
          <Text style={styles.subtitle}>{t('selectVehicleType')}</Text>

          <View style={styles.cardsRow}>
            {VEHICLES.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.card}
                onPress={() => handleSelect(item.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardEmoji}>{item.emoji}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
