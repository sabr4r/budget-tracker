import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/useStore';
import { getCategoryById } from '../../src/constants/categories';
import { formatAmount, getMonthLabel, prevMonth, nextMonth, currentMonthString } from '../../src/utils/format';

const PURPLE = '#6C63FF';

function DonutChart({ breakdown, totalExpenses }: { breakdown: any[]; totalExpenses: number }) {
  const size = 160;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  if (totalExpenses === 0 || breakdown.length === 0) {
    return (
      <View style={[donutStyles.container, { width: size, height: size }]}>
        <View style={donutStyles.emptyCircle} />
        <View style={donutStyles.center}>
          <Text style={donutStyles.centerText}>No data</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={donutStyles.placeholder}>
      {breakdown.slice(0, 5).map((item, i) => {
        const cat = getCategoryById(item.categoryId);
        const barWidth = (item.percentage / 100) * 200;
        return (
          <View key={item.categoryId} style={donutStyles.barRow}>
            <View style={[donutStyles.barDot, { backgroundColor: cat?.color ?? '#ccc' }]} />
            <View style={{ flex: 1 }}>
              <View style={donutStyles.barLabelRow}>
                <Text style={donutStyles.barLabel}>{cat?.name ?? 'Other'}</Text>
                <Text style={donutStyles.barPct}>{item.percentage}%</Text>
              </View>
              <View style={donutStyles.barTrack}>
                <View style={[donutStyles.barFill, { width: `${item.percentage}%` as any, backgroundColor: cat?.color ?? '#ccc' }]} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const donutStyles = StyleSheet.create({
  container: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  emptyCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 16, borderColor: '#F0F0F0' },
  center: { position: 'absolute' },
  centerText: { fontSize: 12, color: '#AEB6BF' },
  placeholder: { width: '100%', gap: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barDot: { width: 10, height: 10, borderRadius: 5 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
  barPct: { fontSize: 13, color: '#7F8C8D' },
  barTrack: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
});

export default function SummaryScreen() {
  const currency = useStore((s) => s.currency);
  const totalIncome = useStore((s) => s.totalIncome);
  const totalExpenses = useStore((s) => s.totalExpenses);
  const netBalance = useStore((s) => s.netBalance);
  const breakdown = useStore((s) => s.breakdown);
  const selectedMonth = useStore((s) => s.selectedMonth);
  const setSelectedMonth = useStore((s) => s.setSelectedMonth);

  const isCurrentMonth = selectedMonth === currentMonthString();

  const top3 = breakdown.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Summary</Text>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => setSelectedMonth(prevMonth(selectedMonth))}>
            <Ionicons name="chevron-back" size={20} color={PURPLE} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{getMonthLabel(selectedMonth)}</Text>
          <TouchableOpacity
            onPress={() => !isCurrentMonth && setSelectedMonth(nextMonth(selectedMonth))}
            style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
          >
            <Ionicons name="chevron-forward" size={20} color={PURPLE} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Overview cards */}
        <View style={styles.overviewRow}>
          <View style={[styles.overviewCard, { borderLeftColor: '#2ECC71' }]}>
            <Text style={styles.overviewLabel}>Income</Text>
            <Text style={[styles.overviewAmount, { color: '#2ECC71' }]}>
              {formatAmount(totalIncome, currency.symbol)}
            </Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: '#E74C3C' }]}>
            <Text style={styles.overviewLabel}>Expenses</Text>
            <Text style={[styles.overviewAmount, { color: '#E74C3C' }]}>
              {formatAmount(totalExpenses, currency.symbol)}
            </Text>
          </View>
        </View>

        <View style={[styles.netCard, { backgroundColor: netBalance >= 0 ? '#EAFAF1' : '#FDEDEC' }]}>
          <Text style={styles.netLabel}>Net {netBalance >= 0 ? 'Savings' : 'Deficit'}</Text>
          <Text style={[styles.netAmount, { color: netBalance >= 0 ? '#2ECC71' : '#E74C3C' }]}>
            {netBalance < 0 ? '-' : '+'}{formatAmount(Math.abs(netBalance), currency.symbol)}
          </Text>
        </View>

        {/* Spending breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          {breakdown.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="pie-chart-outline" size={40} color="#D5D8DC" />
              <Text style={styles.emptyText}>No expenses this month</Text>
            </View>
          ) : (
            <>
              <DonutChart breakdown={breakdown} totalExpenses={totalExpenses} />
              <View style={styles.categoryList}>
                {breakdown.map((item) => {
                  const cat = getCategoryById(item.categoryId);
                  return (
                    <View key={item.categoryId} style={styles.catRow}>
                      <View style={[styles.catIcon, { backgroundColor: (cat?.color ?? '#ccc') + '22' }]}>
                        <Ionicons name={cat?.icon as any} size={16} color={cat?.color} />
                      </View>
                      <Text style={styles.catName}>{cat?.name ?? 'Other'}</Text>
                      <Text style={styles.catPct}>{item.percentage}%</Text>
                      <Text style={styles.catAmount}>
                        {formatAmount(item.total, currency.symbol)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  monthLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A2E', flex: 1, textAlign: 'center' },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  overviewRow: { flexDirection: 'row', gap: 12 },
  overviewCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewLabel: { fontSize: 12, color: '#7F8C8D', marginBottom: 4, fontWeight: '600' },
  overviewAmount: { fontSize: 18, fontWeight: '800' },
  netCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  netAmount: { fontSize: 20, fontWeight: '800' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 16 },
  emptySection: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 14, color: '#AEB6BF' },
  categoryList: { marginTop: 20, gap: 10 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  catName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  catPct: { fontSize: 12, color: '#7F8C8D', marginRight: 8 },
  catAmount: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
});
