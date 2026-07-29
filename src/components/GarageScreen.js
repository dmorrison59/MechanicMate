import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import { COLORS, sharedStyles } from '../theme';

export default function GarageScreen({ vehicles, onRemove, onSelect }) {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>🏠  My Garage</Text>

      {vehicles.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyText}>
            No vehicles saved yet.{'\n'}
            Search for a vehicle on the Find Parts tab,{'\n'}
            then tap "Save to Garage".
          </Text>
        </View>
      ) : (
        vehicles.map((v) => (
          <View key={v.id} style={sharedStyles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleName}>
                  {v.year} {v.make} {v.model || ''}
                </Text>
                {v.vin ? <Text style={styles.vin}>VIN: {v.vin}</Text> : null}
                {v.engine ? (
                  <Text style={styles.detail}>
                    {v.displacement}L {v.cylinders}-cyl · {v.fuelType}
                  </Text>
                ) : null}
                <Text style={styles.added}>
                  Added {new Date(v.addedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.accent }]}
                onPress={() => onSelect(v)}
              >
                <Text style={styles.actionBtnText}>🔧  Find Parts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.border }]}
                onPress={() => handleRemove(v)}
              >
                <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>🗑️  Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20 },
  heading: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 18 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyText: { color: COLORS.textDim, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center' },
  vehicleName: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  vin: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'monospace', marginTop: 4 },
  detail: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  added: { color: COLORS.textDim, fontSize: 11, marginTop: 6 },
  actions: { flexDirection: 'row', marginTop: 14, gap: 10 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  actionBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});