import React, { useState } from 'react';
import { Wallet, ArrowRight } from 'lucide-react';

interface InitialBalanceSetupProps {
  onSetBalance: (balance: number) => void;
}

export const InitialBalanceSetup: React.FC<InitialBalanceSetupProps> = ({ onSetBalance }) => {
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const initialBalance = parseFloat(balance);
    if (!initialBalance || initialBalance <= 0) {
      setError('Please enter a valid initial balance');
      return;
    }

    onSetBalance(initialBalance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Expenses Tracker
          </h1>
          <p className="text-gray-600">
            Set your initial account balance to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Balance (₹)
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="10000.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-[0.98] transition-all duration-200 shadow-lg flex items-center justify-center"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
};