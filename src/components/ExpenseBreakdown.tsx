import React, { useMemo } from 'react';
import { Calendar, TrendingUp, BarChart3, Download } from 'lucide-react';
import { Expense } from '../types';
import { getWeekStart, getMonthStart, formatCurrency } from '../utils/dateUtils';
import { generateExpenseReport } from '../utils/pdfGenerator';

interface ExpenseBreakdownProps {
  expenses: Expense[];
  initialBalance: number;
  currentBalance: number;
}

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({ 
  expenses, 
  initialBalance, 
  currentBalance 
}) => {
  const breakdown = useMemo(() => {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const monthStart = getMonthStart(now);

    const weeklyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= weekStart;
    });
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart;
    });

    const weeklyTotal = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Group by categories for better visualization
    const weeklyByCategory = weeklyExpenses.reduce((acc, expense) => {
      const category = expense.label.toLowerCase();
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const monthlyByCategory = monthlyExpenses.reduce((acc, expense) => {
      const category = expense.label.toLowerCase();
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      weekly: {
        total: weeklyTotal,
        count: weeklyExpenses.length,
        categories: weeklyByCategory
      },
      monthly: {
        total: monthlyTotal,
        count: monthlyExpenses.length,
        categories: monthlyByCategory
      }
    };
  }, [expenses]);

  const handleDownloadPDF = () => {
    generateExpenseReport(expenses, initialBalance, currentBalance);
  };

  const CategoryBreakdown: React.FC<{ categories: Record<string, number>; total: number }> = ({ categories, total }) => {
    const sortedCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Show top 5 categories

    if (sortedCategories.length === 0) {
      return <p className="text-gray-500 text-sm">No expenses in this period</p>;
    }

    return (
      <div className="space-y-2">
        {sortedCategories.map(([category, amount]) => {
          const percentage = total > 0 ? (amount / total) * 100 : 0;
          return (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <span className="text-sm text-gray-600 capitalize w-24 truncate">
                  {category}
                </span>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-800 ml-2">
                {formatCurrency(amount)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Download Button */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF Report
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Breakdown */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-500" />
          This Week
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total Spent</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(breakdown.weekly.total)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Transactions</span>
            <span className="text-sm text-gray-800">{breakdown.weekly.count}</span>
          </div>
        </div>

        <CategoryBreakdown 
          categories={breakdown.weekly.categories} 
          total={breakdown.weekly.total} 
        />
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
          This Month
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total Spent</span>
            <span className="font-semibold text-purple-600">
              {formatCurrency(breakdown.monthly.total)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Transactions</span>
            <span className="text-sm text-gray-800">{breakdown.monthly.count}</span>
          </div>
        </div>

        <CategoryBreakdown 
          categories={breakdown.monthly.categories} 
          total={breakdown.monthly.total} 
        />
      </div>
      </div>
    </div>
  );
};