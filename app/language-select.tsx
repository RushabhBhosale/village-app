import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage, type Language } from '@/context/language-context';
import { styles } from '@/styles/language-select.styles';

const OPTIONS: { lang: Language; emoji: string; label: string; sublabel: string }[] = [
  { lang: 'en', emoji: '🇬🇧', label: 'English', sublabel: 'English' },
  { lang: 'mr', emoji: '🇮🇳', label: 'मराठी', sublabel: 'Marathi' },
];

export default function LanguageSelectScreen() {
  const { setLanguage } = useLanguage();
  const [selected, setSelected] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setIsLoading(true);
    await setLanguage(selected);
    // Navigation handled by _layout.tsx effect
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>Village App</Text>
          <Text style={styles.heading}>Choose Your Language</Text>
          <Text style={styles.subheading}>
            {'Select your preferred language\nतुमची पसंतीची भाषा निवडा'}
          </Text>
        </View>

        <View style={styles.cardsRow}>
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.lang;
            return (
              <TouchableOpacity
                key={opt.lang}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(opt.lang)}
                activeOpacity={0.8}
              >
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
                <Text style={styles.cardEmoji}>{opt.emoji}</Text>
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                  {opt.label}
                </Text>
                <Text style={styles.cardSubtitle}>{opt.sublabel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.button, (!selected || isLoading) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selected || isLoading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Continue / पुढे जा</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
