import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { MpinInput, MpinInputHandle } from '@/components/mpin-input';
import { styles } from '@/styles/auth/setup-mpin.styles';

export default function SetupMpinScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();
  const { fullName, phone, villageName, taluka, district, state, pincode, villageLat, villageLng } =
    useLocalSearchParams<{
      fullName: string;
      phone: string;
      villageName: string;
      taluka: string;
      district: string;
      state: string;
      pincode: string;
      villageLat: string;
      villageLng: string;
    }>();

  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [errors, setErrors] = useState<{ mpin?: string; confirm?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const confirmRef = useRef<MpinInputHandle>(null);

  // Auto-focus confirm field when first PIN is complete
  useEffect(() => {
    if (mpin.length === 4) {
      confirmRef.current?.focus();
    }
  }, [mpin]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!mpin) errs.mpin = t('mpinRequired');
    else if (mpin.length < 4) errs.mpin = t('mpinLength');
    else if (mpin !== confirmMpin) errs.confirm = t('pinsDoNotMatch');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const lat = villageLat ? parseFloat(villageLat) : undefined;
      const lng = villageLng ? parseFloat(villageLng) : undefined;
      await register(
        {
          fullName,
          phone,
          villageName,
          ...(taluka ? { taluka } : {}),
          ...(district ? { district } : {}),
          ...(state ? { state } : {}),
          ...(pincode ? { pincode } : {}),
          ...(!isNaN(lat as number) && lat ? { villageLat: lat } : {}),
          ...(!isNaN(lng as number) && lng ? { villageLng: lng } : {}),
        },
        mpin,
      );
      router.replace('/(auth)/login' as any);
    } catch (error: any) {
      console.error('[setup-mpin] error:', error);
      let general = t('registrationFailed');
      if (error.code === 'auth/email-already-in-use') {
        general = t('phoneAlreadyRegistered');
      }
      setErrors({ general });
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.tagline}>{t('almostDone')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.lockEmoji}>🔐</Text>
          <Text style={styles.title}>{t('setYourPin')}</Text>
          <Text style={styles.subtitle}>{t('create4DigitPin')}</Text>

          {errors.general ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.mpinSection}>
            <Text style={styles.mpinLabel}>{t('enterPin')}</Text>
            <MpinInput value={mpin} onChange={setMpin} autoFocus />
            {errors.mpin ? <Text style={styles.mpinError}>{errors.mpin}</Text> : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.mpinSection}>
            <Text style={styles.mpinLabel}>{t('confirmPin')}</Text>
            <MpinInput ref={confirmRef} value={confirmMpin} onChange={setConfirmMpin} />
            {errors.confirm ? <Text style={styles.mpinError}>{errors.confirm}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading ? styles.buttonDisabled : undefined]}
            onPress={handleCreate}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('createAccount')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{t('goBack')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
