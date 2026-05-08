import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/useStore';
import { CURRENCIES } from '../../src/constants/currencies';
import { clearAllTransactions } from '../../src/db/database';
import { Currency } from '../../src/types';

const PURPLE = '#6C63FF';

export default function SettingsScreen() {
  const currency = useStore((s) => s.currency);
  const setCurrency = useStore((s) => s.setCurrency);
  const loadMonth = useStore((s) => s.loadMonth);
  const loadRecent = useStore((s) => s.loadRecent);
  const selectedMonth = useStore((s) => s.selectedMonth);

  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const filtered = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.includes(search)
  );

  function selectCurrency(c: Currency) {
    setCurrency(c);
    setShowPicker(false);
    setSearch('');
  }

  function handleClearData() {
    Alert.alert(
      'Clear all data',
      'This will permanently delete all your transactions. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await clearAllTransactions();
            await loadMonth(selectedMonth);
            await loadRecent();
          },
        },
      ]
    );
  }

  if (showPicker) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={() => { setShowPicker(false); setSearch(''); }}>
            <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.pickerTitle}>Select Currency</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color="#AEB6BF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search currency..."
            placeholderTextColor="#AEB6BF"
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.code}
          renderItem={({ item }) => {
            const selected = item.code === currency.code;
            return (
              <TouchableOpacity
                style={[styles.currencyRow, selected && styles.currencyRowSelected]}
                onPress={() => selectCurrency(item)}
              >
                <View style={styles.currencySymbolBox}>
                  <Text style={styles.currencySymbol}>{item.symbol}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.currencyName}>{item.name}</Text>
                  <Text style={styles.currencyCode}>{item.code}</Text>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={20} color={PURPLE} />}
              </TouchableOpacity>
            );
          }}
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowPicker(true)}>
            <View style={styles.settingIcon}>
              <Ionicons name="cash-outline" size={20} color={PURPLE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Currency</Text>
              <Text style={styles.settingValue}>{currency.symbol} — {currency.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#AEB6BF" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>DATA</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={handleClearData}>
            <View style={[styles.settingIcon, { backgroundColor: '#FDEDEC' }]}>
              <Ionicons name="trash-outline" size={20} color="#E74C3C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: '#E74C3C' }]}>Clear All Data</Text>
              <Text style={styles.settingValue}>Permanently delete all transactions</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Budget Tracker v1.0{'\n'}All data is stored locally on your device.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A2E' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#AEB6BF', letterSpacing: 1, marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  settingValue: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#AEB6BF',
    lineHeight: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A2E' },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  currencyRowSelected: { backgroundColor: '#EEF0FF' },
  currencySymbolBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencySymbol: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  currencyName: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  currencyCode: { fontSize: 12, color: '#7F8C8D', marginTop: 1 },
});
