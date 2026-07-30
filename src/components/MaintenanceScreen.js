import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  Animated, Platform, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPE, MONO, press, hexA, sharedStyles } from '../theme';
import { MAINTENANCE_ITEMS } from '../data/parts';
import Dropdown from './Dropdown';

const useNative = Platform.OS !== 'web';
const DAY = 1000 * 60 * 60 * 24;

const STATUS_COLOR = {
  overdue: COLORS.danger,
  soon: '#EAB308',
  ok: COLORS.success,
  none: COLORS.textDim,
};

const monthsSince = (iso) => {
  const t = new Date(iso).getTime();
  return isNaN(t) ? 0 : (Date.now() - t) / (DAY * 30.44);
};

// Pure: given a service item, its last record, and the typed odometer,
// decide state + how full its progress bar should be + a human line.
function statusFor(item, last, odo) {
  if (!last) {
    return { state: 'none', pct: 0, pill: 'Not logged', detail: 'Tap below to record it' };
  }
  const lastMile = Number(last.mileage) || 0;
  const mo = monthsSince(last.date);
  let pct = 0;
  let hasMi = false;
  let hasMo = false;

  if (item.intervalMiles > 0 && odo > 0 && odo > lastMile) {
    pct = Math.max(pct, (odo - lastMile) / item.intervalMiles);
    hasMi = true;
  }
  if (item.intervalMonths > 0) {
    pct = Math.max(pct, mo / item.intervalMonths);
    hasMo = true;
  }

  const state = pct >= 1 ? 'overdue' : pct >= 0.8 ? 'soon' : 'ok';

  let pill = state === 'overdue' ? 'Overdue' : state === 'soon' ? 'Due soon' : 'On track';
  let detail;

  if (!hasMi && !hasMo) {
    pill = 'Logged';
    detail = 'Enter odometer to check mileage';
  } else if (state === 'overdue') {
    detail =
      hasMo && mo >= item.intervalMonths
        ? `Overdue · ${Math.floor(mo - item.intervalMonths)} mo`
        : hasMi
        ? `Overdue · ${Math.round((pct - 1) * item.intervalMiles).toLocaleString()} mi`
        : 'Overdue';
  } else {
    const miLeft =
      item.intervalMiles > 0 && odo > lastMile
        ? Math.max(0, item.intervalMiles - (odo - lastMile))
        : null;
    const moLeft =
      item.intervalMonths > 0 ? Math.max(0, Math.ceil(item.intervalMonths - mo)) : null;
    if (miLeft != null && moLeft != null) detail = `${miLeft.toLocaleString()} mi · ${moLeft} mo left`;
    else if (miLeft != null) detail = `${miLeft.toLocaleString()} mi left`;
    else if (moLeft != null) detail = `${moLeft} mo left`;
    else detail = 'On track';
  }

  return { state, pct: Math.min(pct, 1), pill, detail };
}

const intervalText = (it) =>
  it.intervalMiles > 0
    ? `Every ${(it.intervalMiles / 1000).toFixed(0)}k mi`
    : `Every ${it.intervalMonths} mo`;

export default function MaintenanceScreen({
  vehicles, records, onLog, onRemoveRecord, getRecordsForVehicle,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [mileage, setMileage] = useState('');
  const [showItems, setShowItems] = useState(false);

  const breathe = useRef(new Animated.Value(0)).current;
  const bars = useRef(MAINTENANCE_ITEMS.map(() => new Animated.Value(0))).current;
  const gridAnims = useRef(MAINTENANCE_ITEMS.map(() => new Animated.Value(0))).current;
  const histAnims = useRef(Array.from({ length: 60 }, () => new Animated.Value(0))).current;

  const count = vehicles.length;
  const selected = vehicles.find((v) => v.id === selectedId) || null;
  const odo = Number(mileage) || 0;

  const vRecs = useMemo(
    () => (selectedId ? getRecordsForVehicle(selectedId) : []),
    [selectedId, records, getRecordsForVehicle]
  );

  const statuses = useMemo(
    () =>
      MAINTENANCE_ITEMS.map((item) =>
        statusFor(item, vRecs.find((r) => r.itemId === item.id), odo)
      ),
    [vRecs, odo]
  );

  const overdue = statuses.filter((s) => s.state === 'overdue').length;
  const soon = statuses.filter((s) => s.state === 'soon').length;

  // Animate each progress bar toward its computed fill.
  useEffect(() => {
    statuses.forEach((s, i) => {
      Animated.timing(bars[i], {
        toValue: s.pct, duration: 420, useNativeDriver: false,
      }).start();
    });
  }, [statuses, bars]);

  // Cascade the service grid in each time it unfolds.
  useEffect(() => {
    if (showItems) {
      gridAnims.forEach((a) => a.setValue(0));
      Animated.stagger(
        45,
        gridAnims.map((a) =>
          Animated.timing(a, { toValue: 1, duration: 320, useNativeDriver: useNative })
        )
      ).start();
    }
  }, [showItems, gridAnims]);

  // Cascade the history in whenever it changes.
  useEffect(() => {
    histAnims.forEach((a) => a.setValue(0));
    const n = Math.min(vRecs.length, histAnims.length);
    Animated.stagger(
        55,
        histAnims.slice(0, n).map((a) =>
          Animated.timing(a, { toValue: 1, duration: 340, useNativeDriver: useNative })
        )
      ).start();
  }, [vRecs, histAnims]);

  // Breathing loop for the empty-state glyph.
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

  const handleLog = (item) => {
    if (!mileage || odo <= 0) {
      Alert.alert('Enter Mileage', 'Type your current odometer reading first so we know when the next one is due.');
      return;
    }
    onLog(selectedId, item.id, mileage);
    setShowItems(false);
    Alert.alert('Logged ✅', `${item.label} recorded at ${odo.toLocaleString()} mi.`);
  };

  const handleDelete = (rec) => {
    Alert.alert('Delete Record', 'Remove this maintenance record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onRemoveRecord(rec.id) },
    ]);
  };

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.year} ${v.make} ${v.model || ''}`.trim(),
    value: v.id,
  }));

  const sub = !selected
    ? count === 0
      ? 'Save a vehicle to begin'
      : 'Select a vehicle above'
    : overdue + soon > 0
    ? `${overdue} overdue · ${soon} due soon`
    : `${vRecs.length} ${vRecs.length === 1 ? 'record' : 'records'} · all on track`;

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.ambient} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* ── Header ──────────────────────────────────────────── */}
        <View style={styles.head}>
          <View style={styles.headChip}>
            <Ionicons name="construct-outline" size={24} color={COLORS.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Maintenance</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{sub}</Text>
          </View>
        </View>

        {count === 0 ? (
          /* ── Empty state ─────────────────────────────────────── */
          <View style={styles.empty}>
            <Animated.View
              style={[
                styles.emptyChip,
                {
                  opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
                  transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
                },
              ]}
            >
              <Ionicons name="clipboard-outline" size={42} color={COLORS.textMuted} />
            </Animated.View>
            <Text style={styles.emptyTitle}>Nothing to track yet</Text>
            <Text style={styles.emptyText}>
              Save a vehicle to your garage first, then come back here to log
              services and watch what’s coming due.
            </Text>
          </View>
        ) : (
          <>
            {/* ── Vehicle selector ──────────────────────────────── */}
            <Dropdown
              label="Vehicle"
              required
              value={selectedId}
              placeholder="Select a vehicle"
              options={vehicleOptions}
              searchable
              onSelect={(id) => { setSelectedId(id); setShowItems(false); }}
            />

            {selected ? (
              <>
                {/* ── Odometer + log trigger ─────────────────────── */}
                <View style={sharedStyles.card}>
                  <View style={styles.fieldRow}>
                    <Text style={sharedStyles.cardLabel}>CURRENT ODOMETER</Text>
                    <Text style={styles.unit}>miles</Text>
                  </View>
                  <View style={styles.odoWrap}>
                    <Ionicons
                      name="speedometer-outline"
                      size={20}
                      color={odo > 0 ? COLORS.cyan : COLORS.textDim}
                      style={{ marginRight: 10 }}
                    />
                    <TextInput
                      style={styles.odoInput}
                      placeholder="85000"
                      placeholderTextColor={COLORS.textDim}
                      value={mileage}
                      onChangeText={(t) => setMileage(t.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                    />
                    <Text style={styles.odoSuffix}>mi</Text>
                  </View>
                  <Text style={sharedStyles.hint}>
                    Used to flag what’s due by mileage — update it whenever you log a service.
                  </Text>

                  <Pressable
                    onPress={() => setShowItems((s) => !s)}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.logBtn,
                      showItems ? styles.logBtnGhost : styles.logBtnOn,
                      press(pressed),
                    ]}
                  >
                    <Ionicons
                      name={showItems ? 'remove-outline' : 'add-outline'}
                      size={18}
                      color={showItems ? COLORS.textMuted : COLORS.textOnAccent}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.logBtnText, showItems && styles.logBtnTextGhost]}>
                      {showItems ? 'Hide Services' : 'Log a Service'}
                    </Text>
                  </Pressable>
                </View>

                {/* ── Service grid (unfolds) ─────────────────────── */}
                {showItems ? (
                  <View style={sharedStyles.card}>
                    <Text style={sharedStyles.cardLabel}>WHAT DID YOU DO?</Text>
                    <View style={styles.grid}>
                      {MAINTENANCE_ITEMS.map((item, i) => (
                        <Animated.View
                          key={item.id}
                          style={[
                            styles.gridCell,
                            {
                              opacity: gridAnims[i],
                              transform: [{ translateY: gridAnims[i].interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
                            },
                          ]}
                        >
                          <Pressable
                            onPress={() => handleLog(item)}
                            accessibilityRole="button"
                            accessibilityLabel={`Log ${item.label}`}
                            style={({ pressed }) => [styles.gridTile, press(pressed)]}
                          >
                            <View
                              style={[
                                styles.gridChip,
                                { backgroundColor: hexA(item.tint, 0.16), borderColor: hexA(item.tint, 0.34) },
                              ]}
                            >
                              <Ionicons name={item.vicon} size={22} color={item.tint} />
                            </View>
                            <Text style={styles.gridLabel} numberOfLines={1}>{item.label}</Text>
                            <Text style={styles.gridInterval}>{intervalText(item)}</Text>
                          </Pressable>
                        </Animated.View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {/* ── Live service status dashboard ──────────────── */}
                <View style={sharedStyles.card}>
                  <View style={styles.dashHead}>
                    <Ionicons name="pulse-outline" size={16} color={COLORS.cyan} />
                    <Text style={styles.dashTitle}>SERVICE STATUS</Text>
                    {overdue + soon > 0 ? (
                      <View style={styles.dashAlert}>
                        <Text style={styles.dashAlertText}>{overdue + soon} need attention</Text>
                      </View>
                    ) : (
                      <Text style={styles.dashOk}>all clear</Text>
                    )}
                  </View>

                  {MAINTENANCE_ITEMS.map((item, i) => {
                    const s = statuses[i];
                    const c = STATUS_COLOR[s.state];
                    return (
                      <View key={item.id} style={styles.dashRow}>
                        <View style={[styles.dashIcon, { backgroundColor: hexA(item.tint, 0.14), borderColor: hexA(item.tint, 0.3) }]}>
                          <Ionicons name={item.vicon} size={15} color={item.tint} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.dashLine1}>
                            <Text style={styles.dashName} numberOfLines={1}>{item.label}</Text>
                            <View style={[styles.pill, { backgroundColor: hexA(c, 0.16), borderColor: hexA(c, 0.4) }]}>
                              <View style={[styles.pillDot, { backgroundColor: c }]} />
                              <Text style={[styles.pillText, { color: c }]}>{s.pill}</Text>
                            </View>
                          </View>
                          <View style={styles.track}>
                            <Animated.View
                              style={[
                                styles.fill,
                                {
                                  backgroundColor: c,
                                  width: bars[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.dashDetail} numberOfLines={1}>{s.detail}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* ── History ────────────────────────────────────── */}
                <View style={styles.histHead}>
                  <Ionicons name="time-outline" size={15} color={COLORS.textMuted} />
                  <Text style={styles.histTitle}>SERVICE HISTORY ({vRecs.length})</Text>
                </View>

                {vRecs.length === 0 ? (
                  <View style={styles.noRec}>
                    <Text style={styles.noRecText}>No records yet — log your first service above.</Text>
                  </View>
                ) : (
                  vRecs.map((rec, i) => {
                    const item = MAINTENANCE_ITEMS.find((m) => m.id === rec.itemId);
                    const tint = item?.tint || COLORS.textDim;
                    const a = histAnims[i];
                    return (
                      <Animated.View
                        key={rec.id}
                        style={{
                          opacity: a,
                          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
                        }}
                      >
                        <Pressable
                          onLongPress={() => handleDelete(rec)}
                          accessibilityRole="button"
                          accessibilityHint="Long-press to delete"
                          style={({ pressed }) => [styles.recCard, press(pressed)]}
                        >
                          <View style={[styles.recChip, { backgroundColor: hexA(tint, 0.16), borderColor: hexA(tint, 0.34) }]}>
                            <Ionicons name={item?.vicon || 'construct-outline'} size={18} color={tint} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.recLabel}>{item?.label || rec.itemId}</Text>
                            <Text style={styles.recMeta}>
                              {Number(rec.mileage).toLocaleString()} mi ·{' '}
                              {new Date(rec.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                          </View>
                          <Pressable
                            onPress={() => handleDelete(rec)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            accessibilityRole="button"
                            accessibilityLabel="Delete record"
                            style={({ pressed }) => [styles.recDel, press(pressed)]}
                          >
                            <Ionicons name="trash-outline" size={16} color={COLORS.textDim} />
                          </Pressable>
                        </Pressable>
                      </Animated.View>
                    );
                  })
                )}
              </>
            ) : (
              <View style={styles.noRec}>
                <Text style={styles.noRecText}>Pick a vehicle to see its status and history.</Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, position: 'relative' },
  ambient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 200,
    backgroundColor: hexA(COLORS.accent, 0.05),
    borderBottomLeftRadius: 120, borderBottomRightRadius: 120,
  },
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
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  unit: { color: COLORS.textDim, fontSize: TYPE.micro, fontWeight: '700', letterSpacing: 0.5 },
  odoWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.page,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.line,
    paddingHorizontal: 14, height: 56,
  },
  odoInput: { flex: 1, color: COLORS.text, fontFamily: MONO, fontSize: 20, letterSpacing: 1, paddingVertical: 0 },
  odoSuffix: { color: COLORS.textDim, fontSize: TYPE.sm, fontWeight: '700', marginLeft: 8 },
  logBtn: {
    marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, height: 50,
  },
  logBtnOn: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent, shadowOpacity: 0.4, shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  logBtnGhost: { backgroundColor: COLORS.page, borderWidth: 1, borderColor: COLORS.line },
  logBtnText: { color: COLORS.textOnAccent, fontWeight: '800', fontSize: TYPE.h3 },
  logBtnTextGhost: { color: COLORS.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCell: { width: '48%', marginBottom: 12 },
  gridTile: {
    backgroundColor: COLORS.page, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.line, minHeight: 116,
    justifyContent: 'center',
  },
  gridChip: {
    width: 44, height: 44, borderRadius: 12, marginBottom: 9,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  gridLabel: { color: COLORS.text, fontWeight: '700', fontSize: TYPE.sm, textAlign: 'center' },
  gridInterval: { color: COLORS.textDim, fontSize: TYPE.micro, marginTop: 3 },
  dashHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  dashTitle: { color: COLORS.textMuted, fontSize: TYPE.micro, fontWeight: '800', letterSpacing: 1.2, flex: 1 },
  dashAlert: { backgroundColor: hexA(COLORS.danger, 0.14), borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  dashAlertText: { color: COLORS.danger, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  dashOk: { color: COLORS.success, fontSize: TYPE.micro, fontWeight: '800', letterSpacing: 0.4 },
  dashRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dashIcon: {
    width: 30, height: 30, borderRadius: 9, marginRight: 11,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  dashLine1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  dashName: { flex: 1, color: COLORS.text, fontSize: TYPE.body, fontWeight: '700', marginRight: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1 },
  pillDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  pillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  track: { height: 6, borderRadius: 3, backgroundColor: COLORS.line, overflow: 'hidden', marginBottom: 5 },
  fill: { height: 6, borderRadius: 3 },
  dashDetail: { color: COLORS.textDim, fontSize: TYPE.micro, letterSpacing: 0.2 },
  histHead: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 12, gap: 7 },
  histTitle: { color: COLORS.textMuted, fontSize: TYPE.micro, fontWeight: '800', letterSpacing: 1 },
  noRec: { alignItems: 'center', paddingVertical: 22 },
  noRecText: { color: COLORS.textDim, fontSize: TYPE.sm, textAlign: 'center' },
  recCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 13, marginBottom: 9,
    borderWidth: 1, borderColor: COLORS.line, borderTopColor: COLORS.lineHi,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  recChip: {
    width: 38, height: 38, borderRadius: 11, marginRight: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  recLabel: { color: COLORS.text, fontWeight: '700', fontSize: TYPE.h3 },
  recMeta: { color: COLORS.textMuted, fontSize: TYPE.xs, marginTop: 2 },
  recDel: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
});