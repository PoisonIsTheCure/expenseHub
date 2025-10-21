import { Response } from 'express';
import { AuthRequest } from '../types';
import { Expense } from '../models/Expense';
import { Household } from '../models/Household';
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

// Type declaration for autoTable
interface jsPDFWithAutoTable {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

export const exportExpensesCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { householdId, startDate, endDate } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Build query
    const query: any = { ownerId: userId };
    
    if (householdId) {
      query.householdId = householdId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const expenses = await Expense.find(query)
      .populate('householdId', 'name')
      .populate('ownerId', 'name email')
      .populate('paidBy', 'name email')
      .sort({ date: -1 });

    // Create CSV content
    const csvHeaders = [
      'Date',
      'Description',
      'Category',
      'Amount',
      'Currency',
      'Household',
      'Paid By',
      'Split Method',
      'Attachments'
    ];

    const csvRows = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.description,
      expense.category,
      expense.amount.toFixed(2),
      expense.currency,
      expense.householdId ? (expense.householdId as any).name : 'Personal',
      (expense.paidBy as any)?.name || (expense.ownerId as any).name,
      expense.splitMethod,
      expense.attachments?.length || 0
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Set response headers
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvContent);
  } catch (error: any) {
    console.error('Error exporting expenses CSV:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const exportExpensesPDF = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { householdId, startDate, endDate } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Build query
    const query: any = { ownerId: userId };
    
    if (householdId) {
      query.householdId = householdId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const expenses = await Expense.find(query)
      .populate('householdId', 'name')
      .populate('ownerId', 'name email')
      .populate('paidBy', 'name email')
      .sort({ date: -1 });

    // Create PDF
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Expense Report', 14, 22);
    
    // Add date range info
    doc.setFontSize(10);
    const dateRange = startDate && endDate 
      ? `${new Date(startDate as string).toLocaleDateString()} - ${new Date(endDate as string).toLocaleDateString()}`
      : 'All Time';
    doc.text(`Date Range: ${dateRange}`, 14, 30);
    
    if (householdId) {
      const household = await Household.findById(householdId);
      doc.text(`Household: ${household?.name || 'Unknown'}`, 14, 35);
    }

    // Prepare table data
    const tableData = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.description,
      expense.category,
      `${expense.currency} ${expense.amount.toFixed(2)}`,
      expense.householdId ? (expense.householdId as any).name : 'Personal',
      (expense.paidBy as any)?.name || (expense.ownerId as any).name,
      expense.splitMethod,
      expense.attachments?.length || 0
    ]);

    // Add table
    (doc as jsPDFWithAutoTable).autoTable({
      head: [['Date', 'Description', 'Category', 'Amount', 'Household', 'Paid By', 'Split Method', 'Attachments']],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Light gray
      },
    });

    // Add summary
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    
    doc.setFontSize(12);
    doc.text(`Total Expenses: ${expenses[0]?.currency || 'EUR'} ${totalAmount.toFixed(2)}`, 14, finalY + 20);
    doc.text(`Total Records: ${expenses.length}`, 14, finalY + 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, finalY + 40);

    // Set response headers
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(doc.output('arraybuffer'));
  } catch (error: any) {
    console.error('Error exporting expenses PDF:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const exportHouseholdBudgetPDF = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { householdId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const household = await Household.findById(householdId).populate('members', 'name email');
    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    if (!household.members.some((member: any) => member._id.toString() === userId)) {
      res.status(403).json({ message: 'Not a member of this household' });
      return;
    }

    // Get current month's expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({
      householdId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate('ownerId', 'name email').populate('paidBy', 'name email');

    // Create PDF
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`${household.name} - Budget Report`, 14, 22);
    
    // Add month info
    doc.setFontSize(10);
    doc.text(`Month: ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 14, 30);

    // Budget summary
    const budget = household.budget || { monthlyLimit: 0, currency: 'EUR', contributions: [] };
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalContributions = budget.contributions.reduce((sum: number, contrib: any) => sum + contrib.amount, 0);
    const remaining = budget.monthlyLimit - totalSpent;

    doc.setFontSize(12);
    doc.text(`Monthly Limit: ${budget.currency} ${budget.monthlyLimit.toFixed(2)}`, 14, 45);
    doc.text(`Total Spent: ${budget.currency} ${totalSpent.toFixed(2)}`, 14, 55);
    doc.text(`Total Contributions: ${budget.currency} ${totalContributions.toFixed(2)}`, 14, 65);
    doc.text(`Remaining: ${budget.currency} ${remaining.toFixed(2)}`, 14, 75);

    // Expenses table
    const tableData = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.description,
      expense.category,
      `${expense.currency} ${expense.amount.toFixed(2)}`,
      (expense.ownerId as any).name,
      (expense.paidBy as any)?.name || (expense.ownerId as any).name
    ]);

    (doc as jsPDFWithAutoTable).autoTable({
      head: [['Date', 'Description', 'Category', 'Amount', 'Added By', 'Paid By']],
      body: tableData,
      startY: 90,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Contributions table
    if (budget.contributions.length > 0) {
      const finalY = (doc as any).lastAutoTable?.finalY || 100;
      doc.setFontSize(14);
      doc.text('Contributions', 14, finalY + 20);
      
      const contributionData = budget.contributions.map((contrib: any) => [
        new Date(contrib.date).toLocaleDateString(),
        (contrib.userId as any)?.name || 'Unknown',
        `${budget.currency} ${contrib.amount.toFixed(2)}`,
        contrib.comment || '-'
      ]);

      (doc as jsPDFWithAutoTable).autoTable({
        head: [['Date', 'Member', 'Amount', 'Comment']],
        body: contributionData,
        startY: finalY + 30,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [34, 197, 94], // Green color
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });
    }

    // Set response headers
    const filename = `${household.name.replace(/[^a-zA-Z0-9]/g, '_')}_budget_${now.getFullYear()}_${now.getMonth() + 1}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(doc.output('arraybuffer'));
  } catch (error: any) {
    console.error('Error exporting household budget PDF:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
