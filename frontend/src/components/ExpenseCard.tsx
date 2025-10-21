import { useState } from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../config/currency';
import AttachmentViewer from './AttachmentViewer';

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
}

const ExpenseCard = ({ expense, onEdit, onDelete, currentUserId }: ExpenseCardProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const isOwner = currentUserId === (expense.ownerId._id || expense.ownerId.id);
  const date = new Date(expense.date).toLocaleDateString();

  const getCurrencySymbol = (currencyCode: string) => {
    // Currency is now always EUR, so we can use the centralized formatter
    return '€';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Travel': 'bg-green-100 text-green-800',
      'Groceries': 'bg-teal-100 text-teal-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
              {expense.category}
            </span>
            {expense.householdId && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Household
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{expense.description}</h3>
          <p className="text-sm text-gray-600">
            By {expense.ownerId.name} • {date}
          </p>
        </div>
        <div className="text-right ml-4">
          <p className="text-2xl font-bold text-gray-900">
            {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)}
          </p>
          {expense.attachments && expense.attachments.length > 0 && (
            <button
              onClick={() => setIsViewerOpen(true)}
              className="text-xs text-primary-600 hover:text-primary-800 mt-1 flex items-center gap-1 transition-colors"
            >
              📎 {expense.attachments.length} attachment{expense.attachments.length > 1 ? 's' : ''}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
          {isOwner && (onEdit || onDelete) && (
            <div className="flex gap-2 mt-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(expense)}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(expense._id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attachment Viewer */}
      {expense.attachments && expense.attachments.length > 0 && (
        <AttachmentViewer
          attachments={expense.attachments}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default ExpenseCard;

