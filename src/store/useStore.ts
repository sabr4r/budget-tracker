import { create } from 'zustand';
import { Currency, Transaction, CategoryBreakdown } from '../types';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import {
  getSetting,
  setSetting,
  insertTransaction,
  updateTransaction,
  deleteTransaction,
  fetchTransactionsByMonth,
  fetchRecentTransactions,
} from '../db/database';

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function computeSummary(transactions: Transaction[]) {
  let totalIncome = 0;
  let totalExpenses = 0;
  const byCat: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      byCat[tx.categoryId] = (byCat[tx.categoryId] ?? 0) + tx.amount;
    }
  }

  const breakdown: CategoryBreakdown[] = Object.entries(byCat)
    .map(([categoryId, total]) => ({
      categoryId,
      total,
      percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, breakdown };
}

type Store = {
  initialized: boolean;
  currency: Currency;
  setCurrency: (c: Currency) => Promise<void>;

  selectedMonth: string;
  setSelectedMonth: (m: string) => void;

  transactions: Transaction[];
  recentTransactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  breakdown: CategoryBreakdown[];

  init: () => Promise<void>;
  loadMonth: (month: string) => Promise<void>;
  loadRecent: () => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  editTransaction: (tx: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
};

export const useStore = create<Store>((set, get) => ({
  initialized: false,
  currency: DEFAULT_CURRENCY,
  selectedMonth: currentMonth(),
  transactions: [],
  recentTransactions: [],
  totalIncome: 0,
  totalExpenses: 0,
  netBalance: 0,
  breakdown: [],

  init: async () => {
    const raw = await getSetting('currency');
    const currency = raw ? (JSON.parse(raw) as Currency) : DEFAULT_CURRENCY;
    const month = currentMonth();
    const transactions = await fetchTransactionsByMonth(month);
    const recentTransactions = await fetchRecentTransactions(5);
    const summary = computeSummary(transactions);
    set({ initialized: true, currency, transactions, recentTransactions, ...summary });
  },

  setCurrency: async (c) => {
    await setSetting('currency', JSON.stringify(c));
    set({ currency: c });
  },

  setSelectedMonth: (m) => {
    set({ selectedMonth: m });
    get().loadMonth(m);
  },

  loadMonth: async (month) => {
    const transactions = await fetchTransactionsByMonth(month);
    const summary = computeSummary(transactions);
    set({ transactions, ...summary });
  },

  loadRecent: async () => {
    const recentTransactions = await fetchRecentTransactions(5);
    set({ recentTransactions });
  },

  addTransaction: async (tx) => {
    await insertTransaction(tx);
    await get().loadMonth(get().selectedMonth);
    await get().loadRecent();
  },

  editTransaction: async (tx) => {
    await updateTransaction(tx);
    await get().loadMonth(get().selectedMonth);
    await get().loadRecent();
  },

  removeTransaction: async (id) => {
    await deleteTransaction(id);
    await get().loadMonth(get().selectedMonth);
    await get().loadRecent();
  },
}));
