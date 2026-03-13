import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { searchVillages, getVillagesByDistrict, type FlatVillage } from '@/utils/village-db';
import { destinationPickerStyles as s } from '@/styles/transport.styles';

type VillageOption = {
  key: string;
  name: string;
  districtName: string;
  talukaName: string;
};

function toOption(r: FlatVillage): VillageOption {
  return {
    key: `${r.district_name}:${r.taluka_name}:${r.village_name}`,
    name: r.village_name,
    districtName: r.district_name,
    talukaName: r.taluka_name,
  };
}

export default function LocationPickerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isOrigin = mode === 'origin';

  const [items, setItems] = useState<VillageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On open: show user's district villages immediately
  useEffect(() => {
    let isActive = true;
    (async () => {
      setLoading(true);
      try {
        const district = (user?.district ?? '').trim();
        const rows = district
          ? await getVillagesByDistrict(district)
          : await searchVillages('', 80);
        if (isActive) setItems(rows.map(toOption));
      } catch {
        if (isActive) setItems([]);
      } finally {
        if (isActive) setLoading(false);
      }
    })();
    return () => { isActive = false; };
  }, [user?.district]);

  // Search as you type with 200ms debounce
  const handleQuery = (text: string) => {
    setQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const rows = text.trim()
          ? await searchVillages(text.trim())
          : await getVillagesByDistrict((user?.district ?? '').trim());
        setItems(rows.map(toOption));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const handleVillageSelect = (village: VillageOption) => {
    router.navigate({
      pathname: '/(tabs)',
      params: isOrigin
        ? { selectedOrigin: village.name }
        : { selectedDestination: village.name },
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
        value={query}
        onChangeText={handleQuery}
        autoCorrect={false}
        autoFocus
      />

      {!query.trim() && (
        <Text style={s.searchHint}>
          {user?.district
            ? `Showing villages in ${user.district} — type to search all`
            : 'Type to search villages'}
        </Text>
      )}

      {loading ? (
        <View style={s.loading}><ActivityIndicator color="#2D6A4F" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={30}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.item}
              activeOpacity={0.7}
              onPress={() => handleVillageSelect(item)}
            >
              <Text style={s.itemText}>{item.name}</Text>
              <Text style={s.itemSub}>{item.talukaName}, {item.districtName}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.empty}><Text style={s.emptyText}>{t('noResults')}</Text></View>
          }
        />
      )}
    </SafeAreaView>
  );
}
