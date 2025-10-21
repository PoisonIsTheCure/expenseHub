import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchPersonalBudget, fetchHouseholdBudget, updatePersonalBudget, updateHouseholdBudget, addHouseholdContribution } from '../store/slices/budgetSlice';
import { fetchHouseholds } from '../store/slices/householdSlice';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ExportButton from '../components/ExportButton';
import { DEFAULT_CURRENCY } from '../config/currency';

const Budget = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { personalBudget, householdBudgets, loading, error } = useSelector((state: RootState) => state.budget);
  const { households } = useSelector((state: RootState) => state.households);
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'personal' | 'household'>('personal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'personal' | 'household' | 'contribution'>('personal');
  const [selectedHousehold, setSelectedHousehold] = useState<string>('');
  const [formData, setFormData] = useState({
    monthlyLimit: '',
    currency: DEFAULT_CURRENCY,
    contributionAmount: '',
    contributionComment: '',
  });

  useEffect(() => {
    dispatch(fetchPersonalBudget());
    dispatch(fetchHouseholds());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  const handleOpenModal = (type: 'personal' | 'household' | 'contribution', householdId?: string) => {
    setModalType(type);
    if (householdId) {
      setSelectedHousehold(householdId);
      dispatch(fetchHouseholdBudget(householdId));
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ monthlyLimit: '', currency: 'EUR', contributionAmount: '', contributionComment: '' });
    setSelectedHousehold('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modalType === 'personal') {
        const result = await dispatch(updatePersonalBudget({
          monthlyLimit: formData.monthlyLimit ? parseFloat(formData.monthlyLimit) : undefined,
          currency: formData.currency,
        }));
        
        if (updatePersonalBudget.fulfilled.match(result)) {
          showSuccess('Personal budget updated successfully!');
          handleCloseModal();
        } else {
          showError(result.payload as string || 'Failed to update personal budget');
        }
      } else if (modalType === 'household') {
        const result = await dispatch(updateHouseholdBudget({
          householdId: selectedHousehold,
          data: {
            monthlyLimit: formData.monthlyLimit ? parseFloat(formData.monthlyLimit) : undefined,
            currency: formData.currency,
          },
        }));
        
        if (updateHouseholdBudget.fulfilled.match(result)) {
          showSuccess('Household budget updated successfully!');
          handleCloseModal();
        } else {
          showError(result.payload as string || 'Failed to update household budget');
        }
      } else if (modalType === 'contribution') {
        const result = await dispatch(addHouseholdContribution({
          householdId: selectedHousehold,
          amount: parseFloat(formData.contributionAmount),
          comment: formData.contributionComment,
        }));
        
        if (addHouseholdContribution.fulfilled.match(result)) {
          showSuccess('Contribution added successfully!');
          handleCloseModal();
        } else {
          showError(result.payload as string || 'Failed to add contribution');
        }
      }
    } catch (error) {
      showError('An unexpected error occurred');
    }
  };

  const getCurrencySymbol = () => {
    // Currency is now always EUR
    return '€';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Management</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 sm:space-x-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setActiveTab('household')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'household'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Household
            </button>
          </nav>
        </div>

        {/* Personal Budget Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Personal Budget</h2>
              <button
                onClick={() => handleOpenModal('personal')}
                className="btn btn-primary w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : (personalBudget ? 'Update Budget' : 'Set Budget')}
              </button>
            </div>

            {personalBudget && personalBudget.monthlyLimit !== undefined ? (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Budget Overview */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Limit:</span>
                      <span className="font-semibold">
                        {getCurrencySymbol()}{(personalBudget.monthlyLimit || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-semibold text-red-600">
                        {getCurrencySymbol()}{(personalBudget.totalSpent || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={`font-semibold ${(personalBudget.remaining || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {getCurrencySymbol()}{(personalBudget.remaining || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usage:</span>
                      <span className="font-semibold">{(personalBudget.percentageUsed || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Progress</h3>
                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${getProgressColor(personalBudget.percentageUsed || 0)}`}
                        style={{ width: `${Math.min(personalBudget.percentageUsed || 0, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {(personalBudget.percentageUsed || 0) >= 100
                        ? 'Budget exceeded!'
                        : (personalBudget.percentageUsed || 0) >= 80
                        ? 'Approaching budget limit'
                        : 'Within budget'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <EmptyState
                  title="No personal budget set"
                  description="Set up your personal budget to start tracking your monthly spending and stay on top of your finances."
                  action={{
                    label: "Set Your First Budget",
                    onClick: () => handleOpenModal('personal')
                  }}
                  icon={
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* Household Budget Tab */}
        {activeTab === 'household' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Household Budgets</h2>

            {households.length > 0 ? (
              <div className="grid gap-6">
                {households.map((household) => {
                  const budget = householdBudgets[household._id];
                  return (
                    <div key={household._id} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">{household.name}</h3>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleOpenModal('household', household._id)}
                            className="btn btn-secondary btn-sm"
                          >
                            {budget ? 'Update Budget' : 'Set Budget'}
                          </button>
                          {budget && (
                            <>
                              <button
                                onClick={() => handleOpenModal('contribution', household._id)}
                                className="btn btn-primary btn-sm"
                              >
                                Add Contribution
                              </button>
                              <ExportButton
                                type="household-budget"
                                householdId={household._id}
                                householdName={household.name}
                                className="btn-sm"
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {budget && budget.monthlyLimit !== undefined ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monthly Limit:</span>
                              <span className="font-semibold">
                                {getCurrencySymbol()}{(budget.monthlyLimit || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Spent:</span>
                              <span className="font-semibold text-red-600">
                                {getCurrencySymbol()}{(budget.totalSpent || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contributions:</span>
                              <span className="font-semibold text-green-600">
                                {getCurrencySymbol()}{(budget.totalContributions || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Remaining:</span>
                              <span className={`font-semibold ${(budget.remaining || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {getCurrencySymbol()}{(budget.remaining || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full ${getProgressColor(budget.percentageUsed || 0)}`}
                                style={{ width: `${Math.min(budget.percentageUsed || 0, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {(budget.percentageUsed || 0).toFixed(1)}% used
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No budget set for this household</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card">
                <EmptyState
                  title="No households found"
                  description="Join or create a household to manage shared budgets and track expenses together."
                  icon={
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={
            modalType === 'personal'
              ? 'Personal Budget'
              : modalType === 'household'
              ? 'Household Budget'
              : 'Add Contribution'
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {modalType !== 'contribution' && (
              <>
                <div>
                  <label className="label">Monthly Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyLimit}
                    onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                {/* Currency is now fixed to EUR - no selection needed */}
              </>
            )}

            {modalType === 'contribution' && (
              <>
                <div>
                  <label className="label">Contribution Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.contributionAmount}
                    onChange={(e) => setFormData({ ...formData, contributionAmount: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="label">Comment (Optional)</label>
                  <textarea
                    value={formData.contributionComment}
                    onChange={(e) => setFormData({ ...formData, contributionComment: e.target.value })}
                    className="input"
                    placeholder="Add a note about this contribution..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.contributionComment.length}/500 characters
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                {modalType === 'personal' ? 'Update Budget' : modalType === 'household' ? 'Update Budget' : 'Add Contribution'}
              </button>
              <button type="button" onClick={handleCloseModal} className="btn btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Budget;
