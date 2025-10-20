import { Expense, CURRENCIES } from '../types';

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
}

const ExpenseCard = ({ expense, onEdit, onDelete, currentUserId }: ExpenseCardProps) => {
  const isOwner = currentUserId === (expense.ownerId._id || expense.ownerId.id);
  const date = new Date(expense.date).toLocaleDateString();

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
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
            <p className="text-xs text-gray-500 mt-1">
              📎 {expense.attachments.length} attachment{expense.attachments.length > 1 ? 's' : ''}
            </p>
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
    </div>
  );
};

export default ExpenseCard;

