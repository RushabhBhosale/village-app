import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

import { validatePhone } from '@/utils/validation';
import {
  MahaItem,
  detectDistrictFromGPS,
  getDistricts,
  getTalukas,
  getVillages,
} from '@/utils/mahabhumi';
import { AuthColors } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { styles } from '@/styles/auth/register.styles';

type PickerType = 'district' | 'taluka' | 'village';

interface PickerModal {
  type: PickerType;
  title: string;
  items: MahaItem[];
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

  // Location cascade
  const [districts, setDistricts] = useState<MahaItem[]>([]);
  const [talukas, setTalukas] = useState<MahaItem[]>([]);
  const [villages, setVillages] = useState<MahaItem[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState<MahaItem | null>(null);
  const [selectedTaluka, setSelectedTaluka] = useState<MahaItem | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<MahaItem | null>(null);

  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingTalukas, setIsLoadingTalukas] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  // Modal
  const [modal, setModal] = useState<PickerModal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load districts on mount
  useEffect(() => {
    setIsLoadingDistricts(true);
    getDistricts()
      .then(setDistricts)
      .catch(() => setDistricts([]))
      .finally(() => setIsLoadingDistricts(false));
  }, []);

  // Load talukas when district changes
  useEffect(() => {
    if (!selectedDistrict) return;
    setSelectedTaluka(null);
    setSelectedVillage(null);
    setTalukas([]);
    setVillages([]);
    setIsLoadingTalukas(true);
    getTalukas(selectedDistrict.code)
      .then(setTalukas)
      .catch(() => setTalukas([]))
      .finally(() => setIsLoadingTalukas(false));
  }, [selectedDistrict]);

  // Load villages when taluka changes
  useEffect(() => {
    if (!selectedDistrict || !selectedTaluka) return;
    setSelectedVillage(null);
    setVillages([]);
    setIsLoadingVillages(true);
    getVillages(selectedDistrict.code, selectedTaluka.code)
      .then(setVillages)
      .catch(() => setVillages([]))
      .finally(() => setIsLoadingVillages(false));
  }, [selectedDistrict, selectedTaluka]);

  const handleDetectGPS = useCallback(async () => {
    setIsDetectingGPS(true);
    try {
      const result = await detectDistrictFromGPS();
      if (result?.districtCode) {
        const match = districts.find((d) => d.code === result.districtCode);
        if (match) setSelectedDistrict(match);
      }
    } finally {
      setIsDetectingGPS(false);
    }
  }, [districts]);

  const openPicker = (type: PickerType) => {
    let items: MahaItem[] = [];
    let title = '';
    if (type === 'district') { items = districts; title = t('selectDistrict'); }
    else if (type === 'taluka') { items = talukas; title = t('selectTaluka'); }
    else { items = villages; title = t('selectVillage'); }
    setSearchQuery('');
    setModal({ type, title, items });
  };

  const handleSelect = (item: MahaItem) => {
    if (!modal) return;
    if (modal.type === 'district') setSelectedDistrict(item);
    else if (modal.type === 'taluka') setSelectedTaluka(item);
    else setSelectedVillage(item);
    setModal(null);
    setErrors((e) => ({ ...e, village: undefined }));
  };

  const filteredItems = useMemo(() => {
    if (!modal) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return modal.items;
    return modal.items.filter((x) => x.value.toLowerCase().includes(q));
  }, [modal, searchQuery]);

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

            {/* GPS Detect */}
            <TouchableOpacity
              style={styles.detectButton}
              onPress={handleDetectGPS}
              disabled={isDetectingGPS || isLoadingDistricts}
              activeOpacity={0.8}
            >
              {isDetectingGPS ? (
                <ActivityIndicator size="small" color={AuthColors.primary} />
              ) : (
                <Text style={styles.detectButtonText}>{t('autoDetect')}</Text>
              )}
            </TouchableOpacity>

            {/* District picker */}
            <Text style={[styles.label, { marginTop: 8 }]}>{t('district')}</Text>
            {isLoadingDistricts ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={styles.loadingText.color as string} />
                <Text style={styles.loadingText}>{t('loadingDistricts')}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.pickerRow, errors.village && !selectedDistrict ? styles.pickerRowError : undefined]}
                onPress={() => openPicker('district')}
                activeOpacity={0.8}
              >
                {selectedDistrict ? (
                  <Text style={styles.pickerRowText}>{selectedDistrict.value}</Text>
                ) : (
                  <Text style={styles.pickerRowPlaceholder}>{t('selectDistrict')}</Text>
                )}
                <Text style={styles.pickerChevron}>▼</Text>
              </TouchableOpacity>
            )}

            {/* Taluka picker */}
            {selectedDistrict ? (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>{t('taluka')}</Text>
                {isLoadingTalukas ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={styles.loadingText.color as string} />
                    <Text style={styles.loadingText}>{t('loadingTalukas')}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.pickerRow, talukas.length === 0 ? styles.pickerRowDisabled : undefined]}
                    onPress={() => talukas.length > 0 && openPicker('taluka')}
                    activeOpacity={0.8}
                  >
                    {selectedTaluka ? (
                      <Text style={styles.pickerRowText}>{selectedTaluka.value}</Text>
                    ) : (
                      <Text style={styles.pickerRowPlaceholder}>{t('selectTaluka')}</Text>
                    )}
                    <Text style={styles.pickerChevron}>▼</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : null}

            {/* Village picker */}
            {selectedTaluka ? (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>{t('village')}</Text>
                {isLoadingVillages ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={styles.loadingText.color as string} />
                    <Text style={styles.loadingText}>{t('loadingVillages')}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.pickerRow,
                      errors.village ? styles.pickerRowError : undefined,
                      villages.length === 0 ? styles.pickerRowDisabled : undefined,
                    ]}
                    onPress={() => villages.length > 0 && openPicker('village')}
                    activeOpacity={0.8}
                  >
                    {selectedVillage ? (
                      <Text style={styles.pickerRowText}>{selectedVillage.value}</Text>
                    ) : (
                      <Text style={styles.pickerRowPlaceholder}>{t('selectVillage')}</Text>
                    )}
                    <Text style={styles.pickerChevron}>▼</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : null}

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

      {/* Picker Modal */}
      <Modal
        visible={!!modal}
        transparent
        animationType="slide"
        onRequestClose={() => setModal(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModal(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modal?.title}</Text>
              <TouchableOpacity onPress={() => setModal(null)}>
                <Text style={styles.modalClose}>{t('done')}</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchBox}
              placeholder={t('search')}
              placeholderTextColor={styles.placeholder.color}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected =
                  modal?.type === 'district' ? selectedDistrict?.code === item.code
                  : modal?.type === 'taluka' ? selectedTaluka?.code === item.code
                  : selectedVillage?.code === item.code;
                return (
                  <TouchableOpacity
                    style={[styles.listItem, isSelected ? styles.listItemSelected : undefined]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.listItemText, isSelected ? styles.listItemTextSelected : undefined]}>
                      {item.value}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.listEmpty}>
                  <Text style={styles.listEmptyText}>{t('noResults')}</Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
