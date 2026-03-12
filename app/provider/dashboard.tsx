import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { uploadImage } from '@/utils/storage';
import { getDistricts, getTalukas, getVillages, type MahaItem } from '@/utils/mahabhumi';
import { styles } from '@/styles/provider/dashboard.styles';

type DrillLevel = 'district' | 'taluka' | 'village';
type PickerFor = 'route' | 'village' | null;

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [togglingStatus, setTogglingStatus] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Mahabhumi picker modal
  const [pickerFor, setPickerFor] = useState<PickerFor>(null);
  const [routeStart, setRouteStart] = useState<string | null>(null); // first village of a route
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('district');
  const [drillItems, setDrillItems] = useState<MahaItem[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<MahaItem | null>(null);
  const [selectedTaluka, setSelectedTaluka] = useState<MahaItem | null>(null);
  const [drillQuery, setDrillQuery] = useState('');

  if (!user || !user.isProvider) return null;

  const isActive = user.providerStatus === 'active';
  const isTransport = user.providerType === 'transport';

  // ── Status toggle ────────────────────────────────────────────────────────
  const handleToggleStatus = async () => {
    setTogglingStatus(true);
    try {
      await updateProfile({ providerStatus: isActive ? 'inactive' : 'active' });
    } catch {
      Alert.alert(t('error'), t('couldNotSave'));
    } finally {
      setTogglingStatus(false);
    }
  };

  // ── Photo picker ─────────────────────────────────────────────────────────
  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('error'), 'Photo library permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const url = await uploadImage(user.uid, 'provider', result.assets[0].uri);
      if (isTransport && user.vehicle) {
        await updateProfile({ vehicle: { ...user.vehicle, imageUrl: url } });
      } else if (!isTransport && user.shop) {
        await updateProfile({ shop: { ...user.shop, imageUrl: url } });
      }
    } catch {
      Alert.alert(t('error'), t('couldNotSave'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Remove route / village ───────────────────────────────────────────────
  const handleRemoveRoute = async (idx: number) => {
    if (!user.vehicle) return;
    const routes = (user.vehicle.routes ?? []).filter((_, i) => i !== idx);
    await updateProfile({ vehicle: { ...user.vehicle, routes } }).catch(() => {
      Alert.alert(t('error'), t('couldNotSave'));
    });
  };

  const handleRemoveVillage = async (idx: number) => {
    if (!user.vehicle) return;
    const villages = (user.vehicle.villages ?? []).filter((_, i) => i !== idx);
    await updateProfile({ vehicle: { ...user.vehicle, villages } }).catch(() => {
      Alert.alert(t('error'), t('couldNotSave'));
    });
  };

  // ── Mahabhumi picker ─────────────────────────────────────────────────────
  const resetDrillToDistricts = async () => {
    setDrillLevel('district');
    setSelectedDistrict(null);
    setSelectedTaluka(null);
    setDrillQuery('');
    setDrillLoading(true);
    try {
      setDrillItems(await getDistricts());
    } catch { setDrillItems([]); } finally { setDrillLoading(false); }
  };

  const openPicker = (forField: PickerFor) => {
    setPickerFor(forField);
    setRouteStart(null);
    resetDrillToDistricts();
  };

  const handleDistrictSelect = async (district: MahaItem) => {
    setSelectedDistrict(district);
    setDrillLevel('taluka');
    setDrillQuery('');
    setDrillLoading(true);
    try {
      setDrillItems(await getTalukas(district.code));
    } catch { setDrillItems([]); } finally { setDrillLoading(false); }
  };

  const handleTalukaSelect = async (taluka: MahaItem) => {
    setSelectedTaluka(taluka);
    setDrillLevel('village');
    setDrillQuery('');
    setDrillLoading(true);
    try {
      setDrillItems(await getVillages(selectedDistrict!.code, taluka.code));
    } catch { setDrillItems([]); } finally { setDrillLoading(false); }
  };

  const handleVillageSelect = async (village: MahaItem) => {
    if (!user.vehicle || !pickerFor) return;

    if (pickerFor === 'route') {
      if (!routeStart) {
        // First pick — save start, reset drill for end pick
        setRouteStart(village.value);
        resetDrillToDistricts();
        return;
      }
      // Second pick — build route string and save
      const routeEntry = `${routeStart} → ${village.value}`;
      setPickerFor(null);
      setRouteStart(null);
      try {
        const routes = [...(user.vehicle.routes ?? []), routeEntry];
        await updateProfile({ vehicle: { ...user.vehicle, routes } });
      } catch (err: any) {
        console.error('[dashboard/save]', err?.code, err?.message);
        Alert.alert(t('error'), err?.message ?? t('couldNotSave'));
      }
      return;
    }

    // Village pick
    setPickerFor(null);
    try {
      const villages = [...(user.vehicle.villages ?? []), village.value];
      await updateProfile({ vehicle: { ...user.vehicle, villages } });
    } catch (err: any) {
      console.error('[dashboard/save]', err?.code, err?.message);
      Alert.alert(t('error'), err?.message ?? t('couldNotSave'));
    }
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
      setDrillLoading(true);
      getDistricts()
        .then((items) => { setDrillItems(items); setDrillLoading(false); })
        .catch(() => setDrillLoading(false));
    } else if (routeStart) {
      // At district level while picking end village — go back to start-village pick
      setRouteStart(null);
      resetDrillToDistricts();
    } else {
      setPickerFor(null);
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

  const pickerPlaceholder =
    drillLevel === 'district' ? t('searchDistrict') :
    drillLevel === 'taluka' ? t('searchTaluka') :
    t('searchVillage');

  // ── UI ───────────────────────────────────────────────────────────────────
  const imageUrl = isTransport ? user.vehicle?.imageUrl : user.shop?.imageUrl;
  const vehicleEmojis: Record<string, string> = { car: '🚗', bike: '🏍️', tempo: '🚐', other: '🚛' };
  const vehicleEmoji = isTransport && user.vehicle ? vehicleEmojis[user.vehicle.type] ?? '🚗' : '🏪';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#2D6A4F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('providerDashboardTitle')}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Toggle */}
        <Text style={styles.sectionLabel}>{t('statusSection')}</Text>
        <TouchableOpacity
          style={[styles.statusCard, isActive ? styles.statusCardActive : styles.statusCardInactive]}
          onPress={handleToggleStatus}
          disabled={togglingStatus}
          activeOpacity={0.85}
        >
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusDot, isActive ? styles.statusDotActive : styles.statusDotInactive]} />
              <View style={styles.statusTextBlock}>
                <Text style={[styles.statusTitle, isActive ? styles.statusTitleActive : styles.statusTitleInactive]}>
                  {isActive ? t('active') : t('inactive')}
                </Text>
                <Text style={[styles.statusSubtitle, isActive ? styles.statusSubtitleActive : styles.statusSubtitleInactive]}>
                  {isActive ? t('youAreActive') : t('youAreInactive')}
                </Text>
              </View>
            </View>
            {togglingStatus
              ? <ActivityIndicator color={isActive ? '#059669' : '#9CA3AF'} />
              : <Ionicons name={isActive ? 'toggle' : 'toggle-outline'} size={36} color={isActive ? '#059669' : '#9CA3AF'} />
            }
          </View>
          <Text style={styles.statusHint}>{t('tapToToggle')}</Text>
        </TouchableOpacity>

        {/* Photo */}
        <Text style={styles.sectionLabel}>{t('photoSection')}</Text>
        <View style={styles.card}>
          <View style={styles.photoRow}>
            <View style={styles.photoCircle}>
              {imageUrl
                ? <Image source={{ uri: imageUrl }} style={styles.photoImage} contentFit="cover" />
                : <Text style={{ fontSize: 32 }}>{vehicleEmoji}</Text>
              }
            </View>
            <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto} disabled={uploadingPhoto} activeOpacity={0.8}>
              {uploadingPhoto
                ? <ActivityIndicator color="#2D6A4F" />
                : <Ionicons name="camera" size={22} color="#2D6A4F" />
              }
              <Text style={styles.photoBtnText}>
                {imageUrl ? t('changePhoto') : t('addPhoto')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle / Shop Info */}
        <Text style={styles.sectionLabel}>
          {isTransport ? t('transportProvider') : t('shopOwner')}
        </Text>
        <View style={styles.card}>
          {isTransport && user.vehicle ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('vehicleLabel')}</Text>
                <Text style={styles.infoValue}>
                  {vehicleEmoji} {user.vehicle.type.charAt(0).toUpperCase() + user.vehicle.type.slice(1)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('numberLabel')}</Text>
                <Text style={styles.infoValue}>{user.vehicle.number}</Text>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>{t('modelLabel')}</Text>
                <Text style={styles.infoValue}>{user.vehicle.model}</Text>
              </View>
            </>
          ) : user.shop ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('shopName')}</Text>
                <Text style={styles.infoValue}>{user.shop.name}</Text>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>{t('category')}</Text>
                <Text style={styles.infoValue}>{user.shop.category}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Routes & Villages (transport only) */}
        {isTransport ? (
          <>
            <Text style={styles.sectionLabel}>{t('routesSection')}</Text>
            <View style={styles.card}>
              {/* Routes */}
              <View style={styles.chipSectionHeader}>
                <Text style={styles.chipSectionTitle}>{t('routesLabel')}</Text>
                <TouchableOpacity style={styles.addChipBtn} onPress={() => openPicker('route')} activeOpacity={0.8}>
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addChipBtnText}>{t('addRoute')}</Text>
                </TouchableOpacity>
              </View>
              {(user.vehicle?.routes ?? []).length === 0
                ? <Text style={styles.emptyChipText}>{t('noRoutes')}</Text>
                : (
                  <View style={styles.chipRow}>
                    {(user.vehicle?.routes ?? []).map((route, i) => (
                      <View key={i} style={styles.chip}>
                        <Text style={styles.chipText}>{route}</Text>
                        <TouchableOpacity onPress={() => handleRemoveRoute(i)}>
                          <Ionicons name="close" size={14} color="#93C5FD" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )
              }

              <View style={styles.chipDivider} />

              {/* Villages */}
              <View style={styles.chipSectionHeader}>
                <Text style={styles.chipSectionTitle}>{t('villagesLabel')}</Text>
                <TouchableOpacity style={styles.addChipBtn} onPress={() => openPicker('village')} activeOpacity={0.8}>
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addChipBtnText}>{t('addVillage')}</Text>
                </TouchableOpacity>
              </View>
              {(user.vehicle?.villages ?? []).length === 0
                ? <Text style={styles.emptyChipText}>{t('noVillages')}</Text>
                : (
                  <View style={styles.chipRow}>
                    {(user.vehicle?.villages ?? []).map((v, i) => (
                      <View key={i} style={[styles.chip, styles.chipVillage]}>
                        <Text style={[styles.chipText, styles.chipTextVillage]}>{v}</Text>
                        <TouchableOpacity onPress={() => handleRemoveVillage(i)}>
                          <Ionicons name="close" size={14} color="#6EE7B7" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )
              }
            </View>
          </>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Mahabhumi Village Picker Modal */}
      <Modal
        visible={pickerFor !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerFor(null)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleDrillBack}>
              <Ionicons name="chevron-back" size={22} color="#2D6A4F" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>
                {pickerFor === 'route'
                  ? (routeStart ? t('selectRouteEnd') : t('selectRouteStart'))
                  : t('addVillage')}
              </Text>
              {pickerFor === 'route' && routeStart ? (
                <Text style={styles.modalBreadcrumb}>{routeStart} →</Text>
              ) : drillBreadcrumb ? (
                <Text style={styles.modalBreadcrumb}>{drillBreadcrumb}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => setPickerFor(null)}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalSearch}
            placeholder={pickerPlaceholder}
            placeholderTextColor="#9CA3AF"
            value={drillQuery}
            onChangeText={setDrillQuery}
            autoCorrect={false}
          />

          {drillLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator color="#2D6A4F" size="large" />
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
    </SafeAreaView>
  );
}
