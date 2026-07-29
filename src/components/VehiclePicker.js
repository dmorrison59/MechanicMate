import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import { COLORS, sharedStyles } from '../theme';
import { YEARS, MAKES } from '../data/vehicles';
import { fetchModels } from '../utils/nhtsa';

export default function VehiclePicker({ year, make, model, onChange }) {
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelSearch, setModelSearch] = useState('');

  useEffect(() => {
    if (year && make) {
      setLoadingModels(true);
      setModels([]);
      setModelSearch('');
      onChange({ model: '' });
      fetchModels(year, make).then((m) => {
        setModels(m);
        setLoadingModels(false);
      });
    }
  }, [year, make]);

  const filteredModels = modelSearch
    ? models.filter((m) =>
        m.toLowerCase().includes(modelSearch.toLowerCase())
      )
    : models;

  return (
    <View style={sharedStyles.card}>
      <Text style={sharedStyles.cardLabel}>YEAR</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {YEARS.map((y) => (
          <TouchableOpacity
            key={y}
            style={[styles.chip, year === y && styles.chipActive]}
            onPress={() => onChange({ year: y, make: '', model: '' })}
          >
            <Text style={[styles.chipText, year === y && styles.chipTextActive]}>{y}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {year ? (
        <>
          <Text style={sharedStyles.cardLabel}>MAKE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {MAKES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.chip, make === m && styles.chipActive]}
                onPress={() => onChange({ make: m, model: '' })}
              >
                <Text style={[styles.chipText, make === m && styles.chipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : null}

      {year && make ? (
        <>
          <Text style={sharedStyles.cardLabel}>MODEL</Text>
          {loadingModels ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 12 }} />
          ) : (
            <>
              <TextInput
                style={sharedStyles.input}
                placeholder="Search models..."
                placeholderTextColor={COLORS.textDim}
                value={modelSearch}
                onChangeText={setModelSearch}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[styles.chipScroll, { marginTop: 8 }]}
              >
                {filteredModels.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.chip, model === m && styles.chipActive]}
                    onPress={() => onChange({ model: m })}
                  >
                    <Text style={[styles.chipText, model === m && styles.chipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {filteredModels.length === 0 && (
                <Text style={sharedStyles.hint}>No models found. Try a different search.</Text>
              )}
            </>
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chipScroll: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9, backgroundColor: COLORS.bg,
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { color: '#CBD5E1', fontWeight: '600' },
  chipTextActive: { color: COLORS.textOnAccent, fontWeight: '800' },
});