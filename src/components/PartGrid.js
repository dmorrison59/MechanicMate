import React, { useRef, useEffect } from 'react';
import {
  View, Text, Pressable, Animated, Platform, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPE, press, hexA } from '../theme';
import { PART_CATEGORIES } from '../data/parts';

const useNative = Platform.OS !== 'web';

export default function PartGrid({ enabled, onSelect }) {
  // One animated value per tile, created once, reused forever.
  const anims = useRef(PART_CATEGORIES.map(() => new Animated.Value(0))).current;

  // (Re)run the staggered reveal on mount AND on every lock→unlock,
  // so the grid "lights up" the instant a vehicle is chosen.
  useEffect(() => {
    anims.forEach((a) => a.setValue(0));
    Animated.stagger(
      45,
      anims.map((a) =>
        Animated.timing(a, { toValue: 1, duration: 340, useNativeDriver: useNative })
      )
    ).start();
  }, [enabled, anims]);

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>Choose a Part</Text>
        <Text style={styles.sub}>
          {enabled
            ? `${PART_CATEGORIES.length} categories · tap to shop & watch installs`
            : 'Select a vehicle above to unlock the parts grid'}
        </Text>
      </View>

      <View style={styles.grid}>
        {PART_CATEGORIES.map((part, i) => {
          const a = anims[i];
          const tint = enabled ? part.tint : COLORS.textDim;
          return (
            <Animated.View
              key={part.id}
              style={[
                styles.cell,
                {
                  opacity: a,
                  transform: [
                    { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
                  ],
                },
              ]}
            >
              <Pressable
                disabled={!enabled}
                onPress={() => onSelect(part)}
                accessibilityRole="button"
                accessibilityLabel={`Shop ${part.label}`}
                style={({ pressed }) => [
                  styles.tile,
                  !enabled && styles.tileOff,
                  { shadowColor: enabled ? part.tint : '#000' },
                  press(pressed),
                ]}
              >
                {/* colored glow lives in the shadow on iOS / web */}
                <View
                  style={[
                    styles.spine,
                    { backgroundColor: enabled ? part.tint : COLORS.line },
                  ]}
                />

                <View
                  style={[
                    styles.chip,
                    {
                      backgroundColor: enabled ? hexA(part.tint, 0.16) : COLORS.page,
                      borderColor: enabled ? hexA(part.tint, 0.34) : COLORS.line,
                    },
                  ]}
                >
                  <Ionicons name={part.vicon} size={26} color={tint} />
                </View>

                <Text style={[styles.label, !enabled && styles.labelOff]} numberOfLines={2}>
                  {part.label}
                </Text>

                {enabled ? (
                  <View style={styles.cta}>
                    <Text style={[styles.ctaText, { color: part.tint }]}>Shop</Text>
                    <Ionicons name="arrow-forward" size={12} color={part.tint} />
                  </View>
                ) : null}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
  head: { marginBottom: 16 },
  title: { color: COLORS.text, fontSize: TYPE.h2, fontWeight: '800', letterSpacing: 0.2 },
  sub: { color: COLORS.textDim, fontSize: TYPE.sm, marginTop: 4, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cell: { width: '48%', marginBottom: 14 },
  tile: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderTopColor: COLORS.lineHi,
    minHeight: 150,
    justifyContent: 'center',
    // tint is injected per-tile via the shadow color below — see render
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    shadowOpacity: 0.45,
    elevation: 3,
  },
  tileOff: { opacity: 0.42, shadowOpacity: 0 },
  spine: { width: 30, height: 3, borderRadius: 2, marginBottom: 14 },
  chip: {
    width: 54, height: 54, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: 12,
  },
  label: {
    color: COLORS.text, fontWeight: '700', fontSize: TYPE.body,
    textAlign: 'center', lineHeight: 18,
  },
  labelOff: { color: COLORS.textDim },
  cta: { flexDirection: 'row', alignItems: 'center', marginTop: 9, gap: 3 },
  ctaText: { fontSize: TYPE.micro, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
});