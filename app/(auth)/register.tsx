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

import { getDistricts, getTalukas, getVillages } from '@/utils/village-db';
import { detectVillageFromGPS } from '@/utils/location';
import { AuthColors } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { styles } from '@/styles/auth/register.styles';

type DrillLevel = 'district' | 'taluka' | 'village';

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
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedTaluka, setSelectedTaluka] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const hasDetected = useRef(false);

  const detectCurrentVillage = async () => {
    setDetectingLocation(true);
    try {
      const detected = await detectVillageFromGPS();
      const detectedVillage = detected?.villageName ?? '';
      if (!detectedVillage) return;
      setSelectedVillage(detectedVillage);
      setErrors((e) => ({ ...e, village: undefined }));
    } catch {
      // Keep manual picker as fallback.
    } finally {
      setDetectingLocation(false);
    }
  };

  useEffect(() => {
    if (hasDetected.current) return;
    hasDetected.current = true;
    void detectCurrentVillage();
  }, []);

  // Drill-down modal
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('district');
  const [drillItems, setDrillItems] = useState<string[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillQuery, setDrillQuery] = useState('');

  const openLocationPicker = async () => {
    setDrillOpen(true);
    setDrillQuery('');
    setDrillLoading(true);
    try {
      if (selectedDistrict && selectedTaluka) {
        setDrillLevel('village');
        setDrillItems(await getVillages(selectedDistrict, selectedTaluka));
        return;
      }
      if (selectedDistrict) {
        setDrillLevel('taluka');
        setDrillItems(await getTalukas(selectedDistrict));
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

  const handleDistrictSelect = async (district: string) => {
    setSelectedDistrict(district);
    setSelectedTaluka(null);
    setSelectedVillage(null);
    setDrillLevel('taluka');
    setDrillQuery('');
    setDrillLoading(true);
    try {
      setDrillItems(await getTalukas(district));
    } catch { setDrillItems([]); } finally { setDrillLoading(false); }
  };

  const handleTalukaSelect = async (taluka: string) => {
    setSelectedTaluka(taluka);
    setSelectedVillage(null);
    setDrillLevel('village');
    setDrillQuery('');
    setDrillLoading(true);
    try {
      setDrillItems(await getVillages(selectedDistrict!, taluka));
    } catch { setDrillItems([]); } finally { setDrillLoading(false); }
  };

  const handleVillageSelect = (village: string) => {
    setSelectedVillage(village);
    setDrillOpen(false);
    setErrors((e) => ({ ...e, village: undefined }));
  };

  const handleDrillBack = () => {
    setDrillQuery('');
    if (drillLevel === 'village') {
      setDrillLevel('taluka');
      setDrillLoading(true);
      getTalukas(selectedDistrict!)
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
    return drillItems.filter((i) => i.toLowerCase().includes(q));
  }, [drillQuery, drillItems]);

  const drillBreadcrumb =
    drillLevel === 'district' ? '' :
    drillLevel === 'taluka' ? (selectedDistrict ?? '') :
    `${selectedDistrict} › ${selectedTaluka}`;

  const drillPlaceholder =
    drillLevel === 'district' ? t('searchDistrict') :
    drillLevel === 'taluka' ? t('searchTaluka') :
    t('searchVillage');

  const drillTitle =
    drillLevel === 'district' ? t('selectDistrict') :
    drillLevel === 'taluka' ? t('selectTaluka') :
    t('selectVillage');

  const locationDisplay = selectedVillage ?? null;

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
        villageName: selectedVillage!,
        taluka: selectedTaluka ?? '',
        district: selectedDistrict ?? '',
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
                <View style={styles.pickerActions}>
                  <TouchableOpacity
                    style={styles.refreshAction}
                    onPress={(e) => {
                      e.stopPropagation();
                      void detectCurrentVillage();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh" size={16} color={AuthColors.textSecondary} />
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={16} color={AuthColors.textSecondary} />
                </View>
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
              keyExtractor={(item, index) => `${item}_${index}`}
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
                  <Text style={styles.modalItemText}>{item}</Text>
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
