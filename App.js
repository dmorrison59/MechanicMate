import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';

// ==========================================================
// CONFIG  ---  EDIT THESE TWO LINES
// ==========================================================
// Put your real Amazon Associates tag here (looks like "yourname-20").
const AMAZON_AFFILIATE_TAG = 'YOUR-TAG-20';
// ==========================================================

// ----------------------------------------------------------
// VEHICLE DATA
// ----------------------------------------------------------
const YEARS = [
  '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018',
  '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010',
];

const MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'GMC', 'Ram', 'Dodge',
  'Jeep', 'Nissan', 'Hyundai', 'Kia', 'Subaru', 'Volkswagen',
  'BMW', 'Mercedes-Benz', 'Mazda', 'Buick', 'Cadillac', 'Lexus', 'Acura',
];

// ----------------------------------------------------------
// PART CATEGORIES
// ----------------------------------------------------------
const PART_CATEGORIES = [
  { id: 'brakes', label: 'Brake Pads', icon: '🛑', term: 'brake pads' },
  { id: 'rotors', label: 'Brake Rotors', icon: '⚙️', term: 'brake rotors' },
  { id: 'oil-filter', label: 'Oil Filter', icon: '🛢️', term: 'oil filter' },
  { id: 'air-filter', label: 'Air Filter', icon: '🌬️', term: 'engine air filter' },
  { id: 'cabin-filter', label: 'Cabin Filter', icon: '❄️', term: 'cabin air filter' },
  { id: 'battery', label: 'Battery', icon: '🔋', term: 'car battery' },
  { id: 'spark-plugs', label: 'Spark Plugs', icon: '⚡', term: 'spark plugs' },
  { id: 'wipers', label: 'Wiper Blades', icon: '💧', term: 'windshield wiper blades' },
  { id: 'alternator', label: 'Alternator', icon: '🔌', term: 'alternator' },
  { id: 'starter', label: 'Starter', icon: '🔑', term: 'starter motor' },
  { id: 'headlight', label: 'Headlight Bulb', icon: '💡', term: 'headlight bulb' },
  { id: 'serpentine', label: 'Serpentine Belt', icon: '➰', term: 'serpentine belt' },
  { id: 'thermostat', label: 'Thermostat', icon: '🌡️', term: 'engine thermostat' },
  { id: 'fuel-pump', label: 'Fuel Pump', icon: '⛽', term: 'fuel pump' },
  { id: 'radiator', label: 'Radiator', icon: '♨️', term: 'radiator' },
  { id: 'oxygen-sensor', label: 'O2 Sensor', icon: '🧪', term: 'oxygen sensor' },
];

export default function App() {
  const [mode, setMode] = useState('vehicle'); // 'vehicle' | 'vin'
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [vin, setVin] = useState('');
  const [selectedPart, setSelectedPart] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Build the vehicle portion of a search query
  const vehicleString = () => {
    if (mode === 'vin') {
      return vin.trim();
    }
    return [year, make, model.trim()].filter(Boolean).join(' ');
  };

  const hasVehicle = () => {
    if (mode === 'vin') return vin.trim().length >= 11;
    return Boolean(year && make);
  };

  const openPart = (part) => {
    setSelectedPart(part);
    setModalVisible(true);
  };

  const buildQuery = (part) => {
    const v = vehicleString();
    return `${v} ${part.term}`.trim();
  };

  const openURL = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  const searchAutoZone = (part) => {
    const q = encodeURIComponent(buildQuery(part));
    openURL(`https://www.autozone.com/searchresult?searchText=${q}`);
  };

  const searchOReilly = (part) => {
    const q = encodeURIComponent(buildQuery(part));
    openURL(`https://www.oreillyauto.com/search?q=${q}`);
  };

  const searchAmazon = (part) => {
    const q = encodeURIComponent(buildQuery(part));
    const tag = AMAZON_AFFILIATE_TAG ? `&tag=${encodeURIComponent(AMAZON_AFFILIATE_TAG)}` : '';
    openURL(`https://www.amazon.com/s?k=${q}${tag}`);
  };

  const searchYouTube = (part) => {
    const q = encodeURIComponent(`${buildQuery(part)} replacement how to`);
    openURL(`https://www.youtube.com/results?search_query=${q}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          Mechanic<Text style={styles.logoAccent}>Mate</Text>
        </Text>
        <Text style={styles.tagline}>Find the right part. Watch how to install it.</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mode toggle */}
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
          <View style={styles.card}>
            <Text style={styles.cardLabel}>YEAR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.chip, year === y && styles.chipActive]}
                  onPress={() => setYear(y)}
                >
                  <Text style={[styles.chipText, year === y && styles.chipTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.cardLabel}>MAKE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {MAKES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, make === m && styles.chipActive]}
                  onPress={() => setMake(m)}
                >
                  <Text style={[styles.chipText, make === m && styles.chipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.cardLabel}>MODEL</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Silverado, Camry, F-150"
              placeholderTextColor="#64748B"
              value={model}
              onChangeText={setModel}
              autoCapitalize="words"
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>VIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 17-character VIN"
              placeholderTextColor="#64748B"
              value={vin}
              onChangeText={(t) => setVin(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={17}
            />
            <Text style={styles.hint}>
              Your VIN is on the dashboard by the windshield or inside the driver door jamb.
            </Text>
          </View>
        )}

        {/* Selected vehicle banner */}
        {hasVehicle() ? (
          <View style={styles.vehicleBanner}>
            <Text style={styles.vehicleBannerText}>{vehicleString()}</Text>
          </View>
        ) : (
          <Text style={styles.prompt}>
            {mode === 'vehicle'
              ? 'Pick a year and make to get started.'
              : 'Enter your VIN to get started.'}
          </Text>
        )}

        {/* Parts grid */}
        <Text style={styles.sectionTitle}>Choose a part</Text>
        <View style={styles.grid}>
          {PART_CATEGORIES.map((part) => (
            <TouchableOpacity
              key={part.id}
              style={[styles.partCard, !hasVehicle() && styles.partCardDisabled]}
              onPress={() => hasVehicle() && openPart(part)}
              activeOpacity={hasVehicle() ? 0.7 : 1}
            >
              <Text style={styles.partIcon}>{part.icon}</Text>
              <Text style={styles.partLabel}>{part.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Action modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {selectedPart?.icon} {selectedPart?.label}
            </Text>
            <Text style={styles.modalSubtitle}>{vehicleString()}</Text>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#F97316' }]}
              onPress={() => selectedPart && searchAutoZone(selectedPart)}
            >
              <Text style={styles.actionBtnText}>Shop AutoZone</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#16A34A' }]}
              onPress={() => selectedPart && searchOReilly(selectedPart)}
            >
              <Text style={styles.actionBtnText}>Shop O'Reilly</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#2563EB' }]}
              onPress={() => selectedPart && searchAmazon(selectedPart)}
            >
              <Text style={styles.actionBtnText}>Shop Amazon</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#DC2626' }]}
              onPress={() => selectedPart && searchYouTube(selectedPart)}
            >
              <Text style={styles.actionBtnText}>▶  Watch Install Videos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logo: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', letterSpacing: 0.5 },
  logoAccent: { color: '#F97316' },
  tagline: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#F97316' },
  toggleText: { color: '#94A3B8', fontWeight: '700', fontSize: 14 },
  toggleTextActive: { color: '#0F172A' },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  chipRow: { flexDirection: 'row', marginBottom: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: { backgroundColor: '#F97316', borderColor: '#F97316' },
  chipText: { color: '#CBD5E1', fontWeight: '600' },
  chipTextActive: { color: '#0F172A', fontWeight: '800' },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: { color: '#64748B', fontSize: 12, marginTop: 8, lineHeight: 17 },
  vehicleBanner: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  vehicleBannerText: { color: '#0F172A', fontWeight: '800', fontSize: 15, textAlign: 'center' },
  prompt: { color: '#64748B', fontSize: 14, textAlign: 'center', marginVertical: 14 },
  sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '800', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  partCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  partCardDisabled: { opacity: 0.45 },
  partIcon: { fontSize: 30, marginBottom: 8 },
  partLabel: { color: '#E2E8F0', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 34,
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#475569',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  modalSubtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginBottom: 20, marginTop: 4 },
  actionBtn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  actionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  closeBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  closeBtnText: { color: '#94A3B8', fontWeight: '700', fontSize: 15 },
});
