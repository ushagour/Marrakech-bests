import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getAllItems,
  ensureMenuTable,
  insertMenuIntoSQLite,
  searchItemsByText,
  insertMenuIfNotExists,
} from '../database/queries';
import Card from '../components/ui/Card';
import { MenuCardSkeleton } from '../components/ui/Skeleton';
import SearchBar from '../components/Forms/SearchBar';
import CategoryChips from '../components/ui/CategoryChips';
import getEnvVars from '../config/environment';
import { useFeedback } from '../context/FeedbackContext';
import { colors, spacing, typography, layout } from '../config/theme';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];
const LIST_BOTTOM_SPACE = layout.tabBarHeight + 96;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function mapRowToUI(r, idx = 0) {
  const tags = typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : Array.isArray(r.tags) ? r.tags : [];
  const available = typeof r.available === 'number' ? r.available === 1 : r.available !== false;

  return {
    id: r.id ? String(r.id) : String(idx + 1),
    name: r.name || 'Untitled',
    description: r.description || '',
    price: (typeof r.price === 'number' ? r.price : parseFloat(r.price) || 0).toFixed(2),
    category: r.category ? r.category.charAt(0).toUpperCase() + r.category.slice(1) : 'Uncategorized',
    image: r.image,
    rating: r.rating || null,
    prepareTime: r.prepareTime || '',
    available,
    tags,
  };
}

async function fetchRemoteItems() {
  const res = await fetch(getEnvVars.API_URL);
  const json = await res.json();
  return Array.isArray(json) ? json : json.menu || [];
}

function Home() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const { showToast } = useFeedback();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const ready = useRef(false);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const init = async () => {
      try {
        await ensureMenuTable(db);
        let rows = await getAllItems(db);
        if (!rows || rows.length === 0) {
          await insertMenuIntoSQLite(db, await fetchRemoteItems());
          rows = await getAllItems(db);
        }
        setMenuData(rows.map(mapRowToUI));
      } catch (e) {
        try {
          setMenuData((await fetchRemoteItems()).map(mapRowToUI));
        } catch {
          showToast(t('Could not load the menu. Pull down to retry.'), { type: 'error' });
        }
      } finally {
        ready.current = true;
        setLoading(false);
      }
    };
    init();
  }, [db, showToast, t]);

  useEffect(() => {
    if (!ready.current) return;
    const run = async () => {
      try {
        const rows = debouncedQuery.trim() ? await searchItemsByText(db, debouncedQuery) : await getAllItems(db);
        setMenuData((rows || []).map(mapRowToUI));
      } catch (e) {
        showToast(t('Search failed. Please try again.'), { type: 'error' });
      }
    };
    run();
  }, [debouncedQuery, db, showToast, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await insertMenuIfNotExists(db, await fetchRemoteItems());
      setMenuData((await getAllItems(db)).map(mapRowToUI));
    } catch (e) {
      showToast(t('Could not refresh the menu.'), { type: 'error' });
    } finally {
      setRefreshing(false);
    }
  }, [db, showToast, t]);

  const filtered = menuData.filter((m) => selectedCategory === 'All' || m.category === selectedCategory);

  const header = (
    <View style={styles.sticky}>
      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>
      <CategoryChips categories={CATEGORIES} selected={selectedCategory} onSelect={setSelectedCategory} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.brandBar, { paddingTop: insets.top + spacing.sm }]}>
        <Image source={require('../assets/Logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Marrakech Bites" />
        <Text style={styles.tagline}>{t('Moroccan-inspired street food.')}</Text>
      </View>

      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrap}>
            <Card item={item} index={index} />
          </View>
        )}
        ListHeaderComponent={header}
        stickyHeaderIndices={[0]}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletons}>
              {[0, 1, 2].map((k) => (
                <MenuCardSkeleton key={k} />
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t('No dishes found')}</Text>
              <Text style={styles.emptyText}>{t('Try a different search or category.')}</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: LIST_BOTTOM_SPACE }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  logo: { width: 150, height: 36 },
  tagline: { ...typography.caption, color: colors.textMuted, flexShrink: 1, textAlign: 'right' },
  sticky: { backgroundColor: colors.background, paddingBottom: spacing.sm },
  searchWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  skeletons: { paddingHorizontal: spacing.md, gap: spacing.md },
  cardWrap: { paddingHorizontal: spacing.md },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h2, color: colors.text },
  emptyText: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
});
