export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number; // stored in cents
  categoryId: string;
  note: string;
  date: string; // ISO 8601 "YYYY-MM-DD"
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export type CategoryBreakdown = {
  categoryId: string;
  total: number;
  percentage: number;
};
