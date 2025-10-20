import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../store/slices/expenseSlice';
import { fetchHouseholds } from '../store/slices/householdSlice';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Expense } from '../types';

const Expenses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, loading, error } = useSelector((state: RootState) => state.expenses);
  const { user } = useSelector((state: RootState) => state.auth);
  const { households } = useSelector((state: RootState) => state.households);
  const { showSuccess, showError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<'all' | 'personal' | 'household'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchHouseholds());
  }, [dispatch]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (filter === 'personal') {
      filtered = filtered.filter((e) => !e.householdId);
    } else if (filter === 'household') {
      filtered = filtered.filter((e) => e.householdId);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filter, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(expenses.map((e) => e.category));
    return Array.from(cats).sort();
  }, [expenses]);

  const handleCreateExpense = async (data: any) => {
    try {
      const result = await dispatch(createExpense(data));
      if (createExpense.fulfilled.match(result)) {
        showSuccess('Expense created successfully!');
        setIsModalOpen(false);
      } else {
        showError(result.payload as string || 'Failed to create expense');
      }
    } catch (error) {
      showError('An unexpected error occurred');
    }
  };

  const handleUpdateExpense = async (data: any) => {
    if (editingExpense) {
      try {
        const result = await dispatch(updateExpense({ id: editingExpense._id, data }));
        if (updateExpense.fulfilled.match(result)) {
          showSuccess('Expense updated successfully!');
          setEditingExpense(null);
          setIsModalOpen(false);
        } else {
          showError(result.payload as string || 'Failed to update expense');
        }
      } catch (error) {
        showError('An unexpected error occurred');
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const result = await dispatch(deleteExpense(id));
        if (deleteExpense.fulfilled.match(result)) {
          showSuccess('Expense deleted successfully!');
        } else {
          showError(result.payload as string || 'Failed to delete expense');
        }
      } catch (error) {
        showError('An unexpected error occurred');
      }
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expenses</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary w-full sm:w-auto">
            Add Expense
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="input w-full">
                <option value="all">All Expenses</option>
                <option value="personal">Personal Only</option>
                <option value="household">Household Only</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input w-full">
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 p-3 bg-primary-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{filteredExpenses.length}</span> expenses totaling{' '}
              <span className="font-semibold text-primary-700">${totalAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Expenses List */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-500">Loading expenses...</p>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="grid gap-4">
            {filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                onEdit={handleEdit}
                onDelete={handleDeleteExpense}
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="card">
            <EmptyState
              title="No expenses found"
              description="Start tracking your expenses by adding your first expense entry."
              action={{
                label: "Add Your First Expense",
                onClick: () => setIsModalOpen(true)
              }}
              icon={
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              }
            />
          </div>
        )}

        {/* Expense Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        >
          <ExpenseForm
            onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
            onCancel={handleCloseModal}
            initialData={editingExpense}
            households={households}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default Expenses;

