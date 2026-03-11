import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { validatePhone, validateMpin } from '@/utils/validation';
import { MpinInput } from '@/components/mpin-input';
import { styles } from '@/styles/auth/login.styles';

export default function LoginScreen() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [mpin, setMpin] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; mpin?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: typeof errors = {};
    if (!phone.replace(/\D/g, '')) errs.phone = t('phoneRequired');
    else if (phone.replace(/\D/g, '').length < 10) errs.phone = t('invalidPhone');
    if (!mpin) errs.mpin = t('mpinRequired');
    else if (mpin.length < 4) errs.mpin = t('mpinLength');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(phone.replace(/\D/g, ''), mpin);
    } catch (error: any) {
      console.error('[login] error code:', error.code);
      console.error('[login] error message:', error.message);

      let general = t('loginFailed');
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        general = t('invalidPhoneOrPin');
      } else if (error.message === 'profile/not-found') {
        general = t('accountNotFound');
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
          <Text style={styles.tagline}>{t('loginTagline')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('welcomeBack')}</Text>
          <Text style={styles.subtitle}>{t('signInToContinue')}</Text>

          {errors.general ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('phoneNumber')}</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : undefined]}
              placeholder={t('enterPhoneNumber')}
              placeholderTextColor={styles.placeholder.color}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(v) => { setPhone(v); setErrors({}); }}
              autoCorrect={false}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.mpinLabel}>{t('enterYourPin')}</Text>
            <MpinInput value={mpin} onChange={(v) => { setMpin(v); setErrors({}); }} />
            {errors.mpin ? <Text style={styles.mpinError}>{errors.mpin}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading ? styles.buttonDisabled : undefined]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('signIn')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('dontHaveAccount')}</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>{t('register')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
