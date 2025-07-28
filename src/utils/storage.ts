import { AppState } from '../types';

const STORAGE_KEY = 'expenses-tracker-data';

export const saveToStorage = (data: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromStorage = (): AppState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      parsed.expenses = parsed.expenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
        type: expense.type || 'expense' // Default to expense for backward compatibility
      }));
      return parsed;
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return null;
};