import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';

import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { haversineKm, geocodeLocation } from '@/utils/geo';
import type { UserProfile } from '@/context/auth-context';
import { transportResultStyles as s } from '@/styles/transport.styles';
import BottomNavBar from '@/components/BottomNavBar';

const RADIUS_KM = 25;

export default function TransportResultsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { fromLat, fromLng, fromLabel, destination } = useLocalSearchParams<{
    fromLat: string; fromLng: string; fromLabel: string; destination: string;
  }>();

  const [providers, setProviders] = useState<(UserProfile & { distanceKm: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const getSearchCoords = async (): Promise<{ lat: number; lng: number } | null> => {
    const lat = parseFloat(fromLat ?? '');
    const lng = parseFloat(fromLng ?? '');
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };

    // Fallback: geocode user's village
    if (user?.villageName) {
      return geocodeLocation(user.villageName, user.taluka, user.district);
    }
    return null;
  };

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const center = await getSearchCoords();

      const q = query(
        collection(db, 'users'),
        where('isProvider', '==', true),
        where('providerType', '==', 'transport'),
      );
      const snap = await getDocs(q);
      const all = snap.docs.map((d) => d.data() as UserProfile);

      // Filter active ones
      const active = all.filter((p) => p.providerStatus === 'active');

      if (!center) {
        // No coordinates — show all active providers
        setProviders(active.map((p) => ({ ...p, distanceKm: 0 })));
        return;
      }

      // For each provider, get their coordinates (stored or geocoded)
      const withDistance = await Promise.all(
        active.map(async (p) => {
          let pLat = p.villageLat;
          let pLng = p.villageLng;
          if (!pLat || !pLng) {
            const coords = await geocodeLocation(p.villageName, p.taluka, p.district);
            pLat = coords?.lat;
            pLng = coords?.lng;
          }
          const distanceKm = pLat && pLng
            ? haversineKm(center.lat, center.lng, pLat, pLng)
            : 9999;
          return { ...p, distanceKm };
        }),
      );

      const nearby = withDistance
        .filter((p) => p.distanceKm <= RADIUS_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      setProviders(nearby);
    } catch (err) {
      console.error('[transport/results]', err);
    } finally {
      setIsLoading(false);
    }
  };

  const vehicleEmojis: Record<string, string> = { car: '🚗', bike: '🏍️', tempo: '🚐', other: '🚛' };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('transportResults')}</Text>
      </View>

      {isLoading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color="#2D6A4F" />
          <Text style={s.loadingText}>{t('loading')}</Text>
        </View>
      ) : providers.length === 0 ? (
        <View style={s.emptyContainer}>
          <Ionicons name="car-outline" size={56} color="#D1D5DB" />
          <Text style={s.emptyText}>{t('noProvidersNearby')}</Text>
        </View>
      ) : (
        <>
          <Text style={s.radiusInfo}>{t('radiusInfo')}</Text>
          <FlatList
            data={providers}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={s.list}
            renderItem={({ item }) => {
              const imageUrl = item.vehicle?.imageUrl;
              const emoji = item.vehicle ? vehicleEmojis[item.vehicle.type] ?? '🚗' : '🚗';
              return (
                <View style={s.providerCard}>
                  <View style={s.providerHeader}>
                    <View style={s.providerPhoto}>
                      {imageUrl
                        ? <Image source={{ uri: imageUrl }} style={s.providerPhotoImg} contentFit="cover" />
                        : <Text style={{ fontSize: 24 }}>{emoji}</Text>
                      }
                    </View>
                    <View style={s.providerInfo}>
                      <Text style={s.providerName}>{item.fullName}</Text>
                      <Text style={s.providerSub}>
                        {emoji} {item.vehicle?.type
                          ? item.vehicle.type.charAt(0).toUpperCase() + item.vehicle.type.slice(1)
                          : ''}{' '}
                        • {item.vehicle?.number ?? ''}
                      </Text>
                    </View>
                    {item.distanceKm > 0 && (
                      <View style={s.distanceBadge}>
                        <Text style={s.distanceText}>
                          {item.distanceKm.toFixed(1)} {t('kmAway')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {(item.vehicle?.routes ?? []).length > 0 && (
                    <View style={s.chipSection}>
                      <Text style={s.chipLabel}>{t('routesLabel')}</Text>
                      <View style={s.chipRow}>
                        {(item.vehicle?.routes ?? []).slice(0, 3).map((r, i) => (
                          <View key={i} style={s.chip}>
                            <Text style={s.chipText}>{r}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {(item.vehicle?.villages ?? []).length > 0 && (
                    <View style={s.chipSection}>
                      <Text style={s.chipLabel}>{t('villagesLabel')}</Text>
                      <View style={s.chipRow}>
                        {(item.vehicle?.villages ?? []).map((v, i) => (
                          <View key={i} style={s.chip}>
                            <Text style={s.chipText}>{v}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={s.callBtn}
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={s.callBtnText}>{t('callProvider')} {item.phone}</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </>
      )}
      <BottomNavBar />
    </SafeAreaView>
  );
}
