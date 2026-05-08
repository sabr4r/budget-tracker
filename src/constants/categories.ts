import { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Drink', icon: 'fast-food', color: '#FF6B6B', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#4ECDC4', type: 'expense' },
  { id: 'housing', name: 'Housing', icon: 'home', color: '#45B7D1', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'medkit', color: '#96CEB4', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'bag', color: '#FFEAA7', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller', color: '#DDA0DD', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'school', color: '#98D8C8', type: 'expense' },
  { id: 'utilities', name: 'Utilities', icon: 'flash', color: '#F7DC6F', type: 'expense' },
  { id: 'personal', name: 'Personal Care', icon: 'person', color: '#BB8FCE', type: 'expense' },
  { id: 'other_expense', name: 'Other', icon: 'ellipsis-horizontal', color: '#AEB6BF', type: 'expense' },
  { id: 'salary', name: 'Salary', icon: 'briefcase', color: '#2ECC71', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#27AE60', type: 'income' },
  { id: 'other_income', name: 'Other Income', icon: 'cash', color: '#1ABC9C', type: 'income' },
];

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id);

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type === 'expense');
export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.type === 'income');
