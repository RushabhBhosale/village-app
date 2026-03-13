import React, { useState } from 'react';
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
import { searchVillages, getVillagesByDistrict } from '@/utils/village-db';
import { styles } from '@/styles/provider/dashboard.styles';
import BottomNavBar from '@/components/BottomNavBar';

type PickerFor = 'route' | 'village' | null;
type VillageOption = { key: string; name: string };

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [togglingStatus, setTogglingStatus] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<'vehicle' | 'shop' | null>(null);

  // Village picker modal
  const [pickerFor, setPickerFor] = useState<PickerFor>(null);
  const [routeStart, setRouteStart] = useState<string | null>(null);
  const [drillItems, setDrillItems] = useState<VillageOption[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillQuery, setDrillQuery] = useState('');
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!user || !user.isProvider) return null;

  const isActive = user.providerStatus === 'active';

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
  const handlePickPhoto = async (forService: 'vehicle' | 'shop') => {
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

    setUploadingPhoto(forService);
    try {
      const url = await uploadImage(user.uid, 'provider', result.assets[0].uri);
      if (forService === 'vehicle' && user.vehicle) {
        await updateProfile({ vehicle: { ...user.vehicle, imageUrl: url } });
      } else if (forService === 'shop' && user.shop) {
        await updateProfile({ shop: { ...user.shop, imageUrl: url } });
      }
    } catch {
      Alert.alert(t('error'), t('couldNotSave'));
    } finally {
      setUploadingPhoto(null);
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

  const handleRemoveAdditionalVehicle = async (idx: number) => {
    const vehicles = (user.additionalVehicles ?? []).filter((_, i) => i !== idx);
    await updateProfile({ additionalVehicles: vehicles }).catch(() => {
      Alert.alert(t('error'), t('couldNotSave'));
    });
  };

  // ── Village picker ───────────────────────────────────────────────────────

  const handleDrillQuery = (text: string) => {
    setDrillQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setDrillLoading(true);
      try {
        const district = (user.district ?? '').trim();
        const rows = text.trim()
          ? await searchVillages(text.trim())
          : district ? await getVillagesByDistrict(district) : await searchVillages('', 80);
        setDrillItems(rows.map((r) => ({
          key: `${r.district_name}:${r.taluka_name}:${r.village_name}`,
          name: r.village_name,
        })));
      } catch { /* keep current list */ } finally { setDrillLoading(false); }
    }, 200);
  };

  const loadInitialVillages = async () => {
    setDrillLoading(true);
    try {
      const district = (user.district ?? '').trim();
      const rows = district
        ? await getVillagesByDistrict(district)
        : await searchVillages('', 80);
      setDrillItems(rows.map((r) => ({
        key: `${r.district_name}:${r.taluka_name}:${r.village_name}`,
        name: r.village_name,
      })));
    } catch { setDrillItems([]); } finally { setDrillLoading(false); }
  };

  const openPicker = async (forField: PickerFor) => {
    setPickerFor(forField);
    setRouteStart(null);
    setDrillQuery('');
    await loadInitialVillages();
  };

  const handleVillageSelect = async (village: VillageOption) => {
    if (!user.vehicle || !pickerFor) return;

    if (pickerFor === 'route') {
      if (!routeStart) {
        setRouteStart(village.name);
        setDrillQuery('');
        return;
      }
      const routeEntry = `${routeStart} → ${village.name}`;
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

    setPickerFor(null);
    try {
      const villages = [...(user.vehicle.villages ?? []), village.name];
      await updateProfile({ vehicle: { ...user.vehicle, villages } });
    } catch (err: any) {
      console.error('[dashboard/save]', err?.code, err?.message);
      Alert.alert(t('error'), err?.message ?? t('couldNotSave'));
    }
  };

  const handleDrillBack = () => {
    setDrillQuery('');
    if (routeStart) {
      setRouteStart(null);
      return;
    }
    setPickerFor(null);
  };


  // ── UI ───────────────────────────────────────────────────────────────────
  const vehicleEmojis: Record<string, string> = { car: '🚗', bike: '🏍️', tempo: '🚐', other: '🚛' };
  const hasTransport = !!user.vehicle;
  const hasShop = !!user.shop;

  const PhotoRow = ({ forService, imageUrl, fallbackEmoji }: { forService: 'vehicle' | 'shop'; imageUrl?: string; fallbackEmoji: string }) => (
    <View style={styles.photoRow}>
      <View style={styles.photoCircle}>
        {imageUrl
          ? <Image source={{ uri: imageUrl }} style={styles.photoImage} contentFit="cover" />
          : <Text style={{ fontSize: 32 }}>{fallbackEmoji}</Text>
        }
      </View>
      <TouchableOpacity
        style={styles.photoBtn}
        onPress={() => handlePickPhoto(forService)}
        disabled={uploadingPhoto !== null}
        activeOpacity={0.8}
      >
        {uploadingPhoto === forService
          ? <ActivityIndicator color="#2D6A4F" />
          : <Ionicons name="camera" size={22} color="#2D6A4F" />
        }
        <Text style={styles.photoBtnText}>
          {imageUrl ? t('changePhoto') : t('addPhoto')}
        </Text>
      </TouchableOpacity>
    </View>
  );

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

        {/* ── Transport Section ── */}
        {hasTransport && user.vehicle ? (
          <>
            <Text style={styles.sectionLabel}>{t('transportProvider')}</Text>
            <View style={styles.card}>
              <PhotoRow forService="vehicle" imageUrl={user.vehicle.imageUrl} fallbackEmoji={vehicleEmojis[user.vehicle.type] ?? '🚗'} />
              <View style={styles.chipDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('vehicleLabel')}</Text>
                <Text style={styles.infoValue}>
                  {vehicleEmojis[user.vehicle.type] ?? '🚗'} {user.vehicle.type.charAt(0).toUpperCase() + user.vehicle.type.slice(1)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('numberLabel')}</Text>
                <Text style={styles.infoValue}>{user.vehicle.number}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('modelLabel')}</Text>
                <Text style={styles.infoValue}>{user.vehicle.model}</Text>
              </View>
              {(user.additionalVehicles ?? []).map((v, i) => {
                const emoji = vehicleEmojis[v.type] ?? '🚗';
                return (
                  <React.Fragment key={i}>
                    <View style={styles.chipDivider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{t('vehicleLabel')} {i + 2}</Text>
                      <Text style={styles.infoValue}>{emoji} {v.type.charAt(0).toUpperCase() + v.type.slice(1)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{t('numberLabel')}</Text>
                      <Text style={styles.infoValue}>{v.number}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{t('modelLabel')}</Text>
                      <Text style={[styles.infoValue, { flex: 1 }]}>{v.model}</Text>
                      <TouchableOpacity onPress={() => handleRemoveAdditionalVehicle(i)} style={{ marginLeft: 8 }}>
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                );
              })}
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  activeOpacity={0.7}
                  onPress={() => router.push('/provider/choose-vehicle?addMode=1' as any)}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#2D6A4F" />
                  <Text style={{ color: '#2D6A4F', fontSize: 14, fontWeight: '500' }}>Add Another Vehicle</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Routes & Villages */}
            <Text style={styles.sectionLabel}>{t('routesSection')}</Text>
            <View style={styles.card}>
              <View style={styles.chipSectionHeader}>
                <Text style={styles.chipSectionTitle}>{t('routesLabel')}</Text>
                <TouchableOpacity style={styles.addChipBtn} onPress={() => openPicker('route')} activeOpacity={0.8}>
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addChipBtnText}>{t('addRoute')}</Text>
                </TouchableOpacity>
              </View>
              {(user.vehicle.routes ?? []).length === 0
                ? <Text style={styles.emptyChipText}>{t('noRoutes')}</Text>
                : (
                  <View style={styles.chipRow}>
                    {(user.vehicle.routes ?? []).map((route, i) => (
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
              <View style={styles.chipSectionHeader}>
                <Text style={styles.chipSectionTitle}>{t('villagesLabel')}</Text>
                <TouchableOpacity style={styles.addChipBtn} onPress={() => openPicker('village')} activeOpacity={0.8}>
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addChipBtnText}>{t('addVillage')}</Text>
                </TouchableOpacity>
              </View>
              {(user.vehicle.villages ?? []).length === 0
                ? <Text style={styles.emptyChipText}>{t('noVillages')}</Text>
                : (
                  <View style={styles.chipRow}>
                    {(user.vehicle.villages ?? []).map((v, i) => (
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

        {/* ── Shop Section ── */}
        {hasShop && user.shop ? (
          <>
            <Text style={styles.sectionLabel}>{t('shopOwner')}</Text>
            <View style={styles.card}>
              <PhotoRow forService="shop" imageUrl={user.shop.imageUrl} fallbackEmoji="🏪" />
              <View style={styles.chipDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('shopName')}</Text>
                <Text style={styles.infoValue}>{user.shop.name}</Text>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>{t('category')}</Text>
                <Text style={styles.infoValue}>{user.shop.category}</Text>
              </View>
            </View>
          </>
        ) : null}

        {/* ── Add More Services ── */}
        {!hasTransport || !hasShop ? (
          <>
            <Text style={styles.sectionLabel}>Add More Services</Text>
            <View style={styles.card}>
              {!hasTransport ? (
                <TouchableOpacity
                  style={styles.infoRow}
                  activeOpacity={0.7}
                  onPress={() => router.push('/provider/choose-vehicle' as any)}
                >
                  <Ionicons name="car" size={20} color="#2D6A4F" />
                  <Text style={[styles.infoValue, { flex: 1, marginLeft: 12 }]}>Add Transport</Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
              {!hasShop ? (
                <TouchableOpacity
                  style={[styles.infoRow, !hasTransport ? styles.infoRowLast : undefined]}
                  activeOpacity={0.7}
                  onPress={() => router.push('/provider/shop-details' as any)}
                >
                  <Ionicons name="storefront" size={20} color="#2D6A4F" />
                  <Text style={[styles.infoValue, { flex: 1, marginLeft: 12 }]}>Add a Shop</Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Village Picker Modal */}
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
              {pickerFor === 'route' && routeStart ? <Text style={styles.modalBreadcrumb}>{routeStart} →</Text> : null}
            </View>
            <TouchableOpacity onPress={() => setPickerFor(null)}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalSearch}
            placeholder={t('searchVillage')}
            placeholderTextColor="#9CA3AF"
            value={drillQuery}
            onChangeText={handleDrillQuery}
            autoCorrect={false}
          />

          {drillLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator color="#2D6A4F" size="large" />
            </View>
          ) : (
            <FlatList
              data={drillItems}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  activeOpacity={0.7}
                  onPress={() => handleVillageSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
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

      <BottomNavBar />
    </SafeAreaView>
  );
}
