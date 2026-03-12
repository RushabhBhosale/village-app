import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { districtCodeFromName, getDistricts, getTalukas, getVillages, type MahaItem } from '@/utils/mahabhumi';
import { destinationPickerStyles as s } from '@/styles/transport.styles';

type VillageOption = MahaItem & {
  key: string;
  districtCode: string;
  districtName: string;
  talukaCode: string;
  talukaName: string;
  priority: number;
};

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

export default function LocationPickerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isOrigin = mode === 'origin';

  const [villages, setVillages] = useState<VillageOption[]>([]);
  const [drillLoading, setDrillLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [drillQuery, setDrillQuery] = useState('');

  // Load all villages and prioritize current user's district at top.
  useEffect(() => {
    let isActive = true;
    (async () => {
      setDrillLoading(true);
      setLoadingMore(false);
      setVillages([]);
      try {
        const districts = await getDistricts();
        if (!isActive) return;

        const userDistrictName = (user?.district ?? '').trim();
        const userDistrictCode = userDistrictName ? districtCodeFromName(userDistrictName) : null;
        const preferredDistrict =
          districts.find((d) => d.code === userDistrictCode) ??
          districts.find((d) => normalizeText(d.value) === normalizeText(userDistrictName)) ??
          null;

        const orderedDistricts = preferredDistrict
          ? [preferredDistrict, ...districts.filter((d) => d.code !== preferredDistrict.code)]
          : districts;

        const next: VillageOption[] = [];
        let hasShownData = false;
        setLoadingMore(true);

        for (const district of orderedDistricts) {
          const talukas = await getTalukas(district.code).catch(() => [] as MahaItem[]);

          const villagesByTaluka = await Promise.all(
            talukas.map(async (taluka) => ({
              taluka,
              villages: await getVillages(district.code, taluka.code).catch(() => [] as MahaItem[]),
            })),
          );

          for (const talukaGroup of villagesByTaluka) {
            for (const village of talukaGroup.villages) {
              next.push({
                ...village,
                key: `${district.code}:${talukaGroup.taluka.code}:${village.code}:${village.value}`,
                districtCode: district.code,
                districtName: district.value,
                talukaCode: talukaGroup.taluka.code,
                talukaName: talukaGroup.taluka.value,
                priority: preferredDistrict && district.code === preferredDistrict.code ? 0 : 1,
              });
            }
          }

          if (!isActive) return;
          setVillages([...next]);
          if (!hasShownData) {
            hasShownData = true;
            setDrillLoading(false);
          }
        }

        if (!isActive) return;
        setVillages(
          [...next].sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.value.localeCompare(b.value, 'mr');
          }),
        );
      } finally {
        if (!isActive) return;
        setDrillLoading(false);
        setLoadingMore(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [user?.district]);

  const filteredItems = useMemo(() => {
    if (!drillQuery.trim()) return villages;
    const q = drillQuery.toLowerCase();
    return villages.filter((i) => i.value.toLowerCase().includes(q));
  }, [drillQuery, villages]);

  const handleVillageSelect = (village: VillageOption) => {
    router.navigate({
      pathname: '/(tabs)',
      params: isOrigin
        ? { selectedOrigin: village.value }
        : { selectedDestination: village.value },
    } as any);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#2D6A4F" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>
            {isOrigin ? t('selectOrigin') : t('selectDestination')}
          </Text>
        </View>
      </View>

      <TextInput
        style={s.searchBox}
        placeholder={t('searchVillage')}
        placeholderTextColor="#9CA3AF"
        value={drillQuery}
        onChangeText={setDrillQuery}
        autoCorrect={false}
      />

      {drillLoading && villages.length === 0 ? (
        <View style={s.loading}><ActivityIndicator color="#2D6A4F" /></View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.key}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={40}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.item}
              activeOpacity={0.7}
              onPress={() => handleVillageSelect(item)}
            >
              <Text style={s.itemText}>{item.value}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.empty}><Text style={s.emptyText}>{t('noResults')}</Text></View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator color="#2D6A4F" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
