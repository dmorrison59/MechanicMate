import { StyleSheet, Platform } from 'react-native';

// ── Palette ───────────────────────────────────────────────
// Layered near-black: deep page → lifted surface → lit edges.
// Dual accent: orange = do-this, cyan = the app figured it out.
const page      = '#080B11';
const surface   = '#11161F';
const line      = '#222B38';
const lineHi    = '#313E50';

export const COLORS = {
  page, surface, surface2: '#161C27', line, lineHi,
  // backward-compatible aliases (old components read these)
  bg: page, card: surface, border: line,
  accent:     '#F97316',
  accentDark: '#EA580C',
  cyan:       '#22D3EE',
  cyanSoft:   'rgba(34,211,238,0.12)',
  text:         '#F4F7FB',
  textMuted:    '#93A1B5',
  textDim:      '#5C6B80',
  textOnAccent: '#0A0E14',
  danger:  '#EF4444',
  success: '#22C55E',
  white:   '#FFFFFF',
  overlay: 'rgba(2,4,8,0.72)',
  glowOrange: 'rgba(249,115,22,0.18)',
  glowCyan:   'rgba(34,211,238,0.14)',
};

// ── Type scale (strong weight contrast = hierarchy) ───────
export const TYPE = {
  display: 30, h1: 22, h2: 18, h3: 16,
  body: 14, sm: 13, xs: 12, micro: 11,
};

export const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

// ── Tactile press feedback (no extra deps) ────────────────
// Use: <Pressable style={({pressed}) => [styles.x, press(pressed)]}>
export function press(pressed) {
  return pressed
    ? { opacity: 0.9, transform: [{ scale: 0.985 }] }
    : { transform: [{ scale: 1 }] };
}

// ── #RRGGBB → rgba() so any tint can glow at low alpha ───
export function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Shared building blocks ────────────────────────────────
export const sharedStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderTopColor: COLORS.lineHi,           // lit top edge
    shadowColor: '#000', shadowOpacity: 0.35,
    shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardLabel: {
    color: COLORS.textMuted,
    fontSize: TYPE.micro, fontWeight: '800',
    letterSpacing: 1, marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.page,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.line,
    color: COLORS.text, paddingHorizontal: 14,
    paddingVertical: 13, fontSize: 16,
  },
  hint: { color: COLORS.textDim, fontSize: 12, marginTop: 8, lineHeight: 17 },
});