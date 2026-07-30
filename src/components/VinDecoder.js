import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  Animated, Platform, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPE, MONO, press, hexA, sharedStyles } from '../theme';
import { decodeVIN } from '../utils/nhtsa';

const useNative = Platform.OS !== 'web';
const VIN_LEN = 17;

export default function VinDecoder({ vin, onChange, onDecoded }) {
  const [decoding, setDecoding] = useState(false);
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  // One shared "breathing" loop — drives the idle scan glyph AND the
  // blinking caret-pip, so the screen feels alive without extra timers.
  const pulse = useRef(new Animated.Value(0)).current;
  // Cyan aura that blooms behind the card the moment a decode lands.
  const aura = useRef(new Animated.Value(0)).current;
  // Staggered reveal values for the spec tiles.
  const tiles = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: useNative }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    Animated.timing(aura, {
      toValue: decoded ? 1 : 0, duration: 500, useNativeDriver: useNative,
    }).start();
    if (decoded) {
      tiles.forEach((t) => t.setValue(0));
      Animated.stagger(
        60,
        tiles.map((t) =>
          Animated.timing(t, { toValue: 1, duration: 380, useNativeDriver: useNative })
        )
      ).start();
    }
  }, [decoded, aura, tiles]);

  const handleDecode = async () => {
    if (vin.trim().length !== VIN_LEN) return;
    setError('');
    setDecoding(true);
    const result = await decodeVIN(vin.trim());
    setDecoding(false);
    if (result && result.make) {
      setDecoded(result);
      onDecoded(result);
    } else {
      setDecoded(null);
      setError(
        'We couldn’t read that VIN. Check each character — VINs never use the letters I, O, or Q.'
      );
    }
  };

  const complete = vin.length === VIN_LEN;
  const armed = complete && !decoding;

  const engineString = [
    decoded?.displacement ? `${decoded.displacement}L` : '',
    decoded?.cylinders ? `${decoded.cylinders}-cyl` : '',
    decoded?.engine || '',
  ]
    .filter(Boolean)
    .join('  ·  ');

  const stats = decoded
    ? [
        { label: 'Year',       vicon: 'calendar-outline',    tint: COLORS.cyan, value: decoded.year },
        { label: 'Make',       vicon: 'car-outline',         tint: COLORS.accent, value: decoded.make },
        { label: 'Model',      vicon: 'cube-outline',        tint: '#38BDF8', value: decoded.model },
        { label: 'Trim',       vicon: 'pricetag-outline',    tint: '#A855F7', value: decoded.trim },
        { label: 'Engine',     vicon: 'construct-outline',   tint: '#F97316', value: engineString },
        { label: 'Fuel',       vicon: 'flash-outline',       tint: '#84CC16', value: decoded.fuelType },
        { label: 'Drivetrain', vicon: 'git-network-outline', tint: '#34D399', value: decoded.driveType },
        { label: 'Body',       vicon: 'car-sport-outline',   tint: '#F472B6', value: decoded.bodyClass },
      ].filter((s) => s.value && String(s.value).trim())
    : [];

  return (
    <View style={styles.root}>
      {/* ambient cyan aura — blooms on a successful decode */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.aura,
          {
            opacity: aura.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] }),
          },
        ]}
      />

      <View style={{ zIndex: 1 }}>
        {/* ── Scan station: hero + input + progress ─────────────── */}
        <View style={[sharedStyles.card, styles.hero]}>
          <View style={styles.heroHead}>
            <Animated.View
              style={[
                styles.scanChip,
                { opacity: !decoded && !decoding ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) : 1 },
              ]}
            >
              <Ionicons
                name={decoding ? 'sync-outline' : 'scan-outline'}
                size={26}
                color={COLORS.cyan}
                style={decoding ? { transform: [{ rotate: '360deg' }] } : undefined}
              />
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Decode by VIN</Text>
              <Text style={styles.heroSub}>
                17 characters → a full spec sheet, straight from the DOT.
              </Text>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={sharedStyles.cardLabel}>VIN</Text>
            <Text style={[styles.counter, complete && styles.counterOn]}>
              {vin.length} / {VIN_LEN}
            </Text>
          </View>

          <View style={[styles.inputWrap, focused && styles.inputWrapOn, complete && styles.inputWrapDone]}>
            <Ionicons name="barcode-outline" size={20} color={complete ? COLORS.cyan : COLORS.textDim} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="1HGBH41JXMN109186"
              placeholderTextColor={COLORS.textDim}
              value={vin}
              onChangeText={(t) => {
                onChange(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, VIN_LEN));
                setDecoded(null);
                setError('');
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoCapitalize="characters"
              maxLength={VIN_LEN}
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          {/* the 17-segment readout — the active pip blinks like a caret */}
          <View style={styles.pips}>
            {Array.from({ length: VIN_LEN }).map((_, i) => {
              const filled = i < vin.length;
              const active = i === vin.length && !complete;
              const Pip = active ? Animated.View : View;
              return (
                <Pip
                  key={i}
                  style={[
                    styles.pip,
                    filled && styles.pipOn,
                    active && { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }), backgroundColor: hexA(COLORS.cyan, 0.5) },
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.foot}>
            <Ionicons name="information-circle-outline" size={13} color={COLORS.textDim} />
            <Text style={styles.footText}>
              On the dash by the windshield, or the driver’s door jamb.
            </Text>
          </View>
        </View>

        {/* ── Decode trigger (morphs idle → reading) ────────────── */}
        <Pressable
          disabled={!armed}
          onPress={handleDecode}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.decodeBtn,
            armed && styles.decodeBtnArmed,
            !armed && styles.decodeBtnOff,
            press(pressed),
          ]}
        >
          {decoding ? (
            <View style={styles.btnRow}>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.btnText}>Reading the VIN…</Text>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <Ionicons name={complete ? 'scan-outline' : 'lock-closed-outline'} size={18} color={armed ? COLORS.textOnAccent : COLORS.textDim} style={{ marginRight: 8 }} />
              <Text style={[styles.btnText, !armed && styles.btnTextOff]}>Decode VIN</Text>
            </View>
          )}
        </Pressable>

        {/* ── Error state ───────────────────────────────────────── */}
        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.danger} style={{ marginRight: 10 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Spec sheet (staggered ignition) ───────────────────── */}
        {decoded ? (
          <View style={[sharedStyles.card, styles.result]}>
            <View style={styles.resultHead}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.resultLabel}>VIN DECODED</Text>
              <View style={styles.srcTag}>
                <Text style={styles.srcTagText}>via NHTSA</Text>
              </View>
            </View>

            <Text style={styles.headline} numberOfLines={2}>
              {decoded.year} {decoded.make} {decoded.model}
            </Text>
            {decoded.trim ? <Text style={styles.trimLine}>{decoded.trim}</Text> : null}

            <View style={styles.grid}>
              {stats.map((s, i) => (
                <Animated.View
                  key={s.label}
                  style={[
                    styles.stat,
                    {
                      opacity: tiles[i],
                      transform: [
                        { translateY: tiles[i].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
                        { scale: tiles[i].interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
                      ],
                    },
                  ]}
                >
                  <View style={[styles.statIcon, { backgroundColor: hexA(s.tint, 0.16), borderColor: hexA(s.tint, 0.34) }]}>
                    <Ionicons name={s.vicon} size={18} color={s.tint} />
                  </View>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={styles.statValue} numberOfLines={2}>{s.value}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'relative' },
  aura: {
    position: 'absolute', top: -30, left: -10, right: -10, height: 220,
    borderRadius: 120, backgroundColor: hexA(COLORS.cyan, 0.10),
    shadowColor: COLORS.cyan, shadowOpacity: 0.5, shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 }, zIndex: 0,
  },
  hero: { borderColor: hexA(COLORS.cyan, 0.3), borderTopColor: hexA(COLORS.cyan, 0.5) },
  heroHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  scanChip: {
    width: 50, height: 50, borderRadius: 14, marginRight: 13,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cyanSoft, borderWidth: 1, borderColor: hexA(COLORS.cyan, 0.4),
    shadowColor: COLORS.cyan, shadowOpacity: 0.45, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  heroTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
  heroSub: { color: COLORS.textMuted, fontSize: TYPE.sm, marginTop: 2, lineHeight: 18 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  counter: { color: COLORS.textDim, fontSize: TYPE.micro, fontWeight: '800', letterSpacing: 1, fontVariant: ['tabular-nums'] },
  counterOn: { color: COLORS.cyan },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.page,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.line,
    paddingHorizontal: 14, height: 56,
  },
  inputWrapOn: { borderColor: hexA(COLORS.cyan, 0.6) },
  inputWrapDone: { borderColor: COLORS.cyan },
  input: { flex: 1, color: COLORS.text, fontFamily: MONO, fontSize: 18, letterSpacing: 3, paddingVertical: 0 },
  pips: { flexDirection: 'row', marginTop: 12, marginBottom: 4 },
  pip: { flex: 1, height: 6, borderRadius: 3, backgroundColor: COLORS.line, marginHorizontal: 2 },
  pipOn: { backgroundColor: COLORS.cyan, shadowColor: COLORS.cyan, shadowOpacity: 0.6, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  foot: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
  footText: { color: COLORS.textDim, fontSize: TYPE.micro, flex: 1, lineHeight: 15 },
  decodeBtn: {
    marginTop: 14, borderRadius: 13, height: 54,
    alignItems: 'center', justifyContent: 'center',
  },
  decodeBtnArmed: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent, shadowOpacity: 0.5, shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  decodeBtnOff: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line },
  btnRow: { flexDirection: 'row', alignItems: 'center' },
  btnText: { color: COLORS.textOnAccent, fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
  btnTextOff: { color: COLORS.textDim },
  errorCard: {
    flexDirection: 'row', alignItems: 'flex-start', marginTop: 14,
    backgroundColor: hexA(COLORS.danger, 0.1), borderRadius: 12,
    borderWidth: 1, borderColor: hexA(COLORS.danger, 0.4), padding: 14,
  },
   errorText: { flex: 1, color: '#FCA5A5', fontSize: TYPE.sm, lineHeight: 19 },
  result: { marginTop: 16, borderColor: hexA(COLORS.success, 0.3), borderTopColor: hexA(COLORS.success, 0.5) },
  resultHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    statLabel: { color: COLORS.textDim, fontSize: TYPE.micro, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 },
  statValue: { color: COLORS.text, fontSize: TYPE.h3, fontWeight: '700', lineHeight: 19 },
});