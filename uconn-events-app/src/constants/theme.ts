/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Deep navy ink used for headings and body copy */
    text: '#141A38',
    background: '#FFFFFF',
    /** Search field / info callout backgrounds */
    backgroundElement: '#EEF0F6',
    backgroundSelected: '#E4E7F3',
    textSecondary: '#6B7280',
    /** Indigo accent for links, buttons, and the active tab */
    tint: '#4F46E5',
    /** Elevated surface for cards */
    card: '#FFFFFF',
    border: '#E7E9F2',
    /** Destructive / saved-heart red */
    danger: '#E5484D',
    /** Foreground for filled accent buttons */
    onTint: '#FFFFFF',
  },
  dark: {
    text: '#F3F4F8',
    background: '#0A0C14',
    backgroundElement: '#191D29',
    backgroundSelected: '#262B3B',
    textSecondary: '#9AA1B2',
    tint: '#8B93F6',
    card: '#131722',
    border: '#262B3B',
    danger: '#FF6B6B',
    onTint: '#0A0C14',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 72 }) ?? 0;
export const MaxContentWidth = 800;
