import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { styles } from '@/styles/settings.styles';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(t('signOut'), t('signOutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('signOut'), style: 'destructive', onPress: logout },
    ]);
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'mr' : 'en');
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('settings')}</Text>
        </View>

        {/* Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('account')}</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.fullName[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user.fullName}</Text>
              <Text style={styles.profileSub}>{user.phone}</Text>
              {user.villageName ? (
                <Text style={styles.profileSub}>{user.villageName}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Provider */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('providerSection')}</Text>

          {user.isProvider ? (
            <View style={styles.providerDetailCard}>
              <View style={styles.providerDetailHeader}>
                <Text style={styles.providerDetailTitle}>
                  {user.providerType === 'transport' ? t('transportProvider') : t('shopOwner')}
                </Text>
                <View style={styles.providerBadge}>
                  <Text style={styles.providerBadgeText}>{t('active')}</Text>
                </View>
              </View>

              {user.vehicle ? (
                <>
                  <View style={styles.providerDetailRow}>
                    <Text style={styles.providerDetailLabel}>{t('vehicleLabel')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons
                        name={user.vehicle.type === 'car' ? 'car' : 'bicycle'}
                        size={16}
                        color="#374151"
                      />
                      <Text style={styles.providerDetailValue}>
                        {user.vehicle.type.charAt(0).toUpperCase() + user.vehicle.type.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.providerDetailRow}>
                    <Text style={styles.providerDetailLabel}>{t('modelLabel')}</Text>
                    <Text style={styles.providerDetailValue}>{user.vehicle.model}</Text>
                  </View>
                  <View style={styles.providerDetailRow}>
                    <Text style={styles.providerDetailLabel}>{t('numberLabel')}</Text>
                    <Text style={styles.providerDetailValue}>{user.vehicle.number}</Text>
                  </View>
                </>
              ) : null}

              {user.shop ? (
                <>
                  <View style={styles.providerDetailRow}>
                    <Text style={styles.providerDetailLabel}>{t('shopName')}</Text>
                    <Text style={styles.providerDetailValue}>{user.shop.name}</Text>
                  </View>
                  <View style={styles.providerDetailRow}>
                    <Text style={styles.providerDetailLabel}>{t('category')}</Text>
                    <Text style={styles.providerDetailValue}>{user.shop.category}</Text>
                  </View>
                </>
              ) : null}
            </View>
          ) : (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push('/provider/choose-type')}
                activeOpacity={0.7}
              >
                <View style={[styles.rowIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="storefront" size={20} color="#059669" />
                </View>
                <Text style={styles.rowLabel}>{t('becomeProvider')}</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('appSection')}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={handleLanguageToggle} activeOpacity={0.7}>
              <View style={[styles.rowIcon, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="language" size={20} color="#7C3AED" />
              </View>
              <Text style={styles.rowLabel}>{t('languageLabel')}</Text>
              <Text style={styles.rowValue}>{language === 'en' ? 'English' : 'मराठी'}</Text>
            </TouchableOpacity>
            <View style={[styles.row, styles.rowLast]}>
              <View style={[styles.rowIcon, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="information-circle" size={20} color="#6B7280" />
              </View>
              <Text style={styles.rowLabel}>{t('version')}</Text>
              <Text style={styles.rowValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerRow} onPress={handleLogout} activeOpacity={0.7}>
              <View style={styles.dangerIcon}>
                <Ionicons name="log-out" size={20} color="#DC2626" />
              </View>
              <Text style={styles.dangerLabel}>{t('signOut')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
