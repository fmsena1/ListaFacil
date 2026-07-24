import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { colors } from './colors';

export const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryContainer,
    secondary: colors.accent,
    secondaryContainer: '#FCE8E6',
    background: colors.backgroundLight,
    surface: colors.surfaceLight,
    surfaceVariant: colors.surfaceVariant,
    error: colors.error,
    onPrimary: '#FFFFFF',
    onSurface: colors.textPrimaryLight,
    onSurfaceVariant: colors.textSecondaryLight,
    outline: colors.textSecondaryLight,
    outlineVariant: colors.borderLight,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#FFFFFF',
      level2: '#FFF5F6',
    }
  },
  roundness: 14,
};

export const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    primaryContainer: '#661D28',
    secondary: colors.accent,
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    error: colors.error,
    onPrimary: '#FFFFFF',
    onSurface: colors.textPrimaryDark,
    onSurfaceVariant: colors.textSecondaryDark,
    outline: colors.textSecondaryDark,
    outlineVariant: colors.borderDark,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: '#2C2426',
      level2: '#362D2F',
    }
  },
  roundness: 14,
};
