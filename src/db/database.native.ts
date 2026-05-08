import * as SQLite from 'expo-sqlite';
import { Transaction } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('budget.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        categoryId TEXT NOT NULL,
        note TEXT DEFAULT '',
        date TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  }
  return db;
}

export async function getSetting(key: string): Promise<string | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key=?',
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

export async function insertTransaction(tx: Transaction): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO transactions (id, type, amount, categoryId, note, date, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tx.id, tx.type, tx.amount, tx.categoryId, tx.note, tx.date, tx.createdAt]
  );
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `UPDATE transactions SET type=?, amount=?, categoryId=?, note=?, date=? WHERE id=?`,
    [tx.type, tx.amount, tx.categoryId, tx.note, tx.date, tx.id]
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM transactions WHERE id=?`, [id]);
}

export async function fetchTransactionsByMonth(month: string): Promise<Transaction[]> {
  const database = await getDb();
  return database.getAllAsync<Transaction>(
    `SELECT * FROM transactions WHERE date LIKE ? ORDER BY date DESC, createdAt DESC`,
    [`${month}%`]
  );
}

export async function fetchRecentTransactions(limit: number): Promise<Transaction[]> {
  const database = await getDb();
  return database.getAllAsync<Transaction>(
    `SELECT * FROM transactions ORDER BY date DESC, createdAt DESC LIMIT ?`,
    [limit]
  );
}

export async function clearAllTransactions(): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM transactions`);
}
