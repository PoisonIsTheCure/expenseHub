import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { createSettlement } from '../store/slices/settlementSlice';
import { User } from '../types';

interface SettlementFormProps {
  householdId: string;
  members: User[];
  suggestedAmount?: number;
  suggestedRecipient?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SettlementForm = ({
  householdId,
  members,
  suggestedAmount = 0,
  suggestedRecipient = '',
  onSuccess,
  onCancel,
}: SettlementFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [toUserId, setToUserId] = useState(suggestedRecipient);
  const [amount, setAmount] = useState(suggestedAmount.toString());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!toUserId || !amount || parseFloat(amount) <= 0) {
      setError('Please select a recipient and enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        createSettlement({
          householdId,
          toUserId,
          amount: parseFloat(amount),
          notes,
        })
      ).unwrap();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create settlement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pay To
        </label>
        <select
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select member...</option>
          {members.map((member) => (
            <option key={member._id || member.id} value={member._id || member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">€</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add a note about this settlement..."
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Creating...' : 'Record Settlement'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default SettlementForm;

