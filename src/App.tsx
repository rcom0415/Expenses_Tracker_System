import React, { useState, useEffect } from 'react';
import { Expense, AppState } from './types';
import { saveToStorage, loadFromStorage } from './utils/storage';
import { InitialBalanceSetup } from './components/InitialBalanceSetup';
import { BalanceCard } from './components/BalanceCard';
import { AddExpenseForm } from './components/AddExpenseForm';
import { AddIncomeForm } from './components/AddIncomeForm';
import { TransactionsList } from './components/TransactionsList';
import { ExpenseBreakdown } from './components/ExpenseBreakdown';
import { Settings, RotateCcw } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState<AppState>({
    initialBalance: 0,
    currentBalance: 0,
    expenses: []
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown'>('overview');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      setAppState(savedData);
      setIsInitialized(true);
    }
  }, []);

  // Save data to localStorage whenever appState changes
  useEffect(() => {
    if (isInitialized) {
      saveToStorage(appState);
    }
  }, [appState, isInitialized]);

  const handleSetInitialBalance = (balance: number) => {
    const newState = {
      initialBalance: balance,
      currentBalance: balance,
      expenses: []
    };
    setAppState(newState);
    setIsInitialized(true);
  };

  const handleAddExpense = (label: string, amount: number) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      label,
      amount,
      date: new Date(),
      type: 'expense'
    };

    setAppState(prev => ({
      ...prev,
      currentBalance: prev.currentBalance - amount,
      expenses: [newExpense, ...prev.expenses]
    }));
  };

  const handleAddIncome = (label: string, amount: number) => {
    const newIncome: Expense = {
      id: Date.now().toString(),
      label,
      amount,
      date: new Date(),
      type: 'income'
    };

    setAppState(prev => ({
      ...prev,
      currentBalance: prev.currentBalance + amount,
      expenses: [newIncome, ...prev.expenses]
    }));
  };

  const handleDeleteExpense = (id: string) => {
    const expense = appState.expenses.find(e => e.id === id);
    if (expense) {
      setAppState(prev => ({
        ...prev,
        currentBalance: expense.type === 'expense' 
          ? prev.currentBalance + expense.amount 
          : prev.currentBalance - expense.amount,
        expenses: prev.expenses.filter(e => e.id !== id)
      }));
    }
  };

  const handleReset = () => {
    setAppState({
      initialBalance: 0,
      currentBalance: 0,
      expenses: []
    });
    setIsInitialized(false);
    setShowResetConfirm(false);
  };

  const totalExpenses = appState.expenses
    .filter(expense => expense.type === 'expense')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalIncome = appState.expenses
    .filter(expense => expense.type === 'income')
    .reduce((sum, expense) => sum + expense.amount, 0);

  if (!isInitialized) {
    return <InitialBalanceSetup onSetBalance={handleSetInitialBalance} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Expenses Tracker
          </h1>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
        </div>

        {/* Balance Card */}
        <div className="mb-8">
          <BalanceCard
            currentBalance={appState.currentBalance}
            initialBalance={appState.initialBalance}
            totalExpenses={totalExpenses}
            totalIncome={totalIncome}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/50 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'breakdown'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Breakdown
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <AddExpenseForm
              onAddExpense={handleAddExpense}
              currentBalance={appState.currentBalance}
            />
            <AddIncomeForm
              onAddIncome={handleAddIncome}
            />
            <TransactionsList
              expenses={appState.expenses}
              onDeleteExpense={handleDeleteExpense}
            />
          </div>
        ) : (
          <ExpenseBreakdown 
            expenses={appState.expenses}
            initialBalance={appState.initialBalance}
            currentBalance={appState.currentBalance}
          />
        )}

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Reset All Data?
              </h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all your expenses and reset your balance. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;