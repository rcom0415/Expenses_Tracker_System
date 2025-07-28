export interface Expense {
  id: string;
  label: string;
  amount: number;
  date: Date;
  category?: string;
  type: 'expense' | 'income';
}

export interface AppState {
  initialBalance: number;
  currentBalance: number;
  expenses: Expense[];
}