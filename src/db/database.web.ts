import { Transaction } from '../types';

const TRANSACTIONS_KEY = 'budget_transactions';
const SETTINGS_KEY = 'budget_settings';

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTransactions(txs: Transaction[]): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
}

function loadSettings(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSettings(settings: Record<string, string>): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function getSetting(key: string): Promise<string | null> {
  return loadSettings()[key] ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const settings = loadSettings();
  settings[key] = value;
  saveSettings(settings);
}

export async function insertTransaction(tx: Transaction): Promise<void> {
  const txs = loadTransactions();
  txs.push(tx);
  saveTransactions(txs);
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  const txs = loadTransactions().map((t) => (t.id === tx.id ? tx : t));
  saveTransactions(txs);
}

export async function deleteTransaction(id: string): Promise<void> {
  saveTransactions(loadTransactions().filter((t) => t.id !== id));
}

export async function fetchTransactionsByMonth(month: string): Promise<Transaction[]> {
  return loadTransactions()
    .filter((t) => t.date.startsWith(month))
    .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
}

export async function fetchRecentTransactions(limit: number): Promise<Transaction[]> {
  return loadTransactions()
    .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt))
    .slice(0, limit);
}

export async function clearAllTransactions(): Promise<void> {
  localStorage.removeItem(TRANSACTIONS_KEY);
}
