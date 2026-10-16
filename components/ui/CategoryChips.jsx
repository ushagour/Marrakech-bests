import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, layout, radii, spacing, typography } from '../../config/theme';
import { hapticLight } from '../../utils/haptics';
import { useLanguage } from '../../context/LanguageContext';

const FADE_WIDTH = 28;

export default function CategoryChips({ categories, selected, onSelect, backgroundColor = colors.background }) {
  const { t } = useLanguage();
  const [scrollX, setScrollX] = useState(0);
  const [contentW, setContentW] = useState(0);
  const [viewW, setViewW] = useState(0);

  const showLeft = scrollX > 4;
  const showRight = contentW - viewW - scrollX > 4;
  const transparent = backgroundColor + '00';

  return (
    <View onLayout={(e) => setViewW(e.nativeEvent.layout.width)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        scrollEventThrottle={16}
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        onContentSizeChange={(w) => setContentW(w)}
        accessibilityRole="tablist"
      >
        {categories.map((cat) => {
          const active = cat === selected;
          return (
            <Pressable
              key={cat}
              onPress={() => {
                hapticLight();
                onSelect(cat);
              }}
              hitSlop={{ top: 4, bottom: 4 }}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t(cat)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {showLeft ? (
        <LinearGradient
          pointerEvents="none"
          colors={[backgroundColor, transparent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fade, { left: 0 }]}
        />
      ) : null}
      {showRight ? (
        <LinearGradient
          pointerEvents="none"
          colors={[transparent, backgroundColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fade, { right: 0 }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: spacing.sm },
  chip: {
    height: 40,
    minWidth: layout.touchTarget,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { ...typography.small, fontFamily: 'Karla-Bold', color: colors.textMuted },
  chipTextActive: { color: colors.textOnBrand },
  fade: { position: 'absolute', top: 0, bottom: 0, width: FADE_WIDTH },
});
