import React, { useRef, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, Animated, Platform,
  StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPE, press, hexA, sharedStyles } from '../theme';

const useNative = Platform.OS !== 'web';

// Stable per-make colors: hash the make so a brand always wears the same
// tint, regardless of where it sits in the list.
const PALETTE = ['#F97316', '#22D3EE', '#A855F7', '#22C55E', '#3B82F6', '#F472B6', '#EAB308', '#34D399'];
const tintFor = (v) => {
  const s = (v.make || v.id || 'x').toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

const specFor = (v) =>
  [
    v.displacement ? `${v.displacement}L` : '',
    v.cylinders ? `${v.cylinders}-cyl` : '',
    v.fuelType || '',
    v.driveType || '',
  ]
    .filter(Boolean)
    .join('  ·  ');

export default function GarageScreen({ vehicles, onRemove, onSelect }) {
  const anims = useRef(Array.from({ length: 50 }, () => new Animated.Value(0))).current;
  const breathe = useRef(new Animated.Value(0)).current;

  // Cards rise in, and re-settle whenever the list changes.
  useEffect(() => {
    anims.forEach((a) => a.setValue(0));
    const n = Math.min(vehicles.length, anims.length);
    Animated.stagger(
      70,
      anims.slice(0, n).map((a) =>
        Animated.timing(a, { toValue: 1, duration: 380, useNativeDriver: useNative })
      )
    ).start();
  }, [vehicles, anims]);

  // Gentle breathing loop for the empty-state icon.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1100, useNativeDriver: useNative }),
        Animated.timing(breathe, { toValue: 0, duration: 1100, useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  const handleRemove = (v) => {
    Alert.alert(
      'Remove Vehicle',
      `Remove ${v.year} ${v.make} ${v.model || ''} from your garage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemove(v.id) },
      ]
    );
  };

  const count = vehicles.length;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.head}>
        <View style={styles.headChip}>
          <Ionicons name="home-outline" size={24} color={COLORS.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Garage</Text>
          <Text style={styles.subtitle}>
            {count === 0
              ? 'No vehicles saved yet'
              : `${count} ${count === 1 ? 'vehicle' : 'vehicles'} saved · tap Find Parts to shop`}
          </Text>
        </View>
      </View>

      {count === 0 ? (
        /* ── Empty state ────────────────────────────────────────── */
        <View style={styles.empty}>
          <Animated.View
            style={[
              styles.emptyChip,
              {
                opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
                transform: [
                  { scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
                ],
              },
            ]}
          >
            <Ionicons name="car-outline" size={44} color={COLORS.textMuted} />
          </Animated.View>
          <Text style={styles.emptyTitle}>Your garage is empty</Text>
          <Text style={styles.emptyText}>
            Find a vehicle on the Find Parts tab, then tap “+ Garage” to park it
            here for one-tap access next time.
          </Text>
        </View>
      ) : (
        /* ── Vehicle cards ──────────────────────────────────────── */
        vehicles.map((v, i) => {
          const tint = tintFor(v);
          const spec = specFor(v);
          const a = anims[i];
          return (
            <Animated.View
              key={v.id}
              style={{
                opacity: a,
                transform: [
                  { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                ],
              }}
            >
              <View style={sharedStyles.card}>
                <View style={styles.vRow}>
                  <View
                    style={[
                      styles.vChip,
                      {
                        backgroundColor: hexA(tint, 0.16),
                        borderColor: hexA(tint, 0.34),
                        shadowColor: tint,
                      },
                    ]}
                  >
                    <Ionicons name="car-sport-outline" size={24} color={tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vName} numberOfLines={1}>
                      {v.year} {v.make} {v.model || ''}
                    </Text>
                    {spec ? <Text style={styles.vSpec}>{spec}</Text> : null}
                    {v.vin ? (
                      <View style={styles.vinRow}>
                        <Ionicons name="barcode-outline" size={12} color={COLORS.textDim} />
                        <Text style={styles.vin} numberOfLines={1}>{v.vin}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => onSelect(v)}
                    accessibilityRole="button"
                    accessibilityLabel={`Find parts for ${v.year} ${v.make}`}
                    style={({ pressed }) => [styles.findBtn, press(pressed)]}
                  >
                    <Ionicons name="search-outline" size={16} color={COLORS.textOnAccent} style={{ marginRight: 7 }} />
                    <Text style={styles.findBtnText}>Find Parts</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleRemove(v)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${v.year} ${v.make}`}
                    style={({ pressed }) => [styles.removeBtn, press(pressed)]}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.danger} style={{ marginRight: 7 }} />
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </Pressable>
                </View>

                <View style={styles.addedRow}>
                  <Ionicons name="calendar-outline" size={11} color={COLORS.textDim} />
                  <Text style={styles.added}>
                    Added {new Date(v.addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </Animated.View>
          );
        })
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 20, paddingBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headChip: {
    width: 46, height: 46, borderRadius: 13, marginRight: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: hexA(COLORS.accent, 0.14), borderWidth: 1, borderColor: hexA(COLORS.accent, 0.3),
    shadowColor: COLORS.accent, shadowOpacity: 0.4, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.2 },
  subtitle: { color: COLORS.textMuted, fontSize: TYPE.sm, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
  emptyChip: {
    width: 96, height: 96, borderRadius: 48, marginBottom: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line,
    shadowColor: COLORS.cyan, shadowOpacity: 0.25, shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 }, elevation: 2,
  },
  emptyTitle: { color: COLORS.text, fontSize: TYPE.h2, fontWeight: '800', marginBottom: 8 },
  emptyText: { color: COLORS.textDim, fontSize: TYPE.body, textAlign: 'center', lineHeight: 21 },
  vRow: { flexDirection: 'row', alignItems: 'center' },
  vChip: {
    width: 50, height: 50, borderRadius: 14, marginRight: 13,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  vName: { color: COLORS.text, fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
  vSpec: { color: COLORS.textMuted, fontSize: TYPE.sm, marginTop: 3 },
  vinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 5 },
  vin: { color: COLORS.textDim, fontSize: TYPE.xs, fontFamily: 'monospace', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: COLORS.line, marginVertical: 14 },
  actions: { flexDirection: 'row', gap: 10 },
  findBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent, borderRadius: 11, height: 46,
    shadowColor: COLORS.accent, shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  findBtnText: { color: COLORS.textOnAccent, fontWeight: '800', fontSize: TYPE.body },
  removeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.page, borderRadius: 11, height: 46, paddingHorizontal: 16,
    borderWidth: 1, borderColor: COLORS.line,
  },
  removeBtnText: { color: COLORS.danger, fontWeight: '700', fontSize: TYPE.body },
  addedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, gap: 5 },
  added: { color: COLORS.textDim, fontSize: TYPE.micro, letterSpacing: 0.2 },
});