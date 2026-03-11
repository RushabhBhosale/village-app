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
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { styles } from '@/styles/provider/vehicle-details.styles';

export default function ShopDetailsScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = t('shopNameRequired');
    if (!category.trim()) errs.category = t('categoryRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await updateProfile({
        isProvider: true,
        providerType: 'shop',
        shop: {
          name: name.trim(),
          category: category.trim(),
        },
      });
      router.dismissAll();
    } catch {
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
          <Text style={styles.headerTitle}>{t('shopDetails')}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.emojiHeader}>
            <Text style={styles.emoji}>🏪</Text>
            <Text style={styles.title}>{t('yourShop')}</Text>
            <Text style={styles.subtitle}>{t('tellAboutShop')}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('shopName')}</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : undefined]}
                placeholder={t('shopNamePlaceholder')}
                placeholderTextColor={styles.placeholder.color}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('category')}</Text>
              <TextInput
                style={[styles.input, errors.category ? styles.inputError : undefined]}
                placeholder={t('categoryPlaceholder')}
                placeholderTextColor={styles.placeholder.color}
                value={category}
                onChangeText={setCategory}
                autoCapitalize="words"
              />
              {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
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
