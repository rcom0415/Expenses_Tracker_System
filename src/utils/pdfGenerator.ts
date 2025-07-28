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
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Calculate totals at the top level for use in all functions
  const expenseTransactions = expenses.filter(exp => exp.type === 'expense');
  const incomeTransactions = expenses.filter(exp => exp.type === 'income');
  const totalExpensesOnly = expenseTransactions.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncomeOnly = incomeTransactions.reduce((sum, expense) => sum + expense.amount, 0);

  // Colors
  const primaryColor = [41, 128, 185];
  const secondaryColor = [52, 73, 94];
  const accentColor = [231, 76, 60];
  const successColor = [39, 174, 96];
  const lightGray = [236, 240, 241];
  const darkGray = [44, 62, 80];

  // Header Section
  const addHeader = () => {
    // Header background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPENSE REPORT', pageWidth / 2, 20, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generated on ${reportDate}`, pageWidth / 2, 28, { align: 'center' });

    yPosition = 45;
  };

  // Financial Summary Section
  const addFinancialSummary = () => {
    // Section title
    doc.setTextColor(...darkGray);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FINANCIAL SUMMARY', 20, yPosition);
    yPosition += 10;

    const remainingBalance = currentBalance;
    const spentPercentage = initialBalance > 0 ? ((totalExpensesOnly / initialBalance) * 100).toFixed(1) : '0';

    // Summary data for table
    const summaryData = [
      ['Initial Balance', formatCurrency(initialBalance), ''],
      ['Total Income', formatCurrency(totalIncomeOnly), `${incomeTransactions.length} transactions`],
      ['Total Expenses', formatCurrency(totalExpensesOnly), `${spentPercentage}% of initial`],
      ['Current Balance', formatCurrency(remainingBalance), remainingBalance >= 0 ? 'Positive' : 'Negative'],
      ['Total Transactions', expenses.length.toString(), 'Count']
    ];

    // Summary table
    autoTable(doc, {
      body: summaryData,
      startY: yPosition,
      theme: 'grid',
      styles: {
        fontSize: 11,
        cellPadding: 8,
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { 
          cellWidth: 60, 
          fontStyle: 'bold',
          fillColor: lightGray,
          textColor: darkGray
        },
        1: { 
          cellWidth: 50, 
          halign: 'right',
          fontStyle: 'bold',
          textColor: [0, 0, 0]
        },
        2: { 
          cellWidth: 60, 
          halign: 'center',
          textColor: [100, 100, 100],
          fontSize: 9
        }
      },
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  };

  // Expense Details Section
  const addExpenseDetails = () => {
    if (expenses.length === 0) {
      // No expenses message
      doc.setFillColor(...lightGray);
      doc.rect(20, yPosition, pageWidth - 40, 40, 'F');
      
      doc.setTextColor(...darkGray);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'italic');
      doc.text('No expenses recorded yet', pageWidth / 2, yPosition + 25, { align: 'center' });
      return;
    }

    // Section title
    doc.setTextColor(...darkGray);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPENSE DETAILS', 20, yPosition);
    yPosition += 10;

    // Sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Prepare table data
    const tableData = sortedExpenses.map((expense, index) => [
      (index + 1).toString(),
      formatDate(expense.date),
      `${expense.label} (${expense.type === 'income' ? 'Income' : 'Expense'})`,
      `${expense.type === 'income' ? '+' : '-'}${formatCurrency(expense.amount)}`
    ]);

    // Expenses table
    autoTable(doc, {
      head: [['#', 'Date & Time', 'Description', 'Amount']],
      body: tableData,
      startY: yPosition,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { 
          cellWidth: 15, 
          halign: 'center',
          fontStyle: 'bold'
        },
        1: { 
          cellWidth: 50, 
          halign: 'center',
          fontSize: 9
        },
        2: { 
          cellWidth: 80, 
          halign: 'left'
        },
        3: { 
          cellWidth: 35, 
          halign: 'right',
          fontStyle: 'bold',
        }
      },
      margin: { left: 20, right: 20 },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.3
      }
    });

    // Total expenses summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const netAmount = totalIncomeOnly - totalExpensesOnly;

    // Net amount box
    doc.setFillColor(...(netAmount >= 0 ? successColor : accentColor));
    doc.rect(pageWidth - 90, finalY, 70, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NET:', pageWidth - 85, finalY + 6);
    doc.text(`${netAmount >= 0 ? '+' : ''}${formatCurrency(Math.abs(netAmount))}`, pageWidth - 25, finalY + 10, { align: 'right' });

    yPosition = finalY + 25;
  };

  // Footer
  const addFooter = () => {
    const footerY = doc.internal.pageSize.height - 20;
    
    // Footer line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    
    // Footer text
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Expenses Tracker App', 20, footerY);
    doc.text(new Date().toLocaleString('en-IN'), pageWidth / 2, footerY, { align: 'center' });
    doc.text('Page 1', pageWidth - 20, footerY, { align: 'right' });
  };

  // Generate the complete report
  addHeader();
  addFinancialSummary();
  addExpenseDetails();
  addFooter();

  // Generate filename
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const filename = `expense-report-${dateStr}.pdf`;

  // Save the PDF
  doc.save(filename);

  return {
    success: true,
    filename,
    totalExpenses: totalExpensesOnly,
    totalIncome: totalIncomeOnly,
    transactionCount: expenses.length
  };
};