import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { PART_CATEGORIES } from '../data/parts';

export default function PartGrid({ enabled, onSelect }) {
  return (
    <View>
      <Text style={styles.title}>Choose a Part</Text>
      <View style={styles.grid}>
        {PART_CATEGORIES.map((part) => (
          <TouchableOpacity
            key={part.id}
            style={[styles.card, !enabled && styles.cardDisabled]}
            onPress={() => enabled && onSelect(part)}
            activeOpacity={enabled ? 0.7 : 1}
          >
            <Text style={styles.icon}>{part.icon}</Text>
            <Text style={styles.label}>{part.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%', backgroundColor: COLORS.card, borderRadius: 14,
    paddingVertical: 22, alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardDisabled: { opacity: 0.45 },
  icon: { fontSize: 30, marginBottom: 8 },
  label: { color: '#E2E8F0', fontWeight: '700', fontSize: 14, textAlign: 'center' },
});