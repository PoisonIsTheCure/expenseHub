import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { exportExpensesCSV, exportExpensesPDF, exportHouseholdBudgetPDF } from '../utils/exportUtils';

interface ExportButtonProps {
  type: 'expenses' | 'household-budget';
  householdId?: string;
  householdName?: string;
  startDate?: string;
  endDate?: string;
  className?: string;
}

const ExportButton = ({ 
  type, 
  householdId, 
  householdName, 
  startDate, 
  endDate, 
  className = '' 
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    setShowOptions(false);

    try {
      let result;
      
      if (type === 'expenses') {
        const params = { householdId, startDate, endDate };
        result = format === 'csv' 
          ? await exportExpensesCSV(params)
          : await exportExpensesPDF(params);
      } else if (type === 'household-budget' && householdId) {
        result = await exportHouseholdBudgetPDF(householdId, householdName);
      }

      if (result?.success) {
        showSuccess(`${format.toUpperCase()} export completed successfully!`);
      } else {
        showError(result?.error || `Failed to export ${format.toUpperCase()}`);
      }
    } catch (error) {
      showError(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className={`btn btn-secondary ${className} ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </>
        )}
      </button>

      {showOptions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowOptions(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export as PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
