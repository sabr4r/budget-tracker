import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/useStore';
import { getCategoryById } from '../../src/constants/categories';
import { formatAmount, formatDate, getMonthLabel, prevMonth, nextMonth, currentMonthString } from '../../src/utils/format';
import { Transaction } from '../../src/types';

const PURPLE = '#6C63FF';

function BalanceCard() {
  const currency = useStore((s) => s.currency);
  const totalIncome = useStore((s) => s.totalIncome);
  const totalExpenses = useStore((s) => s.totalExpenses);
  const netBalance = useStore((s) => s.netBalance);
  const selectedMonth = useStore((s) => s.selectedMonth);
  const setSelectedMonth = useStore((s) => s.setSelectedMonth);

  const isCurrentMonth = selectedMonth === currentMonthString();

  return (
    <View style={styles.card}>
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => setSelectedMonth(prevMonth(selectedMonth))}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{getMonthLabel(selectedMonth)}</Text>
        <TouchableOpacity
          onPress={() => !isCurrentMonth && setSelectedMonth(nextMonth(selectedMonth))}
          style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
        >
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.balanceLabel}>Net Balance</Text>
      <Text style={[styles.balanceAmount, { color: netBalance >= 0 ? '#A8F0C6' : '#FFB3B3' }]}>
        {netBalance < 0 ? '-' : ''}{formatAmount(Math.abs(netBalance), currency.symbol)}
      </Text>

      <View style={styles.cardRow}>
        <View style={styles.cardStat}>
          <Ionicons name="arrow-down-circle" size={16} color="#A8F0C6" />
          <Text style={styles.cardStatLabel}>Income</Text>
          <Text style={styles.cardStatAmount}>{formatAmount(totalIncome, currency.symbol)}</Text>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.cardStat}>
          <Ionicons name="arrow-up-circle" size={16} color="#FFB3B3" />
          <Text style={styles.cardStatLabel}>Expenses</Text>
          <Text style={styles.cardStatAmount}>{formatAmount(totalExpenses, currency.symbol)}</Text>
        </View>
      </View>
    </View>
  );
}

function TransactionRow({ item }: { item: Transaction }) {
  const currency = useStore((s) => s.currency);
  const router = useRouter();
  const category = getCategoryById(item.categoryId);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push({ pathname: '/add', params: { id: item.id } })}
    >
      <View style={[styles.iconWrap, { backgroundColor: category?.color + '22' }]}>
        <Ionicons name={category?.icon as any} size={20} color={category?.color} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowCategory}>{category?.name ?? 'Unknown'}</Text>
        {item.note ? <Text style={styles.rowNote} numberOfLines={1}>{item.note}</Text> : null}
        <Text style={styles.rowDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={[styles.rowAmount, { color: item.type === 'income' ? '#2ECC71' : '#E74C3C' }]}>
        {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount, currency.symbol)}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const recentTransactions = useStore((s) => s.recentTransactions);
  const transactions = useStore((s) => s.transactions);

  const displayList = recentTransactions.length > 0 ? recentTransactions : [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.appTitle}>Budget Tracker</Text>
            </View>
            <BalanceCard />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              {transactions.length > 5 && (
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        renderItem={({ item }) => <TransactionRow item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={56} color="#D5D8DC" />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to add your first one</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add')}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A2E' },
  card: {
    margin: 16,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    padding: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4 },
  balanceAmount: { fontSize: 36, fontWeight: '800', marginBottom: 20 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardStat: { flex: 1, alignItems: 'center', gap: 4 },
  cardStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  cardStatAmount: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  seeAll: { fontSize: 13, color: PURPLE, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowText: { flex: 1 },
  rowCategory: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  rowNote: { fontSize: 12, color: '#7F8C8D', marginTop: 1 },
  rowDate: { fontSize: 11, color: '#AEB6BF', marginTop: 2 },
  rowAmount: { fontSize: 15, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#7F8C8D' },
  emptySubtitle: { fontSize: 13, color: '#AEB6BF' },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
});
