/**
 * Small shared pieces of the museum look: a hairline-framed text button and a centered
 * message (used for loading, empty, and error states on every screen).
 */
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Museum } from '@/constants/museum';
import { Fonts } from '@/constants/theme';

/** Outlined, square-cornered button with small spaced capitals (≥44pt tall). */
export function MuseumButton({
  label,
  onPress,
  color = Museum.ink,
}: {
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, { borderColor: color }, pressed && styles.pressed]}>
      <Text style={[styles.buttonLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

/** Centered state message: an eyebrow label, a serif line, optional body and action. */
export function StateMessage({
  eyebrow,
  title,
  body,
  accent = Museum.accent,
  loading = false,
  illustration,
  action,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  accent?: string;
  loading?: boolean;
  illustration?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <View style={styles.centered} accessibilityLabel={loading ? title : undefined}>
      {loading ? <ActivityIndicator color={accent} style={styles.spinner} /> : null}
      {illustration}
      <Text style={[styles.eyebrow, { color: accent }]}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

/** An empty picture frame: a hairline rectangle with an inner mat line. */
export function EmptyFrame() {
  return (
    <View style={styles.frame} accessibilityElementsHidden importantForAccessibility="no">
      <View style={styles.frameMat} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 32,
  },
  spinner: {
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: {
    marginTop: 10,
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 20,
    lineHeight: 28,
    color: Museum.ink,
    textAlign: 'center',
  },
  body: {
    marginTop: 8,
    fontFamily: Fonts.serif,
    fontSize: 15,
    lineHeight: 22,
    color: Museum.inkSoft,
    textAlign: 'center',
  },
  action: {
    marginTop: 24,
  },
  button: {
    minHeight: 44, // ≥44pt touch target
    paddingHorizontal: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.6,
  },
  frame: {
    width: 104,
    height: 80,
    marginBottom: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: Museum.rule,
  },
  frameMat: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Museum.ruleSoft,
  },
});
