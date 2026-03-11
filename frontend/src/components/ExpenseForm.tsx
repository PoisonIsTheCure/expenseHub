import { useState } from 'react';
import axios from 'axios';
import { EXPENSE_CATEGORIES, Expense } from '../types';
import { DEFAULT_CURRENCY } from '../config/currency';
import { uploadAPI } from '../services/api';

interface ExpenseFormProps {
  onSubmit: (data: any) => void | Promise<void>;
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
  const [existingAttachments] = useState(initialData?.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        householdId: formData.householdId || undefined,
        attachments: [...existingAttachments] as any[],
      };
      
      // Upload files first if any
      if (selectedFiles && selectedFiles.length > 0) {
        const files = Array.from(selectedFiles);
        try {
          const uploadResponse = await uploadAPI.uploadFiles(files);
          submitData.attachments = [
            ...submitData.attachments,
            ...(uploadResponse.data.files || []),
          ];
        } catch (error) {
          console.error('Error uploading files:', error);
          const backendMessage = axios.isAxiosError(error)
            ? error.response?.data?.message
            : undefined;
          setUploadError(backendMessage || 'Failed to upload attachments. Please try again.');
          return;
        }
      }
      
      // Submit expense data with file metadata
      await Promise.resolve(onSubmit(submitData));
    } catch (error) {
      console.error('Error submitting expense:', error);
      setUploadError('Failed to save expense. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setSelectedFiles(e.target.files);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
      <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
      </div>

      <div className="space-y-4 sm:space-y-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 p-4 sm:p-5">
        <label className="label">Receipts (Optional)</label>
        <input
          type="file"
          name="receipts"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="input w-full"
        />
        {uploadError && (
          <p className="text-sm text-red-600 mt-2">{uploadError}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Upload images or PDF files (max 10MB each, up to 5 files)
        </p>
        {existingAttachments.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            This expense already has {existingAttachments.length} attachment{existingAttachments.length > 1 ? 's' : ''}.
            New files will be added.
          </p>
        )}
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700">Selected files:</p>
            <ul className="mt-1 text-sm text-gray-600 space-y-1">
              {Array.from(selectedFiles).map((file, index) => (
                <li key={index}>• {file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 sm:pt-2">
        <button type="submit" disabled={uploading} className="btn btn-primary w-full">
          {uploading ? 'Uploading...' : (initialData ? 'Update' : 'Create')} Expense
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary w-full">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;

