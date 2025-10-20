import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES, Expense } from '../types';

interface ExpenseFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: Expense | null;
  households?: Array<{ _id: string; name: string }>;
}

const ExpenseForm = ({ onSubmit, onCancel, initialData, households = [] }: ExpenseFormProps) => {
  const [formData, setFormData] = useState({
    amount: initialData?.amount.toString() || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Other',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    householdId: initialData?.householdId?._id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      householdId: formData.householdId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Amount ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="input"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="label">Description</label>
        <input
          type="text"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input"
          placeholder="What did you spend on?"
        />
      </div>

      <div>
        <label className="label">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="input"
        >
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Date</label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="input"
        />
      </div>

      {households.length > 0 && (
        <div>
          <label className="label">Household (Optional)</label>
          <select
            value={formData.householdId}
            onChange={(e) => setFormData({ ...formData, householdId: e.target.value })}
            className="input"
          >
            <option value="">Personal Expense</option>
            {households.map((household) => (
              <option key={household._id} value={household._id}>
                {household.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn btn-primary flex-1">
          {initialData ? 'Update' : 'Create'} Expense
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;

