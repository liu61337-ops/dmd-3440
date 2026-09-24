// Simple, calm palette: one teal for progress/trust, one muted rust
// reserved only for the dispute-trigger button.
export const colors = {
  background: '#F7F6F2',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEDE6',
  ink: '#1C1F1E',
  inkMuted: '#6B675F',
  border: '#DDD9CF',
  primary: '#175E56',
  primaryMuted: '#E7F0EE',
  alert: '#9B3B26',
  alertMuted: '#F5E7E2',
  amber: '#B7791F',
  amberMuted: '#F6EEDC',
};

export const spacing = { sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export const type = {
  display: { fontSize: 24, fontWeight: '700', color: colors.ink },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink },
  body: { fontSize: 15, color: colors.ink },
  bodyMuted: { fontSize: 14, color: colors.inkMuted },
  label: { fontSize: 13, fontWeight: '600', color: colors.inkMuted },
  amountLarge: { fontSize: 30, fontWeight: '700', color: colors.ink },
};
