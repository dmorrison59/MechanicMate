import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  SafeAreaView, StatusBar, Platform, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPE, hexA, press, sharedStyles } from './src/theme';
import { useGarage, useMaintenance } from './src/hooks/useGarage';

import VehiclePicker     from './src/components/VehiclePicker';
import VinDecoder        from './src/components/VinDecoder';
import PartGrid          from './src/components/PartGrid';
import ActionModal       from './src/components/ActionModal';
import GarageScreen      from './src/components/GarageScreen';
import MaintenanceScreen from './src/components/MaintenanceScreen';
import TopTabs           from './src/components/TopTabs';

const TABS = [
  { id: 'search',  icon: 'search-outline', label: 'Search' },
  { id: 'vin',     icon: 'scan-outline',   label: 'VIN' },
  { id: 'garage',  icon: 'home-outline',   label: 'Garage' },
  { id: 'history', icon: 'time-outline',   label: 'History' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const isVin = activeTab === 'vin';

  const [year, setYear]     = useState('');
  const [make, setMake]     = useState('');
  const [model, setModel]   = useState('');
  const [engine, setEngine] = useState('');

  const [vin, setVin]             = useState('');
  const [decodedVin, setDecodedVin] = useState(null);

  const [selectedPart, setSelectedPart] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const garage = useGarage();
  const maint  = useMaintenance();

  // ── Vehicle string (the single source of truth for every search) ──
  const vehicleString = () => {
    if (isVin) {
      if (decodedVin?.make) {
        return [decodedVin.year, decodedVin.make, decodedVin.model]
          .filter(Boolean).join(' ');
      }
      return vin.trim();
    }
    return [year, make, model, engine].filter(Boolean).join(' ');
  };

  const hasVehicle = () =>
    isVin ? Boolean(decodedVin?.make) : Boolean(year && make);

  const handleVehicleChange = (c) => {
    if (c.year !== undefined)  { setYear(c.year);  setEngine(''); }
    if (c.make !== undefined)  { setMake(c.make);  setEngine(''); }
    if (c.model !== undefined) setModel(c.model);
  };

  // Editing the VIN wipes any stale decode at the App level too.
  const handleVinChange = (t) => { setVin(t); setDecodedVin(null); };
  const handleVinDecoded = (r) => setDecodedVin(r);

  const handleSaveToGarage = () => {
    const v = isVin && decodedVin
      ? {
          year: decodedVin.year, make: decodedVin.make, model: decodedVin.model,
          vin: vin.trim(), engine: decodedVin.engine, cylinders: decodedVin.cylinders,
          displacement: decodedVin.displacement, fuelType: decodedVin.fuelType,
          driveType: decodedVin.driveType,
        }
      : { year, make, model, vin: '' };
    garage.addVehicle(v);
    Alert.alert('Saved 🏠', `${v.year} ${v.make} ${v.model || ''} parked in your garage.`);
  };

  const handleGarageSelect = (v) => {
    setActiveTab('search');
    setYear(v.year);
    setMake(v.make);
    setModel(v.model || '');
    setEngine('');
  };

  const openPart = (part) => { setSelectedPart(part); setModalVisible(true); };

  // The orange "your ride" banner + Save button, or the prompt that
  // explains why the grid is still locked. Reused by both flows.
  const gate = (promptText) =>
    hasVehicle() ? (
      <View style={styles.bannerRow}>
        <View style={styles.banner}>
          <View style={styles.bannerChip}>
            <Ionicons name="car-sport-outline" size={16} color={COLORS.textOnAccent} />
          </View>
          <Text style={styles.bannerText} numberOfLines={1}>{vehicleString()}</Text>
        </View>
        <Pressable
          onPress={handleSaveToGarage}
          accessibilityRole="button"
          accessibilityLabel="Save this vehicle to your garage"
          style={({ pressed }) => [styles.saveBtn, press(pressed)]}
        >
          <Ionicons name="bookmark-outline" size={16} color={COLORS.accent} />
          <Text style={styles.saveBtnText}>Garage</Text>
        </Pressable>
      </View>
    ) : (
      <Text style={styles.prompt}>{promptText}</Text>
    );

  const renderSearch = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <VehiclePicker year={year} make={make} model={model} onChange={handleVehicleChange} />

      {year && make ? (
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.cardLabel}>ENGINE (OPTIONAL)</Text>
          <View style={styles.engineRow}>
            <Ionicons
              name="construct-outline" size={18}
              color={engine ? COLORS.cyan : COLORS.textDim}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.engineInput}
              placeholder="e.g. 2.0L, 3.5L V6"
              placeholderTextColor={COLORS.textDim}
              value={engine}
              onChangeText={setEngine}
              autoCapitalize="characters"
            />
          </View>
          <Text style={sharedStyles.hint}>
            Adding the engine sharpens every retailer search.
          </Text>
        </View>
      ) : null}

      {gate('Pick a year and make to unlock the parts grid.')}

      <PartGrid enabled={hasVehicle()} onSelect={openPart} />
    </ScrollView>
  );

  const renderVin = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <VinDecoder vin={vin} onChange={handleVinChange} onDecoded={handleVinDecoded} />
      {gate('Decode a VIN above to unlock the parts grid.')}
      <PartGrid enabled={hasVehicle()} onSelect={openPart} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.page} />

      {/* ── Ambient stage lighting (felt, not seen) ─────────────── */}
      <View pointerEvents="none" style={styles.ambient}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
      </View>

      <View style={styles.column}>
        {/* ── Pro header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.logoTile}>
            <Ionicons name="construct" size={24} color={COLORS.textOnAccent} />
          </View>
          <View style={styles.nameWrap}>
            <Text style={styles.logoText}>
              Mechanic<Text style={styles.logoAccent}>Mate</Text>
            </Text>
            <Text style={styles.tagline}>PRO PARTS FINDER</Text>
          </View>
        </View>

        {/* ── Sliding top-tab rail ───────────────────────────────── */}
        <TopTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── Active screen ──────────────────────────────────────── */}
        <View style={styles.screenArea}>
          {activeTab === 'search'  && renderSearch()}
          {activeTab === 'vin'     && renderVin()}
          {activeTab === 'garage'  && (
            <GarageScreen
              vehicles={garage.vehicles}
              onRemove={garage.removeVehicle}
              onSelect={handleGarageSelect}
            />
          )}
          {activeTab === 'history' && (
            <MaintenanceScreen
              vehicles={garage.vehicles}
              records={maint.records}
              onLog={maint.logService}
              onRemoveRecord={maint.removeRecord}
              getRecordsForVehicle={maint.getRecordsForVehicle}
            />
          )}
        </View>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            MechanicMate <Text style={styles.footerAccent}>Pro</Text>  ·  © 2026
          </Text>
        </View>
      </View>

      <ActionModal
        visible={modalVisible}
        part={selectedPart}
        vehicleString={vehicleString()}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1, backgroundColor: COLORS.page,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  ambient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
  glowTop: {
    position: 'absolute', top: -130, left: '8%', right: '8%', height: 280,
    borderRadius: 220, backgroundColor: hexA(COLORS.accent, 0.06),
  },
  glowBottom: {
    position: 'absolute', bottom: -150, left: '4%', right: '28%', height: 300,
    borderRadius: 240, backgroundColor: hexA(COLORS.cyan, 0.045),
  },
  column: { flex: 1, zIndex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.line,
  },
  logoTile: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent, shadowOpacity: 0.5, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  nameWrap: { marginLeft: 12 },
  logoText: { color: COLORS.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  logoAccent: { color: COLORS.accent },
  tagline: {
    color: COLORS.textDim, fontSize: 10, fontWeight: '800',
    letterSpacing: 1.6, marginTop: 2,
  },
  screenArea: { flex: 1 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: 20, paddingBottom: 8 },
  engineRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.page,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.line,
    paddingHorizontal: 14, height: 52,
  },
  engineInput: { flex: 1, color: COLORS.text, fontSize: 16, letterSpacing: 0.5, paddingVertical: 0 },
  bannerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
  banner: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 13, paddingHorizontal: 14,
    shadowColor: COLORS.accent, shadowOpacity: 0.4, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  bannerChip: {
    width: 30, height: 30, borderRadius: 9, marginRight: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  bannerText: { flex: 1, color: COLORS.textOnAccent, fontWeight: '800', fontSize: 15 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    paddingVertical: 13, paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.line,
  },
  saveBtnText: { color: COLORS.accent, fontWeight: '800', fontSize: 14, marginLeft: 6 },
  prompt: { color: COLORS.textDim, fontSize: 14, textAlign: 'center', marginVertical: 16, lineHeight: 20 },
  footer: {
    paddingVertical: 11, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: COLORS.line,
    backgroundColor: COLORS.page,
  },
  footerText: { color: COLORS.textDim, fontSize: TYPE.micro, fontWeight: '700', letterSpacing: 0.6 },
  footerAccent: { color: COLORS.accent },
});