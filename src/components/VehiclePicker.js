import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPE, hexA, sharedStyles } from '../theme';
import { YEARS, MAKES } from '../data/vehicles';
import { fetchModels } from '../utils/nhtsa';
import Dropdown from './Dropdown';

export default function VehiclePicker({ year, make, model, onChange }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Live model list from NHTSA. The `active` flag kills stale responses
  // when the user changes make faster than the network answers.
  useEffect(() => {
    let active = true;
    if (year && make) {
      setLoading(true);
      setModels([]);
      fetchModels(year, make).then((m) => {
        if (active) { setModels(m); setLoading(false); }
      });
    } else {
      setModels([]);
      setLoading(false);
    }
    return () => { active = false; };
  }, [year, make]);

  // Progressive state for the Model dropdown — it always knows WHY it's locked.
  const canLoad = Boolean(year && make);
  const modelDisabled = !canLoad || loading || models.length === 0;
  let modelPh = 'Select model';
  if (!canLoad) modelPh = 'Select year & make first';
  else if (loading) modelPh = 'Loading models…';
  else if (models.length === 0) modelPh = 'No models for this combo';

  return (
    <View style={sharedStyles.card}>
      <View style={styles.head}>
        <View style={styles.iconChip}>
          <Ionicons name="car-outline" size={24} color={COLORS.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Your Vehicle</Text>
          <Text style={styles.subtitle}>
            Year, make & model — models load live from NHTSA.
          </Text>
        </View>
      </View>

      <Dropdown
        label="Year" required value={year} placeholder="Select year"
        options={YEARS}
        onSelect={(v) => onChange({ year: v, make: '', model: '' })}
      />

      <Dropdown
        label="Make" required value={make}
        placeholder={year ? 'Select make' : 'Select year first'}
        options={MAKES} disabled={!year}
        onSelect={(v) => onChange({ make: v, model: '' })}
      />

      <Dropdown
        label="Model" required value={model}
        placeholder={modelPh} options={models}
        disabled={modelDisabled} searchable
        onSelect={(v) => onChange({ model: v })}
      />

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={COLORS.cyan} />
          <Text style={styles.loadingText}>Pulling the live model list…</Text>
        </View>
      ) : null}

      <View style={styles.foot}>
        <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.textDim} />
        <Text style={styles.footText}>Free U.S. DOT data · no account needed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconChip: {
    width: 46, height: 46, borderRadius: 13, marginRight: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: hexA(COLORS.accent, 0.14),
    borderWidth: 1, borderColor: hexA(COLORS.accent, 0.3),
    shadowColor: COLORS.accent, shadowOpacity: 0.4,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
  subtitle: { color: COLORS.textMuted, fontSize: TYPE.sm, marginTop: 2, lineHeight: 18 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: -4, marginBottom: 12, gap: 8 },
  loadingText: { color: COLORS.cyan, fontSize: TYPE.xs, fontWeight: '700', letterSpacing: 0.3 },
  foot: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 6 },
  footText: { color: COLORS.textDim, fontSize: TYPE.micro, letterSpacing: 0.2 },
});