import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Platform, StyleSheet, Alert,
} from 'react-native';
import { COLORS } from './src/theme';
import { useGarage, useMaintenance } from './src/hooks/useGarage';

import VehiclePicker     from './src/components/VehiclePicker';
import VinDecoder        from './src/components/VinDecoder';
import PartGrid          from './src/components/PartGrid';
import ActionModal       from './src/components/ActionModal';
import GarageScreen      from './src/components/GarageScreen';
import MaintenanceScreen from './src/components/MaintenanceScreen';

const TABS = [
  { id: 'parts',  icon: '🔍', label: 'Find Parts' },
  { id: 'garage', icon: '🏠', label: 'Garage' },
  { id: 'maint',  icon: '🔧', label: 'Maintenance' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('parts');

  const [mode, setMode]       = useState('vehicle');
  const [year, setYear]       = useState('');
  const [make, setMake]       = useState('');
  const [model, setModel]     = useState('');
  const [vin, setVin]         = useState('');
  const [decodedVin, setDecodedVin] = useState(null);

  const [selectedPart, setSelectedPart] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const garage = useGarage();
  const maint  = useMaintenance();

  const vehicleString = () => {
    if (mode === 'vin') {
      if (decodedVin?.make) {
        return [decodedVin.year, decodedVin.make, decodedVin.model]
          .filter(Boolean).join(' ');
      }
      return vin.trim();
    }
    return [year, make, model].filter(Boolean).join(' ');
  };

  const hasVehicle = () => {
    if (mode === 'vin') {
      return Boolean(decodedVin?.make) || vin.trim().length >= 11;
    }
    return Boolean(year && make);
  };

  const handleVehicleChange = useCallback((changes) => {
    if (changes.year !== undefined)  setYear(changes.year);
    if (changes.make !== undefined)  setMake(changes.make);
    if (changes.model !== undefined) setModel(changes.model);
  }, []);

  const handleVinDecoded = useCallback((result) => {
    setDecodedVin(result);
  }, []);

  const handleSaveToGarage = () => {
    const v =
      mode === 'vin' && decodedVin
        ? {
            year: decodedVin.year, make: decodedVin.make,
            model: decodedVin.model, vin: vin.trim(),
            engine: decodedVin.engine, cylinders: decodedVin.cylinders,
            displacement: decodedVin.displacement,
            fuelType: decodedVin.fuelType, driveType: decodedVin.driveType,
          }
        : { year, make, model, vin: '' };

    garage.addVehicle(v);
    Alert.alert('Saved! 🏠', `${v.year} ${v.make} ${v.model || ''} added to your garage.`);
  };

  const handleGarageSelect = (v) => {
    setMode('vehicle');
    setYear(v.year);
    setMake(v.make);
    setModel(v.model || '');
    setVin(v.vin || '');
    setActiveTab('parts');
  };

  const openPart = (part) => {
    setSelectedPart(part);
    setModalVisible(true);
  };

  const renderParts = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'vehicle' && styles.toggleBtnActive]}
          onPress={() => setMode('vehicle')}
        >
          <Text style={[styles.toggleText, mode === 'vehicle' && styles.toggleTextActive]}>
            By Vehicle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'vin' && styles.toggleBtnActive]}
          onPress={() => setMode('vin')}
        >
          <Text style={[styles.toggleText, mode === 'vin' && styles.toggleTextActive]}>
            By VIN
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'vehicle' ? (
        <VehiclePicker year={year} make={make} model={model} onChange={handleVehicleChange} />
      ) : (
        <VinDecoder vin={vin} onChange={setVin} onDecoded={handleVinDecoded} />
      )}

      {hasVehicle() ? (
        <View style={styles.bannerRow}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>🚗  {vehicleString()}</Text>
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToGarage}>
            <Text style={styles.saveBtnText}>+ Garage</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.prompt}>
          {mode === 'vehicle'
            ? 'Pick a year and make to get started.'
            : 'Enter your VIN and tap Decode.'}
        </Text>
      )}

      <PartGrid enabled={hasVehicle()} onSelect={openPart} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <Text style={styles.logo}>
          Mechanic<Text style={styles.logoAccent}>Mate</Text>
        </Text>
        <Text style={styles.tagline}>
          Find the right part. Track your maintenance. Watch how to install it.
        </Text>
      </View>

      {activeTab === 'parts' && renderParts()}
      {activeTab === 'garage' && (
        <GarageScreen
          vehicles={garage.vehicles}
          onRemove={garage.removeVehicle}
          onSelect={handleGarageSelect}
        />
      )}
      {activeTab === 'maint' && (
        <MaintenanceScreen
          vehicles={garage.vehicles}
          records={maint.records}
          onLog={maint.logService}
          onRemoveRecord={maint.removeRecord}
          getRecordsForVehicle={maint.getRecordsForVehicle}
        />
      )}

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab.id} style={styles.tab} onPress={() => setActiveTab(tab.id)}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {tab.id === 'garage' && garage.vehicles.length > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{garage.vehicles.length}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
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
    flex: 1, backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.card,
  },
  logo: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5 },
  logoAccent: { color: COLORS.accent },
  tagline: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  toggleRow: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    borderRadius: 12, padding: 4, marginBottom: 18,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: COLORS.accent },
  toggleText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 14 },
  toggleTextActive: { color: COLORS.textOnAccent },
  bannerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  banner: {
    flex: 1, backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  bannerText: { color: COLORS.textOnAccent, fontWeight: '800', fontSize: 15 },
  saveBtn: {
    backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 12,
    paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  saveBtnText: { color: COLORS.accent, fontWeight: '800', fontSize: 14 },
  prompt: { color: COLORS.textDim, fontSize: 14, textAlign: 'center', marginVertical: 14 },
  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', position: 'relative' },
  tabIcon: { fontSize: 22, marginBottom: 3 },
  tabLabel: { color: COLORS.textDim, fontSize: 11, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent, fontWeight: '800' },
  badge: {
    position: 'absolute', top: -4, right: 22,
    backgroundColor: COLORS.accent, borderRadius: 9,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: COLORS.textOnAccent, fontSize: 10, fontWeight: '800' },
});