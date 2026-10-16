import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import colors from '../../config/colors';

export default function AppCheckbox({ checked, onChange, label, style }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={[styles.row, style]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Text style={styles.check}>✓</Text>}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  box: {
    width: 22, height: 22, borderRadius: 4, borderWidth: 1, borderColor: '#BFC9CC',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  boxChecked: { backgroundColor: colors.primary1, borderColor: colors.primary1 },
  check: { fontSize: 14, lineHeight: 14 },
  label: {  fontFamily: 'MarkaziText-Medium', fontSize: 18, color: colors.black},
});