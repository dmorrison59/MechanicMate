import React, { useRef, useEffect } from 'react';
import {
  View, Text, Pressable, Modal, Animated, Platform, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPE, press, hexA } from '../theme';
import {
  searchAutoZone, searchOReilly, searchAmazon,
  searchYouTube, searchRockAuto,
} from '../utils/searchLinks';

const useNative = Platform.OS !== 'web';

export default function ActionModal({ visible, part, vehicleString, onClose }) {
  // index 0 = the part chip pop; 1–5 = the retailer rows rising in.
  const anims = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      anims.forEach((a) => a.setValue(0));
      Animated.stagger(
        55,
        anims.map((a) =>
          Animated.timing(a, { toValue: 1, duration: 360, useNativeDriver: useNative })
        )
      ).start();
    }
  }, [visible, part, anims]);

  if (!part) return null;

  const actions = [
    { key: 'autozone', name: 'AutoZone',      desc: 'Free same-day store pickup',  vicon: 'storefront-outline',  tint: '#F97316', fn: () => searchAutoZone(vehicleString, part) },
    { key: 'oreilly',  name: "O'Reilly Auto", desc: 'Rewards + free loaner tools', vicon: 'leaf-outline',        tint: '#22C55E', fn: () => searchOReilly(vehicleString, part) },
    { key: 'amazon',   name: 'Amazon',        desc: 'Fast Prime delivery',         vicon: 'cart-outline',        tint: '#3B82F6', fn: () => searchAmazon(vehicleString, part) },
    { key: 'rockauto', name: 'RockAuto',      desc: 'Lowest prices, huge catalog', vicon: 'car-outline',         tint: '#EF4444', fn: () => searchRockAuto(vehicleString, part) },
    { key: 'video',    name: 'Install Videos',desc: 'Step-by-step how-to guides',  vicon: 'play-circle-outline', tint: '#A855F7', fn: () => searchYouTube(vehicleString, part) },
  ];

  const tint = part.tint || COLORS.cyan;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* backdrop — Pressable, so the deprecation warning is gone */}
      <Pressable style={styles.overlay} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
        {/* sheet — swallows its own taps so only the backdrop dismisses */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Animated.View
              style={[
                styles.partChip,
                {
                  backgroundColor: hexA(tint, 0.16),
                  borderColor: hexA(tint, 0.34),
                  shadowColor: tint,
                  opacity: anims[0],
                  transform: [
                    { scale: anims[0].interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                  ],
                },
              ]}
            >
              <Ionicons name={part.vicon || 'construct-outline'} size={26} color={tint} />
            </Animated.View>

            <View style={{ flex: 1 }}>
              <Text style={styles.partLabel} numberOfLines={1}>{part.label}</Text>
              <Text style={styles.vehicle} numberOfLines={1}>{vehicleString}</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.micro}>5 PLACES TO SHOP &amp; LEARN</Text>

          <View>
            {actions.map((a, i) => (
              <Animated.View
                key={a.key}
                style={{
                  opacity: anims[i + 1],
                  transform: [
                    { translateY: anims[i + 1].interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
                  ],
                }}
              >
                <Pressable
                  onPress={() => { a.fn(); onClose(); }}
                  accessibilityRole="button"
                  accessibilityLabel={`${a.name}: ${a.desc}`}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: hexA(a.tint, 0.06) },
                    press(pressed),
                  ]}
                >
                  <View style={[styles.tile, { backgroundColor: hexA(a.tint, 0.16), borderColor: hexA(a.tint, 0.34) }]}>
                    <Ionicons name={a.vicon} size={22} color={a.tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{a.name}</Text>
                    <Text style={styles.rowDesc}>{a.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
                </Pressable>
              </Animated.View>
            ))}
          </View>

          <Text style={styles.footer}>Opens in your browser · prices &amp; availability vary by retailer</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 26,
    borderTopWidth: 1, borderTopColor: COLORS.lineHi,
    maxHeight: '86%',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 }, elevation: 8,
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#475569', alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  partChip: {
    width: 54, height: 54, borderRadius: 15, marginRight: 13,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  partLabel: { color: COLORS.text, fontSize: TYPE.h1, fontWeight: '800', letterSpacing: 0.2 },
  vehicle: { color: COLORS.textMuted, fontSize: TYPE.sm, marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, marginLeft: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.page, borderWidth: 1, borderColor: COLORS.line,
  },
  micro: { color: COLORS.textDim, fontSize: TYPE.micro, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 12,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.line,
  },
  tile: {
    width: 46, height: 46, borderRadius: 13, marginRight: 13,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  rowName: { color: COLORS.text, fontSize: TYPE.h3, fontWeight: '800' },
  rowDesc: { color: COLORS.textMuted, fontSize: TYPE.xs, marginTop: 2 },
  footer: { color: COLORS.textDim, fontSize: TYPE.micro, textAlign: 'center', marginTop: 6, lineHeight: 15 },
});