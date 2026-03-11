import React, { useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AuthColors } from '@/constants/theme';

const MPIN_LENGTH = 4;

export interface MpinInputHandle {
  focus: () => void;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  ref?: React.Ref<MpinInputHandle>;
}

export function MpinInput({ value, onChange, autoFocus = false, ref }: Props) {
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.wrapper}>
      <View style={styles.boxes} pointerEvents="none">
        {Array.from({ length: MPIN_LENGTH }).map((_, i) => {
          const filled = i < value.length;
          const active = i === value.length;
          return (
            <View
              key={i}
              style={[
                styles.box,
                active && styles.boxActive,
                filled && styles.boxFilled,
              ]}
            >
              {filled ? <View style={styles.dot} /> : null}
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, MPIN_LENGTH))}
        keyboardType="number-pad"
        secureTextEntry
        autoFocus={autoFocus}
        caretHidden
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  boxes: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  box: {
    width: 56,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AuthColors.border,
    backgroundColor: AuthColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: AuthColors.primary,
    shadowColor: AuthColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  boxFilled: {
    borderColor: AuthColors.primary,
    backgroundColor: '#EDF7F0',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: AuthColors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
