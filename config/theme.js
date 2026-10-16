import { Platform } from 'react-native';
import palette from './colors';

// Single source of truth for design tokens. Screens should import from here.

export const colors = {
  ...palette,
  brand: palette.primary1,
  brandDark: '#193D30',
  accent: palette.primary2,
  accentSoft: '#F8E8C8',
  peach: palette.secondary1,
  surface: '#FFFFFF',
  surfaceMuted: '#F5F6F5',
  background: '#F7F7F5',
  border: '#E4E7E5',
  text: '#1F2A26',
  textMuted: '#5F6B66',
  textSubtle: '#8A948F',
  textOnBrand: '#FFFFFF',
  danger: '#D64545',
  dangerSoft: '#FDECEC',
  success: '#2E9E5B',
  successSoft: '#E6F5EC',
  info: '#2F7FC1',
  overlay: 'rgba(15, 23, 20, 0.5)',
};

// 8pt grid
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const fonts = {
  body: 'Karla-Regular',
  medium: 'Karla-Medium',
  bold: 'Karla-Bold',
  display: 'MarkaziText-Medium',
  displayRegular: 'MarkaziText-Regular',
};

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40 },
  h1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  title: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
};

export const shadows = {
  none: {},
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
    default: { elevation: 1 },
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    default: { elevation: 4 },
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 18 },
    default: { elevation: 10 },
  }),
};

export const layout = {
  touchTarget: 48,
  tabBarHeight: 56,
};

export default { colors, spacing, radii, fonts, typography, shadows, layout };
