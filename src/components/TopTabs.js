import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPE } from '../theme';

export default function TopTabs({ tabs, active, onChange }) {
  const idx = Math.max(0, tabs.findIndex((t) => t.id === active));
  const [w, setW] = useState(0);
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (w > 0) {
      Animated.spring(tx, {
        toValue: idx * (w / tabs.length),
        useNativeDriver: true, tension: 120, friction: 14,
      }).start();
    }
  }, [idx, w, tx, tabs.length]);

  const indW = w > 0 ? w / tabs.length : 0;

  return (
    <View style={styles.bar} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <View style={styles.row}>
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <TouchableOpacity
              key={t.id} style={styles.tab} onPress={() => onChange(t.id)}
              activeOpacity={0.75} accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <Ionicons
                name={t.icon} size={21}
                color={on ? COLORS.accent : COLORS.textDim}
                style={{ marginBottom: 3, transform: [{ scale: on ? 1.08 : 1 }] }}
              />
              <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {indW > 0 ? (
        <Animated.View style={[styles.indicator, { width: indW, transform: [{ translateX: tx }] }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  row: { flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 11 },
  label: { color: COLORS.textDim, fontSize: TYPE.micro, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  labelOn: { color: COLORS.accent },
  indicator: { position: 'absolute', bottom: 0, height: 3, backgroundColor: COLORS.accent, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
});