import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense } from '../types';
import { formatCurrency, formatDate } from './dateUtils';

export const generateExpenseReport = (
  expenses: Expense[],
  initialBalance: number,
  currentBalance: number
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Expense Report', 20, 20);
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 30);
  
  // Summary
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary', 20, 45);
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  doc.setFontSize(10);
  doc.text(`Initial Balance: ${formatCurrency(initialBalance)}`, 20, 55);
  doc.text(`Current Balance: ${formatCurrency(currentBalance)}`, 20, 62);
  doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 20, 69);
  doc.text(`Number of Transactions: ${expenses.length}`, 20, 76);
  
  // Expenses Table
  if (expenses.length > 0) {
    const tableData = expenses.map(expense => [
      formatDate(expense.date),
      expense.label,
      formatCurrency(expense.amount)
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Description', 'Amount']],
      body: tableData,
      startY: 85,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 80 },
        2: { cellWidth: 40, halign: 'right' }
      }
    });
  }
  
  // Save the PDF
  doc.save(`expense-report-${new Date().toISOString().split('T')[0]}.pdf`);
};