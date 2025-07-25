import React, { useState } from 'react';
import { Plus, Tag, DollarSign } from 'lucide-react';

interface AddExpenseFormProps {
  onAddExpense: (label: string, amount: number) => void;
  currentBalance: number;
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  onAddExpense,
  currentBalance
}) => {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!label.trim()) {
      setError('Please enter an expense label');
      return;
    }
    
    const expenseAmount = parseFloat(amount);
    if (!expenseAmount || expenseAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (expenseAmount > currentBalance) {
      setError('Insufficient balance for this expense');
      return;
    }

    onAddExpense(label.trim(), expenseAmount);
    setLabel('');
    setAmount('');
    setError('');
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Plus className="w-5 h-5 mr-2 text-blue-500" />
        Add New Expense
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Expense Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Lunch, Groceries, Transport"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Amount (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-[0.98] transition-all duration-200 shadow-lg"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};