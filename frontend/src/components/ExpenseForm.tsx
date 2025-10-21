import { useState } from 'react';
import { EXPENSE_CATEGORIES, Expense } from '../types';
import { DEFAULT_CURRENCY } from '../config/currency';
import { uploadAPI } from '../services/api';

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
    householdId: initialData?.householdId?._id || initialData?.householdId || '',
    currency: initialData?.currency || DEFAULT_CURRENCY,
  });

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        householdId: formData.householdId || undefined,
        attachments: [] as any[],
      };
      
      // Upload files first if any
      if (selectedFiles && selectedFiles.length > 0) {
        const files = Array.from(selectedFiles);
        const uploadResponse = await uploadAPI.uploadFiles(files);
        submitData.attachments = uploadResponse.data.files || [];
      }
      
      // Submit expense data with file metadata
      onSubmit(submitData);
    } catch (error) {
      console.error('Error uploading files:', error);
      // Still submit the expense without attachments
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        householdId: formData.householdId || undefined,
        attachments: [],
      };
      onSubmit(submitData);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="input w-full"
            placeholder="0.00"
          />
        </div>
        {/* Currency is now fixed to EUR - no selection needed */}
      </div>

      <div>
        <label className="label">Description</label>
        <input
          type="text"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input w-full"
          placeholder="What did you spend on?"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input w-full"
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
            className="input w-full"
          />
        </div>
      </div>

      {households.length > 0 && (
        <div>
          <label className="label">Household (Optional)</label>
          <select
            value={typeof formData.householdId === 'string' ? formData.householdId : ''}
            onChange={(e) => setFormData({ ...formData, householdId: e.target.value })}
            className="input w-full"
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

      <div>
        <label className="label">Receipts (Optional)</label>
        <input
          type="file"
          name="receipts"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="input w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload images or PDF files (max 10MB each, up to 5 files)
        </p>
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700">Selected files:</p>
            <ul className="text-sm text-gray-600">
              {Array.from(selectedFiles).map((file, index) => (
                <li key={index}>• {file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={uploading} className="btn btn-primary flex-1">
          {uploading ? 'Uploading...' : (initialData ? 'Update' : 'Create')} Expense
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;

