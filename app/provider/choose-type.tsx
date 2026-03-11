import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useLanguage } from '@/context/language-context';
import { styles } from '@/styles/provider/selection.styles';

export default function ChooseTypeScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const TYPES = [
    { key: 'transport' as const, emoji: '🚗', title: t('transport'), subtitle: t('offerRidesDeliveries') },
    { key: 'shop' as const, emoji: '🏪', title: t('shop'), subtitle: t('sellProducts') },
  ];

  const handleSelect = (type: 'transport' | 'shop') => {
    if (type === 'transport') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push('/provider/choose-vehicle' as any);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push('/provider/shop-details' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('becomeProviderTitle')}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t('whatDoYouOffer')}</Text>
        <Text style={styles.subtitle}>{t('chooseServiceType')}</Text>

        <View style={styles.cardsRow}>
          {TYPES.map((item) => (
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
    </SafeAreaView>
  );
}
