import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { styles } from '@/styles/provider/vehicle-details.styles';

export default function VehicleDetailsScreen() {
  const { vehicleType } = useLocalSearchParams<{ vehicleType: 'car' | 'bike' }>();
  const router = useRouter();
  const { updateProfile } = useAuth();
  const { t } = useLanguage();

  const [number, setNumber] = useState('');
  const [model, setModel] = useState('');
  const [errors, setErrors] = useState<{ number?: string; model?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const isCar = vehicleType === 'car';
  const emoji = isCar ? '🚗' : '🏍️';

  const validate = () => {
    const errs: typeof errors = {};
    if (!number.trim()) errs.number = t('vehicleNumberRequired');
    if (!model.trim()) errs.model = t('vehicleModelRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await updateProfile({
        isProvider: true,
        providerType: 'transport',
        vehicle: {
          type: vehicleType,
          number: number.trim().toUpperCase(),
          model: model.trim(),
        },
      });
      router.dismissAll();
    } catch (error: any) {
      Alert.alert(t('error'), t('couldNotSave'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isCar ? t('carDetails') : t('bikeDetails')}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.emojiHeader}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.title}>{isCar ? t('yourCar') : t('yourBike')}</Text>
            <Text style={styles.subtitle}>{t('enterVehicleDetails')}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{isCar ? t('carNumber') : t('bikeNumber')}</Text>
              <TextInput
                style={[styles.input, errors.number ? styles.inputError : undefined]}
                placeholder="e.g. MH 12 AB 3456"
                placeholderTextColor={styles.placeholder.color}
                value={number}
                onChangeText={setNumber}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {errors.number ? <Text style={styles.errorText}>{errors.number}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{isCar ? t('carModel') : t('bikeModel')}</Text>
              <TextInput
                style={[styles.input, errors.model ? styles.inputError : undefined]}
                placeholder={isCar ? 'e.g. Maruti Swift' : 'e.g. Honda Activa'}
                placeholderTextColor={styles.placeholder.color}
                value={model}
                onChangeText={setModel}
                autoCapitalize="words"
              />
              {errors.model ? <Text style={styles.errorText}>{errors.model}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading ? styles.buttonDisabled : undefined]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('saveAndBecomeProvider')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
