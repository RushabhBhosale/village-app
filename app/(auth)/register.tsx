import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
  MahaItem,
  detectFullLocationFromGPS,
  getDistricts,
  getTalukas,
  getVillages,
} from '@/utils/mahabhumi';
import { AuthColors } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { styles } from '@/styles/auth/register.styles';

type DrillLevel = 'district' | 'taluka' | 'village';

function normalizePlaceName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/(district|dist\.?|taluka|taluk|tehsil|tahsil|county|जिल्हा|तालुका|तहसील)/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestMatch(items: MahaItem[], hint: string): MahaItem | null {
  const normalizedHint = normalizePlaceName(hint);
  if (!normalizedHint) return null;

  const compactHint = normalizedHint.replace(/\s+/g, '');
  const exact = items.find((item) => normalizePlaceName(item.value).replace(/\s+/g, '') === compactHint);
  if (exact) return exact;

  const contains = items.find((item) => {
    const normalizedItem = normalizePlaceName(item.value).replace(/\s+/g, '');
    return normalizedItem.includes(compactHint) || compactHint.includes(normalizedItem);
  });
  if (contains) return contains;

  const hintWords = normalizedHint.split(' ').filter(Boolean);
  if (hintWords.length > 1) {
    const allWords = items.find((item) => {
      const normalizedItem = normalizePlaceName(item.value);
      return hintWords.every((word) => normalizedItem.includes(word));
    });
    if (allWords) return allWords;
  }

  return null;
}

function getUniqueHints(...hints: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const values: string[] = [];
  for (const hint of hints) {
    const value = (hint ?? '').trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    values.push(value);
  }
  return values;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    village?: string;
  }>({});

  // Location selection
  const [selectedDistrict, setSelectedDistrict] = useState<MahaItem | null>(null);
  const [selectedTaluka, setSelectedTaluka] = useState<MahaItem | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<MahaItem | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const hasDetected = useRef(false);

  // Auto-detect location on mount (same pattern as home screen transport "from" field)
  useEffect(() => {
    if (hasDetected.current) return;
    hasDetected.current = true;
    let isActive = true;
    (async () => {
      setDetectingLocation(true);
      try {
        const result = await detectFullLocationFromGPS();
        if (!result || !isActive) return;

        const allDistricts = await getDistricts();
        if (!isActive) return;
        const districtMatch = allDistricts.find((d) => d.code === result.districtCode);
        if (!districtMatch) return;
        setSelectedDistrict(districtMatch);

        const talukaHints = getUniqueHints(result.talukaHint, result.talukaHintFallback);
        const villageHints = getUniqueHints(result.villageHint, result.villageHintFallback);

        const allTalukas = await getTalukas(districtMatch.code);
        if (!isActive) return;
        let talukaMatch: MahaItem | null = null;
        for (const hint of talukaHints) {
          talukaMatch = findBestMatch(allTalukas, hint);
          if (talukaMatch) break;
        }

        let villageMatch: MahaItem | null = null;
        if (talukaMatch && villageHints.length) {
          const allVillages = await getVillages(districtMatch.code, talukaMatch.code);
          if (!isActive) return;
          for (const hint of villageHints) {
            villageMatch = findBestMatch(allVillages, hint);
            if (villageMatch) break;
          }
        }

        // If taluka hint is noisy, search village across talukas in detected district.
        if (!villageMatch && villageHints.length) {
          for (const taluka of allTalukas) {
            const villages = await getVillages(districtMatch.code, taluka.code);
            if (!isActive) return;
            for (const hint of villageHints) {
              villageMatch = findBestMatch(villages, hint);
              if (villageMatch) {
                talukaMatch = taluka;
                break;
              }
            }
            if (villageMatch) break;
          }
        }

        if (talukaMatch) setSelectedTaluka(talukaMatch);
        if (villageMatch) {
          setSelectedVillage(villageMatch);
          setErrors((e) => ({ ...e, village: undefined }));
        }
      } catch {
        // Best effort only; manual picker remains available.
      } finally {
        if (isActive) setDetectingLocation(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, []);

  // Drill-down modal
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('district');
  const [drillItems, setDrillItems] = useState<MahaItem[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillQuery, setDrillQuery] = useState('');

  const openLocationPicker = async () => {
    setDrillOpen(true);
    setDrillQuery('');
    setDrillLoading(true);
    try {
      if (selectedDistrict && selectedTaluka) {
        setDrillLevel('village');
        setDrillItems(await getVillages(selectedDistrict.code, selectedTaluka.code));
        return;
      }
      if (selectedDistrict) {
        setDrillLevel('taluka');
        setDrillItems(await getTalukas(selectedDistrict.code));
        return;
      }
      setDrillLevel('district');
      setDrillItems(await getDistricts());
    } catch {
      setDrillItems([]);
    } finally {
      setDrillLoading(false);
    }
  };

  const handleDistrictSelect = async (district: MahaItem) => {
    setSelectedDistrict(district);
    setSelectedTaluka(null);
    setSelectedVillage(null);
    setDrillLevel('taluka');
    setDrillQuery('');
    setDrillLoading(true);
    try {
      setDrillItems(await getTalukas(district.code));
    } catch { setDrillItems([]); } finally { setDrillLoading(false); }
  };

  const handleTalukaSelect = async (taluka: MahaItem) => {
    setSelectedTaluka(taluka);
    setSelectedVillage(null);
    setDrillLevel('village');
    setDrillQuery('');
    setDrillLoading(true);
    try {
      setDrillItems(await getVillages(selectedDistrict!.code, taluka.code));
    } catch { setDrillItems([]); } finally { setDrillLoading(false); }
  };

  const handleVillageSelect = (village: MahaItem) => {
    setSelectedVillage(village);
    setDrillOpen(false);
    setErrors((e) => ({ ...e, village: undefined }));
  };

  const handleDrillBack = () => {
    setDrillQuery('');
    if (drillLevel === 'village') {
      setDrillLevel('taluka');
      setDrillLoading(true);
      getTalukas(selectedDistrict!.code)
        .then((items) => { setDrillItems(items); setDrillLoading(false); })
        .catch(() => setDrillLoading(false));
    } else if (drillLevel === 'taluka') {
      setDrillLevel('district');
      setSelectedDistrict(null);
      setSelectedTaluka(null);
      setSelectedVillage(null);
      setDrillLoading(true);
      getDistricts()
        .then((items) => { setDrillItems(items); setDrillLoading(false); })
        .catch(() => setDrillLoading(false));
    } else {
      setDrillOpen(false);
    }
  };

  const filteredDrillItems = useMemo(() => {
    if (!drillQuery.trim()) return drillItems;
    const q = drillQuery.toLowerCase();
    return drillItems.filter((i) => i.value.toLowerCase().includes(q));
  }, [drillQuery, drillItems]);

  const drillBreadcrumb =
    drillLevel === 'district' ? '' :
    drillLevel === 'taluka' ? (selectedDistrict?.value ?? '') :
    `${selectedDistrict?.value} › ${selectedTaluka?.value}`;

  const drillPlaceholder =
    drillLevel === 'district' ? t('searchDistrict') :
    drillLevel === 'taluka' ? t('searchTaluka') :
    t('searchVillage');

  const drillTitle =
    drillLevel === 'district' ? t('selectDistrict') :
    drillLevel === 'taluka' ? t('selectTaluka') :
    t('selectVillage');

  const locationDisplay = selectedVillage?.value ?? null;

  const validate = () => {
    const errs: typeof errors = {};
    if (!fullName.trim()) errs.fullName = t('fullNameRequired');
    if (!phone.replace(/\D/g, '')) errs.phone = t('phoneRequired');
    else if (phone.replace(/\D/g, '').length < 10) errs.phone = t('invalidPhone');
    if (!selectedVillage) errs.village = t('selectVillageError');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    router.push({
      pathname: '/(auth)/setup-mpin',
      params: {
        fullName: fullName.trim(),
        phone: phone.replace(/\D/g, ''),
        villageName: selectedVillage!.value,
        taluka: selectedTaluka?.value ?? '',
        district: selectedDistrict?.value ?? '',
        state: 'Maharashtra',
        pincode: '',
      },
    } as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.appName}>{t('appName')}</Text>
          <Text style={styles.tagline}>{t('createYourAccount')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('joinYourVillage')}</Text>
          <Text style={styles.subtitle}>{t('fewSteps')}</Text>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('fullName')}</Text>
            <TextInput
              style={[styles.input, errors.fullName ? styles.inputError : undefined]}
              placeholder={t('enterFullName')}
              placeholderTextColor={styles.placeholder.color}
              value={fullName}
              onChangeText={(v) => { setFullName(v); setErrors((e) => ({ ...e, fullName: undefined })); }}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('phoneNumber')}</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : undefined]}
              placeholder={t('enterPhoneNumber')}
              placeholderTextColor={styles.placeholder.color}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: undefined })); }}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {/* Location Section */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('yourLocation')}</Text>

            {/* Single location picker row */}
            <TouchableOpacity
              style={[styles.pickerRow, errors.village ? styles.pickerRowError : undefined]}
              onPress={openLocationPicker}
              activeOpacity={0.8}
            >
              {locationDisplay ? (
                <Text style={styles.pickerRowText} numberOfLines={1}>{locationDisplay}</Text>
              ) : (
                <Text style={styles.pickerRowPlaceholder}>
                  {detectingLocation ? t('detectingLocation') : t('selectVillage')}
                </Text>
              )}
              {detectingLocation ? (
                <ActivityIndicator size="small" color={AuthColors.textSecondary} />
              ) : (
                <Ionicons name="chevron-forward" size={16} color={AuthColors.textSecondary} />
              )}
            </TouchableOpacity>

            {errors.village ? <Text style={styles.errorText}>{errors.village}</Text> : null}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{t('continueBtnLabel')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>{t('signIn')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      {/* Drill-down Location Picker Modal */}
      <Modal
        visible={drillOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDrillOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalBackButton} onPress={handleDrillBack}>
              <Ionicons name="chevron-back" size={22} color={AuthColors.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{drillTitle}</Text>
              {drillBreadcrumb ? (
                <Text style={styles.modalBreadcrumb}>{drillBreadcrumb}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => setDrillOpen(false)}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalSearch}
            placeholder={drillPlaceholder}
            placeholderTextColor="#9CA3AF"
            value={drillQuery}
            onChangeText={setDrillQuery}
            autoCorrect={false}
          />

          {drillLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator color={AuthColors.primary} size="large" />
            </View>
          ) : (
            <FlatList
              data={filteredDrillItems}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (drillLevel === 'district') handleDistrictSelect(item);
                    else if (drillLevel === 'taluka') handleTalukaSelect(item);
                    else handleVillageSelect(item);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.value}</Text>
                  {drillLevel !== 'village' && (
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>{t('noResults')}</Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}
