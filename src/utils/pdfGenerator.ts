import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense } from '../types';
import { formatCurrency, formatDate } from './dateUtils';

interface ReportOptions {
  includeCharts?: boolean;
  groupByCategory?: boolean;
  dateRange?: { start: Date; end: Date };
  customTitle?: string;
  companyInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

interface CategorySummary {
  category: string;
  count: number;
  total: number;
  percentage: number;
}

export const generateExpenseReport = (
  expenses: Expense[],
  initialBalance: number,
  currentBalance: number,
  options: ReportOptions = {}
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Enhanced color palette
  const colors = {
    primary: [59, 130, 246],      // Blue
    secondary: [107, 114, 128],   // Gray
    accent: [16, 185, 129],       // Green
    danger: [239, 68, 68],        // Red
    warning: [245, 158, 11],      // Amber
    purple: [139, 92, 246],       // Purple
    background: [248, 250, 252],  // Light gray
    dark: [17, 24, 39],          // Dark gray
    white: [255, 255, 255]
  };
  
  let currentPage = 1;
  let yPosition = 0;
  
  // Filter expenses by date range if provided
  let filteredExpenses = expenses;
  if (options.dateRange) {
    filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= options.dateRange!.start && expenseDate <= options.dateRange!.end;
    });
  }
  
  // Utility function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      currentPage++;
      yPosition = 20;
      addPageHeader();
    }
  };
  
  // Enhanced header function
  const addPageHeader = () => {
    if (currentPage > 1) {
      // Add header for subsequent pages
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(...colors.white);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('EXPENSE REPORT (CONTINUED)', pageWidth / 2, 15, { align: 'center' });
      
      yPosition = 35;
    }
  };
  
  // Enhanced header section
  const addMainHeader = () => {
    // Gradient-like effect with multiple rectangles
    for (let i = 0; i < 5; i++) {
      const alpha = 1 - (i * 0.1);
      doc.setFillColor(59 + i * 5, 130 + i * 5, 246 - i * 10);
      doc.rect(0, i * 2, pageWidth, 8, 'F');
    }
    
    // Company info section if provided
    if (options.companyInfo) {
      doc.setTextColor(...colors.white);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(options.companyInfo.name, 15, 15);
      if (options.companyInfo.address) {
        doc.text(options.companyInfo.address, 15, 22);
      }
    }
    
    // Main title
    doc.setTextColor(...colors.white);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    const title = options.customTitle || 'EXPENSE REPORT';
    doc.text(title, pageWidth / 2, 25, { align: 'center' });
    
    // Enhanced subtitle with more details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
    doc.text(`Generated on ${reportDate}`, pageWidth / 2, 33, { align: 'center' });
    
    yPosition = 50;
  };
  
  // Enhanced summary section with visual improvements
  const addFinancialSummary = () => {
    checkPageBreak(60);
    
    // Section header with icon-like decoration
    doc.setFillColor(...colors.primary);
    doc.rect(15, yPosition - 5, 5, 20, 'F');
    
    doc.setTextColor(...colors.primary);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FINANCIAL SUMMARY', 25, yPosition + 5);
    
    yPosition += 15;
    
    // Enhanced summary box with shadow effect
    doc.setFillColor(240, 240, 240);
    doc.rect(22, yPosition + 2, pageWidth - 42, 42, 'F'); // Shadow
    doc.setFillColor(...colors.white);
    doc.rect(20, yPosition, pageWidth - 40, 40, 'F');
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(1);
    doc.rect(20, yPosition, pageWidth - 40, 40);
    
    yPosition += 12;
    
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netChange = currentBalance - initialBalance;
    const savingsRate = initialBalance > 0 ? ((currentBalance / initialBalance) * 100).toFixed(1) : '0';
    const avgPerTransaction = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
    
    // Left column
    doc.setTextColor(...colors.secondary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const leftLabels = ['Initial Balance:', 'Current Balance:', 'Net Change:', 'Total Expenses:'];
    const leftValues = [
      formatCurrency(initialBalance),
      formatCurrency(currentBalance),
      formatCurrency(netChange),
      formatCurrency(totalExpenses)
    ];
    
    leftLabels.forEach((label, index) => {
      doc.text(label, 25, yPosition + (index * 6));
    });
    
    // Left values with color coding
    doc.setFont('helvetica', 'bold');
    leftValues.forEach((value, index) => {
      let color = colors.dark;
      if (index === 1) color = currentBalance >= 0 ? colors.accent : colors.danger;
      if (index === 2) color = netChange >= 0 ? colors.accent : colors.danger;
      if (index === 3) color = colors.danger;
      
      doc.setTextColor(...color);
      doc.text(value, 85, yPosition + (index * 6));
    });
    
    // Right column
    doc.setTextColor(...colors.secondary);
    doc.setFont('helvetica', 'normal');
    
    const rightLabels = ['Transactions:', 'Avg per Transaction:', 'Savings Rate:', 'Report Period:'];
    const rightValues = [
      filteredExpenses.length.toString(),
      formatCurrency(avgPerTransaction),
      `${savingsRate}%`,
      getDateRange()
    ];
    
    rightLabels.forEach((label, index) => {
      doc.text(label, 115, yPosition + (index * 6));
    });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.dark);
    rightValues.forEach((value, index) => {
      doc.text(value, 175, yPosition + (index * 6));
    });
    
    yPosition += 35;
  };
  
  // Category analysis section
  const addCategoryAnalysis = () => {
    if (filteredExpenses.length === 0) return;
    
    checkPageBreak(80);
    
    // Calculate category summaries
    const categoryMap = new Map<string, { count: number; total: number }>();
    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      const existing = categoryMap.get(category) || { count: 0, total: 0 };
      categoryMap.set(category, {
        count: existing.count + 1,
        total: existing.total + expense.amount
      });
    });
    
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categories: CategorySummary[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      total: data.total,
      percentage: (data.total / totalAmount) * 100
    })).sort((a, b) => b.total - a.total);
    
    if (categories.length > 1) {
      // Section header
      doc.setFillColor(...colors.purple);
      doc.rect(15, yPosition - 5, 5, 20, 'F');
      
      doc.setTextColor(...colors.purple);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('CATEGORY BREAKDOWN', 25, yPosition + 5);
      
      yPosition += 20;
      
      // Category table
      const categoryTableData = categories.map((cat, index) => [
        (index + 1).toString(),
        cat.category,
        cat.count.toString(),
        formatCurrency(cat.total),
        `${cat.percentage.toFixed(1)}%`
      ]);
      
      autoTable(doc, {
        head: [['#', 'Category', 'Count', 'Amount', '%']],
        body: categoryTableData,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: colors.purple,
          textColor: colors.white,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: colors.dark
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 60, halign: 'left' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
          4: { cellWidth: 25, halign: 'center', textColor: colors.accent }
        },
        margin: { left: 20, right: 20 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
  };
  
  // Enhanced expense details table
  const addExpenseDetails = () => {
    if (filteredExpenses.length === 0) {
      addNoExpensesMessage();
      return;
    }
    
    checkPageBreak(60);
    
    // Section header
    doc.setFillColor(...colors.primary);
    doc.rect(15, yPosition - 5, 5, 20, 'F');
    
    doc.setTextColor(...colors.primary);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPENSE DETAILS', 25, yPosition + 5);
    
    yPosition += 20;
    
    // Sort expenses by date (newest first)
    const sortedExpenses = [...filteredExpenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const tableData = sortedExpenses.map((expense, index) => [
      (index + 1).toString(),
      formatDate(expense.date),
      expense.category || 'General',
      expense.label || 'No description',
      formatCurrency(expense.amount)
    ]);
    
    autoTable(doc, {
      head: [['#', 'Date & Time', 'Category', 'Description', 'Amount']],
      body: tableData,
      startY: yPosition,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: colors.white,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: colors.dark,
        lineColor: colors.secondary,
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: colors.background
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 40, halign: 'center', fontSize: 8 },
        2: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: colors.purple },
        3: { cellWidth: 70, halign: 'left' },
        4: { cellWidth: 30, halign: 'right', textColor: colors.danger, fontStyle: 'bold' }
      },
      margin: { left: 20, right: 20 },
      tableLineColor: colors.primary,
      tableLineWidth: 0.1,
      showHead: 'everyPage'
    });
    
    // Enhanced total section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    yPosition = finalY;
    
    checkPageBreak(25);
    
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Total box
    doc.setFillColor(...colors.danger);
    doc.rect(pageWidth - 90, yPosition - 5, 70, 15, 'F');
    
    doc.setTextColor(...colors.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL EXPENSES:', pageWidth - 85, yPosition + 2);
    
    doc.setFontSize(13);
    doc.text(formatCurrency(totalExpenses), pageWidth - 25, yPosition + 7, { align: 'right' });
    
    yPosition += 25;
  };
  
  // No expenses message
  const addNoExpensesMessage = () => {
    checkPageBreak(60);
    
    doc.setFillColor(...colors.background);
    doc.rect(20, yPosition, pageWidth - 40, 50, 'F');
    doc.setDrawColor(...colors.secondary);
    doc.setLineWidth(1);
    doc.rect(20, yPosition, pageWidth - 40, 50);
    
    doc.setTextColor(...colors.secondary);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'italic');
    doc.text('📊 No expenses recorded', pageWidth / 2, yPosition + 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Start adding expenses to see detailed reports here.', pageWidth / 2, yPosition + 35, { align: 'center' });
  };
  
  // Enhanced footer
  const addFooter = () => {
    const footerY = pageHeight - 20;
    
    // Footer line
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(1);
    doc.line(20, footerY - 8, pageWidth - 20, footerY - 8);
    
    // Footer content
    doc.setTextColor(...colors.secondary);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const footerLeft = options.companyInfo?.name || 'Expenses Tracker App';
    doc.text(`Generated by ${footerLeft}`, 20, footerY);
    
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    doc.text(timestamp, pageWidth / 2, footerY, { align: 'center' });
    
    doc.text(`Page ${currentPage}`, pageWidth - 20, footerY, { align: 'right' });
  };
  
  // Helper function to get date range
  const getDateRange = (): string => {
    if (filteredExpenses.length === 0) return 'No expenses';
    
    if (options.dateRange) {
      const start = options.dateRange.start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const end = options.dateRange.end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      return `${start} - ${end}`;
    }
    
    const sortedExpenses = [...filteredExpenses].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const startDate = new Date(sortedExpenses[0].date).toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short' 
    });
    const endDate = new Date(sortedExpenses[sortedExpenses.length - 1].date).toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short' 
    });
    return `${startDate} - ${endDate}`;
  };
  
  // Generate the report
  addMainHeader();
  addFinancialSummary();
  
  if (options.groupByCategory) {
    addCategoryAnalysis();
  }
  
  addExpenseDetails();
  addFooter();
  
  // Generate filename with better naming
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  const timeStr = today.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
  
  let filename = `expense-report-${dateStr}`;
  if (options.dateRange) {
    const startStr = options.dateRange.start.toISOString().split('T')[0];
    const endStr = options.dateRange.end.toISOString().split('T')[0];
    filename = `expense-report-${startStr}_to_${endStr}`;
  }
  filename += `_${timeStr}.pdf`;
  
  doc.save(filename);
  
  return {
    success: true,
    filename,
    totalExpenses: filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    transactionCount: filteredExpenses.length,
    dateRange: getDateRange()
  };
};