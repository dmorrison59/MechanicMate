import { StyleSheet } from 'react-native';

export const COLORS = {
  bg:           '#0F172A',
  card:         '#1E293B',
  border:       '#334155',
  accent:       '#F97316',
  accentDark:   '#EA580C',
  text:         '#F8FAFC',
  textMuted:    '#94A3B8',
  textDim:      '#64748B',
  textOnAccent: '#0F172A',
  danger:       '#EF4444',
  success:      '#22C55E',
  white:        '#FFFFFF',
  overlay:      'rgba(0,0,0,0.6)',
};

export const sharedStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 17,
  },
});