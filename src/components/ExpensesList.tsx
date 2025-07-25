import React from 'react';
import { Trash2, Calendar, Tag } from 'lucide-react';
import { Expense } from '../types';
import { formatDate, formatCurrency } from '../utils/dateUtils';

interface ExpensesListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({
  expenses,
  onDeleteExpense
}) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 text-center">
        <p className="text-gray-500 text-lg">No expenses added yet</p>
        <p className="text-gray-400 text-sm mt-2">Add your first expense to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
        Recent Expenses
      </h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Tag className="w-4 h-4 text-gray-500 mr-2" />
                <span className="font-medium text-gray-800">{expense.label}</span>
              </div>
              <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-red-600">
                -{formatCurrency(expense.amount)}
              </span>
              <button
                onClick={() => onDeleteExpense(expense.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};