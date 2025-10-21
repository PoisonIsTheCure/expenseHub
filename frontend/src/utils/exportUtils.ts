import { exportAPI } from '../services/api';

export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportExpensesCSV = async (params?: { 
  householdId?: string; 
  startDate?: string; 
  endDate?: string 
}) => {
  try {
    const response = await exportAPI.exportExpensesCSV(params);
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(response.data, filename);
    return { success: true };
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return { success: false, error: 'Failed to export CSV' };
  }
};

export const exportExpensesPDF = async (params?: { 
  householdId?: string; 
  startDate?: string; 
  endDate?: string 
}) => {
  try {
    const response = await exportAPI.exportExpensesPDF(params);
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.pdf`;
    downloadFile(response.data, filename);
    return { success: true };
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return { success: false, error: 'Failed to export PDF' };
  }
};

export const exportHouseholdBudgetPDF = async (householdId: string, householdName?: string) => {
  try {
    const response = await exportAPI.exportHouseholdBudgetPDF(householdId);
    const safeName = householdName?.replace(/[^a-zA-Z0-9]/g, '_') || 'household';
    const now = new Date();
    const filename = `${safeName}_budget_${now.getFullYear()}_${now.getMonth() + 1}.pdf`;
    downloadFile(response.data, filename);
    return { success: true };
  } catch (error) {
    console.error('Error exporting household budget PDF:', error);
    return { success: false, error: 'Failed to export household budget PDF' };
  }
};
