import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../src/store/useStore';
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryById } from '../src/constants/categories';
import { todayISO } from '../src/utils/format';
import { TransactionType } from '../src/types';

const PURPLE = '#6C63FF';

export default function AddScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const transactions = useStore((s) => s.transactions);
  const recentTransactions = useStore((s) => s.recentTransactions);
  const addTransaction = useStore((s) => s.addTransaction);
  const editTransaction = useStore((s) => s.editTransaction);
  const removeTransaction = useStore((s) => s.removeTransaction);
  const currency = useStore((s) => s.currency);

  const existing = id
    ? [...transactions, ...recentTransactions].find((t) => t.id === id)
    : undefined;

  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [amountStr, setAmountStr] = useState(
    existing ? String(existing.amount / 100) : ''
  );
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [date, setDate] = useState(existing?.date ?? todayISO());

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (!existing) {
      setCategoryId('');
    }
  }, [type]);

  function parseCents(str: string): number | null {
    const n = parseFloat(str.replace(',', '.'));
    if (isNaN(n) || n <= 0) return null;
    return Math.round(n * 100);
  }

  async function handleSave() {
    const cents = parseCents(amountStr);
    if (!cents) {
      Alert.alert('Invalid amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Select a category', 'Please choose a category for this transaction.');
      return;
    }

    const tx = {
      id: existing?.id ?? uuidv4(),
      type,
      amount: cents,
      categoryId,
      note: note.trim(),
      date,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (existing) {
      await editTransaction(tx);
    } else {
      await addTransaction(tx);
    }
    router.back();
  }

  async function handleDelete() {
    Alert.alert('Delete transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeTransaction(existing!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{existing ? 'Edit Transaction' : 'Add Transaction'}</Text>
          {existing ? (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color="#E74C3C" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Type toggle */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]}
              onPress={() => setType('expense')}
            >
              <Ionicons name="arrow-up-circle" size={16} color={type === 'expense' ? '#fff' : '#7F8C8D'} />
              <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'income' && styles.typeBtnIncomeActive]}
              onPress={() => setType('income')}
            >
              <Ionicons name="arrow-down-circle" size={16} color={type === 'income' ? '#fff' : '#7F8C8D'} />
              <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <TextInput
              style={styles.amountInput}
              value={amountStr}
              onChangeText={setAmountStr}
              placeholder="0.00"
              placeholderTextColor="#D5D8DC"
              keyboardType="decimal-pad"
              autoFocus={!existing}
            />
          </View>

          {/* Note */}
          <View style={styles.field}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={note}
              onChangeText={setNote}
              placeholder="What was this for?"
              placeholderTextColor="#D5D8DC"
              maxLength={100}
            />
          </View>

          {/* Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.textInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#D5D8DC"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => {
                const selected = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      { borderColor: cat.color },
                      selected && { backgroundColor: cat.color },
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={selected ? '#fff' : cat.color}
                    />
                    <Text style={[styles.catChipText, selected && { color: '#fff' }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{existing ? 'Save Changes' : 'Add Transaction'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
  closeBtn: { width: 36, height: 36, justifyContent: 'center' },
  deleteBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'flex-end' },
  content: { padding: 20, paddingBottom: 40 },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  typeBtnActive: { backgroundColor: '#E74C3C' },
  typeBtnIncomeActive: { backgroundColor: '#2ECC71' },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#7F8C8D' },
  typeBtnTextActive: { color: '#fff' },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  currencySymbol: { fontSize: 28, fontWeight: '700', color: '#1A1A2E', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 36, fontWeight: '800', color: '#1A1A2E' },
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#7F8C8D', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1A1A2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  catChipText: { fontSize: 12, fontWeight: '600', color: '#1A1A2E' },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
