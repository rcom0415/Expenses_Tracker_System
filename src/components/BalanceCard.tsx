import React from 'react';
import { Wallet, TrendingDown, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

interface BalanceCardProps {
  currentBalance: number;
  initialBalance: number;
  totalExpenses: number;
  totalIncome: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  currentBalance,
  initialBalance,
  totalExpenses,
  totalIncome
}) => {
  const balanceColor = currentBalance > 0 ? 'text-green-600' : 'text-red-600';
  const balanceIcon = currentBalance > 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Wallet className="w-6 h-6 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-600">Current Balance</span>
          </div>
          <p className={`text-2xl font-bold ${balanceColor}`}>
            {formatCurrency(currentBalance)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-6 h-6 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-600">Initial Balance</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(initialBalance)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="w-6 h-6 text-red-500 mr-2" />
            <span className="text-sm font-medium text-gray-600">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-600">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </p>
        </div>
      </div>
    </div>
  );
};