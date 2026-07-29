import React from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  TouchableWithoutFeedback, StyleSheet,
} from 'react-native';
import { COLORS } from '../theme';
import {
  searchAutoZone, searchOReilly, searchAmazon,
  searchYouTube, searchRockAuto,
} from '../utils/searchLinks';

export default function ActionModal({ visible, part, vehicleString, onClose }) {
  if (!part) return null;

  const actions = [
    { label: '🔧  Shop AutoZone',        color: '#D97706', fn: () => searchAutoZone(vehicleString, part) },
    { label: '🟢  Shop O\'Reilly',       color: '#16A34A', fn: () => searchOReilly(vehicleString, part) },
    { label: '📦  Shop Amazon',          color: '#2563EB', fn: () => searchAmazon(vehicleString, part) },
    { label: '🏎️  Shop RockAuto',        color: '#DC2626', fn: () => searchRockAuto(vehicleString, part) },
    { label: '▶️  Watch Install Videos',  color: '#7C3AED', fn: () => searchYouTube(vehicleString, part) },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.title}>{part.icon}  {part.label}</Text>
              <Text style={styles.subtitle}>{vehicleString}</Text>

              {actions.map((a, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.btn, { backgroundColor: a.color }]}
                  onPress={() => { a.fn(); onClose(); }}
                >
                  <Text style={styles.btnText}>{a.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 22, paddingBottom: 34,
  },
  handle: {
    width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#475569', alignSelf: 'center', marginBottom: 16,
  },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 20, marginTop: 4 },
  btn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  btnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  closeBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  closeBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 15 },
});