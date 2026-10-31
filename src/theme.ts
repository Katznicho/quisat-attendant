import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  primary: '#011478',
  primaryDark: '#000A45',
  primaryLight: '#2A3B9C',
  primarySoft: '#EEF0FB',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: 'rgba(255,255,255,0.68)',
  background: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F8F9FC',
  text: '#0B1220',
  textSecondary: '#334155',
  muted: '#64748B',
  subtle: '#94A3B8',
  border: '#E5E9F0',
  success: '#0F8A4B',
  successSoft: '#E3F6EC',
  danger: '#C4302B',
  dangerSoft: '#FDECEC',
  warning: '#B45309',
  warningSoft: '#FEF4E2',
  scrim: 'rgba(5,10,30,0.55)',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

/** One type scale for the whole app. Amounts use tabular figures so columns line up. */
export const type = {
  display: { fontSize: 36, fontWeight: '800', letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  heading: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400' },
  bodyStrong: { fontSize: 16, fontWeight: '600' },
  small: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  amount: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), letterSpacing: 1 },
} satisfies Record<string, TextStyle>;

export const elevation = {
  card: Platform.select<ViewStyle>({
    ios: { shadowColor: '#0B1A4A', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    default: { elevation: 2 },
  }),
  raised: Platform.select<ViewStyle>({
    ios: { shadowColor: '#011478', shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
    default: { elevation: 6 },
  }),
};
