import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { COLORS, sharedStyles } from '../theme';
import { decodeVIN } from '../utils/nhtsa';

export default function VinDecoder({ vin, onChange, onDecoded }) {
  const [decoding, setDecoding] = useState(false);
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState('');

  const handleDecode = async () => {
    if (vin.trim().length !== 17) {
      setError('VIN must be exactly 17 characters.');
      return;
    }
    setError('');
    setDecoding(true);
    const result = await decodeVIN(vin.trim());
    setDecoding(false);

    if (result && result.make) {
      setDecoded(result);
      onDecoded(result);
    } else {
      setDecoded(null);
      setError('Could not decode this VIN. Please double-check it.');
    }
  };

  return (
    <View style={sharedStyles.card}>
      <Text style={sharedStyles.cardLabel}>VIN</Text>
      <TextInput
        style={[sharedStyles.input, styles.vinInput]}
        placeholder="e.g. 1HGBH41JXMN109186"
        placeholderTextColor={COLORS.textDim}
        value={vin}
        onChangeText={(t) => {
          onChange(t.toUpperCase().replace(/[^A-Z0-9]/g, ''));
          setDecoded(null);
          setError('');
        }}
        autoCapitalize="characters"
        maxLength={17}
      />
      <Text style={sharedStyles.hint}>
        Find your VIN on the dashboard by the windshield or inside the
        driver door jamb.
      </Text>

      <TouchableOpacity
        style={[styles.decodeBtn, vin.length === 17 && styles.decodeBtnReady]}
        onPress={handleDecode}
        disabled={vin.length !== 17 || decoding}
      >
        {decoding ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.decodeBtnText}>🔍  Decode VIN</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {decoded ? (
        <View style={styles.decodedCard}>
          <Text style={styles.decodedTitle}>✅  Decoded Successfully</Text>
          <Text style={styles.decodedLine}>
            {decoded.year} {decoded.make} {decoded.model}
          </Text>
          {decoded.trim ? <Text style={styles.decodedSub}>Trim: {decoded.trim}</Text> : null}
          {decoded.engine ? (
            <Text style={styles.decodedSub}>
              Engine: {decoded.displacement}L {decoded.cylinders}-cyl {decoded.engine}
            </Text>
          ) : null}
          {decoded.fuelType ? <Text style={styles.decodedSub}>Fuel: {decoded.fuelType}</Text> : null}
          {decoded.driveType ? <Text style={styles.decodedSub}>Drive: {decoded.driveType}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  vinInput: { fontFamily: 'monospace', letterSpacing: 2, fontSize: 17 },
  decodeBtn: {
    marginTop: 12, backgroundColor: COLORS.border, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  decodeBtnReady: { backgroundColor: COLORS.accent },
  decodeBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  errorText: { color: COLORS.danger, fontSize: 13, marginTop: 8 },
  decodedCard: {
    marginTop: 14, backgroundColor: COLORS.bg, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.success,
  },
  decodedTitle: { color: COLORS.success, fontWeight: '800', fontSize: 14, marginBottom: 6 },
  decodedLine: { color: COLORS.text, fontWeight: '800', fontSize: 18 },
  decodedSub: { color: COLORS.textMuted, fontSize: 13, marginTop: 3 },
});