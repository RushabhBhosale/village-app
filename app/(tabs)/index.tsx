import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { styles } from '@/styles/home.styles';
import { transportSearchStyles as ts } from '@/styles/transport.styles';

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [fromLabel, setFromLabel] = useState('');
  const [fromLat, setFromLat] = useState<number | null>(null);
  const [fromLng, setFromLng] = useState<number | null>(null);
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [destination, setDestination] = useState('');
  const hasDetected = useRef(false);
  const { selectedDestination, selectedOrigin } = useLocalSearchParams<{
    selectedDestination?: string;
    selectedOrigin?: string;
  }>();

  // Pick up destination when returning from the picker
  useEffect(() => {
    if (selectedDestination) setDestination(selectedDestination);
  }, [selectedDestination]);

  // Pick up manually selected origin
  useEffect(() => {
    if (selectedOrigin) {
      setFromLabel(selectedOrigin);
      setFromLat(null);
      setFromLng(null);
    }
  }, [selectedOrigin]);

  // Auto-detect location on mount
  useEffect(() => {
    if (hasDetected.current) return;
    hasDetected.current = true;
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setDetectingLoc(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setFromLabel(user?.villageName ?? '');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setFromLat(loc.coords.latitude);
      setFromLng(loc.coords.longitude);

      const [addr] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const label = addr?.name ?? addr?.city ?? addr?.district ?? '';
      setFromLabel(label || t('currentLocation'));
    } catch {
      setFromLabel(user?.villageName ?? t('currentLocation'));
    } finally {
      setDetectingLoc(false);
    }
  };

  const handleSearchTransport = () => {
    router.push({
      pathname: '/transport/results',
      params: {
        fromLabel,
        fromLat: fromLat ?? '',
        fromLng: fromLng ?? '',
        destination,
      },
    } as any);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{t('welcomeGreeting')}</Text>
            <Text style={styles.username}>{user.fullName}</Text>
          </View>
        </View>

        <View style={styles.villageBanner}>
          <Text style={styles.villageBannerLabel}>{t('yourVillage')}</Text>
          <Text style={styles.villageBannerName}>{user.villageName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('yourProfile')}</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.fullName[0].toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.fullName}</Text>
              <Text style={styles.profilePhone}>{user.phone}</Text>
            </View>
          </View>
        </View>

        {/* Transport Search */}
        <View style={ts.card}>
          <View style={ts.titleRow}>
            <Ionicons name="car" size={20} color="#2D6A4F" />
            <Text style={ts.titleText}>{t('findTransport')}</Text>
          </View>

          {/* From */}
          <TouchableOpacity
            style={ts.inputRow}
            onPress={() =>
              router.push({ pathname: '/transport/destination', params: { mode: 'origin' } } as any)
            }
            activeOpacity={0.8}
            disabled={detectingLoc}
          >
            <Ionicons name="locate" size={18} color="#059669" />
            {detectingLoc ? (
              <View style={ts.locationLoading}>
                <ActivityIndicator size="small" color="#9CA3AF" />
                <Text style={ts.locationLoadingText}>{t('detectingLocation')}</Text>
              </View>
            ) : (
              <Text style={fromLabel ? ts.inputText : ts.inputPlaceholder} numberOfLines={1}>
                {fromLabel || t('enterStartLocation')}
              </Text>
            )}
            {!detectingLoc && (
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); detectLocation(); }}>
                <Ionicons name="refresh" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Divider dots */}
          <View style={ts.dividerDots}>
            <View style={ts.dot} /><View style={ts.dot} /><View style={ts.dot} />
          </View>

          {/* To */}
          <TouchableOpacity
            style={ts.inputRow}
            onPress={() =>
              router.push({
                pathname: '/transport/destination',
                params: { onSelect: 'true' },
              } as any)
            }
            activeOpacity={0.8}
          >
            <Ionicons name="location" size={18} color="#DC2626" />
            <Text style={destination ? ts.inputText : ts.inputPlaceholder} numberOfLines={1}>
              {destination || t('searchDestination')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={ts.searchBtn} onPress={handleSearchTransport} activeOpacity={0.85}>
            <Text style={ts.searchBtnText}>{t('searchTransport')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
