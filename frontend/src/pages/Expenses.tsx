import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../store/slices/expenseSlice';
import { fetchHouseholds } from '../store/slices/householdSlice';
import Layout from '../components/Layout';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import Modal from '../components/Modal';
import { Expense } from '../types';

const Expenses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, loading } = useSelector((state: RootState) => state.expenses);
  const { user } = useSelector((state: RootState) => state.auth);
  const { households } = useSelector((state: RootState) => state.households);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<'all' | 'personal' | 'household'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchHouseholds());
  }, [dispatch]);

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
    await dispatch(createExpense(data));
    setIsModalOpen(false);
  };

  const handleUpdateExpense = async (data: any) => {
    if (editingExpense) {
      await dispatch(updateExpense({ id: editingExpense._id, data }));
      setEditingExpense(null);
      setIsModalOpen(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await dispatch(deleteExpense(id));
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            Add Expense
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="label">Type</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="input">
                <option value="all">All Expenses</option>
                <option value="personal">Personal Only</option>
                <option value="household">Household Only</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="label">Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input">
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
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No expenses found</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              Add Your First Expense
            </button>
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

