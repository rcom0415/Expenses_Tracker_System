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
  const pageHeight = doc.internal.pageSize.height;
  
  // Colors
  const primaryColor = [59, 130, 246]; // Blue
  const secondaryColor = [107, 114, 128]; // Gray
  const accentColor = [16, 185, 129]; // Green
  const dangerColor = [239, 68, 68]; // Red
  
  // Header Section
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
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, pageWidth / 2, 28, { align: 'center' });
  
  // Summary Section
  let yPosition = 50;
  
  // Summary Header
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIAL SUMMARY', 20, yPosition);
  
  // Summary Box
  yPosition += 5;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(20, yPosition, pageWidth - 40, 35);
  
  // Summary Content
  yPosition += 10;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const savingsRate = initialBalance > 0 ? ((currentBalance / initialBalance) * 100).toFixed(1) : '0';
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Left Column
  doc.text('Initial Balance:', 25, yPosition);
  doc.text('Current Balance:', 25, yPosition + 7);
  doc.text('Total Expenses:', 25, yPosition + 14);
  doc.text('Transactions:', 25, yPosition + 21);
  
  // Right Column - Values
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(formatCurrency(initialBalance), 80, yPosition);
  
  // Color code current balance
  if (currentBalance >= 0) {
    doc.setTextColor(...accentColor);
  } else {
    doc.setTextColor(...dangerColor);
  }
  doc.text(formatCurrency(currentBalance), 80, yPosition + 7);
  
  doc.setTextColor(...dangerColor);
  doc.text(formatCurrency(totalExpenses), 80, yPosition + 14);
  
  doc.setTextColor(40, 40, 40);
  doc.text(expenses.length.toString(), 80, yPosition + 21);
  
  // Additional Stats - Right Side
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Savings Rate:', 120, yPosition);
  doc.text('Avg. per Transaction:', 120, yPosition + 7);
  doc.text('Report Period:', 120, yPosition + 14);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(`${savingsRate}%`, 170, yPosition);
  doc.text(expenses.length > 0 ? formatCurrency(totalExpenses / expenses.length) : '₹0.00', 170, yPosition + 7);
  
  // Calculate date range
  if (expenses.length > 0) {
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const startDate = new Date(sortedExpenses[0].date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const endDate = new Date(sortedExpenses[sortedExpenses.length - 1].date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    doc.text(`${startDate} - ${endDate}`, 170, yPosition + 14);
  } else {
    doc.text('No expenses', 170, yPosition + 14);
  }
  
  // Expenses Table
  yPosition += 45;
  
  if (expenses.length > 0) {
    // Table Header
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPENSE DETAILS', 20, yPosition);
    
    yPosition += 10;
    
    // Sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const tableData = sortedExpenses.map((expense, index) => [
      (index + 1).toString(),
      formatDate(expense.date),
      expense.label,
      formatCurrency(expense.amount)
    ]);
    
    autoTable(doc, {
      head: [['#', 'Date & Time', 'Description', 'Amount']],
      body: tableData,
      startY: yPosition,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [40, 40, 40]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 80, halign: 'left' },
        3: { cellWidth: 35, halign: 'right', textColor: dangerColor, fontStyle: 'bold' }
      },
      margin: { left: 20, right: 20 },
      tableLineColor: primaryColor,
      tableLineWidth: 0.1
    });
    
    // Total Row
    const finalY = (doc as any).lastAutoTable.finalY + 5;
    
    if (finalY < pageHeight - 30) {
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(1);
      doc.line(20, finalY, pageWidth - 20, finalY);
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL EXPENSES:', pageWidth - 75, finalY + 8);
      
      doc.setTextColor(...dangerColor);
      doc.setFontSize(14);
      doc.text(formatCurrency(totalExpenses), pageWidth - 20, finalY + 8, { align: 'right' });
    }
  } else {
    // No expenses message
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'italic');
    doc.text('No expenses recorded yet.', pageWidth / 2, yPosition + 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.text('Start adding expenses to see detailed reports here.', pageWidth / 2, yPosition + 35, { align: 'center' });
  }
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by Expenses Tracker App', 20, footerY);
  doc.text(`Page 1 of 1`, pageWidth - 20, footerY, { align: 'right' });
  
  // Save with better filename
  const today = new Date();
  const filename = `expense-report-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.pdf`;
  doc.save(filename);
};