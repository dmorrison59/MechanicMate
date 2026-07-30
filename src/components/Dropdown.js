import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback,
  TextInput, ScrollView, Animated, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPE } from '../theme';

const norm = (opts) =>
  (opts || []).map((o) => (typeof o === 'string' ? { label: o, value: o } : o));

export default function Dropdown({
  label, value, placeholder, options, onSelect, searchable, required, disabled,
}) {
  const items = norm(options);
  const selected = items.find((i) => i.value === value);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rot, {
      toValue: open ? 1 : 0, duration: 200, useNativeDriver: true,
    }).start();
  }, [open, rot]);

  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const filtered = q
    ? items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
    : items;

  const openIt = () => { if (!disabled) { setQ(''); setOpen(true); } };

  return (
    <View style={{ marginBottom: 14 }}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.req}> *</Text> : null}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerOff]}
        onPress={openIt} activeOpacity={0.8}
      >
        <Text style={[styles.triggerText, !selected && styles.triggerPh]} numberOfLines={1}>
          {selected ? selected.label : (placeholder || 'Select…')}
        </Text>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="chevron-down" size={20} color={selected ? COLORS.cyan : COLORS.textDim} />
        </Animated.View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.handle} />
                <View style={styles.sheetHead}>
                  <Text style={styles.sheetTitle}>{label || 'Select'}</Text>
                  <TouchableOpacity onPress={() => setOpen(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={22} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                {searchable ? (
                  <View style={styles.searchWrap}>
                    <Ionicons name="search" size={18} color={COLORS.textDim} style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.searchInput} placeholder="Search…"
                      placeholderTextColor={COLORS.textDim}
                      value={q} onChangeText={setQ} autoFocus
                    />
                  </View>
                ) : null}

                <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                  {filtered.length === 0 ? (
                    <Text style={styles.empty}>No matches.</Text>
                  ) : filtered.map((it, idx) => {
                    const isSel = it.value === value;
                    return (
                      <TouchableOpacity
                        key={String(it.value) + idx}
                        style={[styles.row, isSel && styles.rowSel]}
                        onPress={() => { onSelect(it.value); setOpen(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.rowText, isSel && styles.rowTextSel]} numberOfLines={1}>
                          {it.label}
                        </Text>
                        {isSel ? <Ionicons name="checkmark" size={20} color={COLORS.cyan} /> : null}
                      </TouchableOpacity>
                    );
                  })}
                  <View style={{ height: 20 }} />
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: COLORS.textMuted, fontSize: TYPE.micro, fontWeight: '800', letterSpacing: 1, marginBottom: 7 },
  req: { color: COLORS.cyan },
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.line, borderTopColor: COLORS.lineHi,
    paddingHorizontal: 16, height: 54,
  },
  triggerOff: { opacity: 0.5 },
  triggerText: { flex: 1, color: COLORS.text, fontSize: TYPE.h3, fontWeight: '600', marginRight: 10 },
  triggerPh: { color: COLORS.textDim },
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, maxHeight: '72%' },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#475569', alignSelf: 'center', marginBottom: 14 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { color: COLORS.text, fontSize: TYPE.h2, fontWeight: '800' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.page, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 12, height: 44, marginBottom: 8 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: TYPE.body },
  list: { flexGrow: 0 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  rowSel: { backgroundColor: COLORS.cyanSoft, borderRadius: 8 },
  rowText: { flex: 1, color: COLORS.textMuted, fontSize: TYPE.h3, marginRight: 10 },
  rowTextSel: { color: COLORS.text, fontWeight: '700' },
  empty: { color: COLORS.textDim, textAlign: 'center', paddingVertical: 24 },
});