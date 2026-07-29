import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, Alert,
} from 'react-native';
import { COLORS, sharedStyles } from '../theme';
import { MAINTENANCE_ITEMS } from '../data/parts';

export default function MaintenanceScreen({
  vehicles, records, onLog, onRemoveRecord, getRecordsForVehicle,
}) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [mileage, setMileage] = useState('');
  const [showItems, setShowItems] = useState(false);

  const vehicleRecords = selectedVehicle
    ? getRecordsForVehicle(selectedVehicle.id)
    : [];

  const handleLog = (item) => {
    if (!mileage || Number(mileage) <= 0) {
      Alert.alert('Enter Mileage', 'Please enter your current odometer reading.');
      return;
    }
    onLog(selectedVehicle.id, item.id, mileage);
    setShowItems(false);
    Alert.alert('Logged! ✅', `${item.label} recorded at ${Number(mileage).toLocaleString()} miles.`);
  };

  const handleDelete = (rec) => {
    Alert.alert('Delete Record', 'Remove this maintenance record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onRemoveRecord(rec.id) },
    ]);
  };

  const itemLabel = (id) => MAINTENANCE_ITEMS.find((i) => i.id === id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>🔧  Maintenance Log</Text>

      {vehicles.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>
            Save a vehicle to your garage first,{'\n'}
            then track its maintenance here.
          </Text>
        </View>
      ) : (
        <>
          <Text style={sharedStyles.cardLabel}>SELECT VEHICLE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {vehicles.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.vChip,
                  selectedVehicle?.id === v.id && styles.vChipActive,
                ]}
                onPress={() => { setSelectedVehicle(v); setShowItems(false); }}
              >
                <Text
                  style={[
                    styles.vChipText,
                    selectedVehicle?.id === v.id && styles.vChipTextActive,
                  ]}
                >
                  {v.year} {v.make} {v.model || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedVehicle ? (
            <>
              <View style={sharedStyles.card}>
                <Text style={sharedStyles.cardLabel}>CURRENT ODOMETER</Text>
                <TextInput
                  style={sharedStyles.input}
                  placeholder="e.g. 85000"
                  placeholderTextColor={COLORS.textDim}
                  value={mileage}
                  onChangeText={setMileage}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.logBtn}
                  onPress={() => setShowItems(!showItems)}
                >
                  <Text style={styles.logBtnText}>
                    {showItems ? '−  Hide Services' : '+  Log a Service'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showItems ? (
                <View style={sharedStyles.card}>
                  <Text style={sharedStyles.cardLabel}>WHAT DID YOU DO?</Text>
                  <View style={styles.itemGrid}>
                    {MAINTENANCE_ITEMS.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.itemBtn}
                        onPress={() => handleLog(item)}
                      >
                        <Text style={styles.itemIcon}>{item.icon}</Text>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        <Text style={styles.itemInterval}>
                          {item.intervalMiles > 0
                            ? `Every ${(item.intervalMiles / 1000).toFixed(0)}k mi`
                            : `Every ${item.intervalMonths} mo`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}

              <Text style={[sharedStyles.cardLabel, { marginTop: 8 }]}>
                SERVICE HISTORY ({vehicleRecords.length})
              </Text>
              {vehicleRecords.length === 0 ? (
                <Text style={styles.noRecords}>No records yet.</Text>
              ) : (
                vehicleRecords.map((rec) => {
                  const item = itemLabel(rec.itemId);
                  return (
                    <TouchableOpacity
                      key={rec.id}
                      style={styles.recordCard}
                      onLongPress={() => handleDelete(rec)}
                    >
                      <Text style={styles.recordIcon}>{item?.icon || '🔧'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recordLabel}>{item?.label || rec.itemId}</Text>
                        <Text style={styles.recordMeta}>
                          {Number(rec.mileage).toLocaleString()} mi ·{' '}
                          {new Date(rec.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.recordDelete}>✕</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          ) : (
            <Text style={styles.noRecords}>Select a vehicle above to get started.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 40 },
  heading: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 18 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyText: { color: COLORS.textDim, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  vChip: {
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.card,
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  vChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  vChipText: { color: '#CBD5E1', fontWeight: '600', fontSize: 13 },
  vChipTextActive: { color: COLORS.textOnAccent, fontWeight: '800' },
  logBtn: {
    marginTop: 12, backgroundColor: COLORS.accent, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  logBtnText: { color: COLORS.textOnAccent, fontWeight: '800', fontSize: 15 },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  itemBtn: {
    width: '48%', backgroundColor: COLORS.bg, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  itemIcon: { fontSize: 24, marginBottom: 4 },
  itemLabel: { color: COLORS.text, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  itemInterval: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
  noRecords: { color: COLORS.textDim, fontSize: 14, textAlign: 'center', marginVertical: 16 },
  recordCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  recordIcon: { fontSize: 22, marginRight: 12 },
  recordLabel: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  recordMeta: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  recordDelete: { color: COLORS.textDim, fontSize: 16, paddingLeft: 8 },
});