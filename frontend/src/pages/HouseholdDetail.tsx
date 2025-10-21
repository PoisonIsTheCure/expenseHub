import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchHouseholdById,
  addMember,
  removeMember,
  addContribution,
  getContributionStats,
  updateHouseholdBudget,
} from '../store/slices/householdSlice';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import BalancesView from '../components/BalancesView';
import SettlementForm from '../components/SettlementForm';
import { useToast } from '../contexts/ToastContext';
import { DEFAULT_CURRENCY } from '../config/currency';

interface ContributionStats {
  household: {
    _id: string;
    name: string;
  };
  totalContributions: number;
  currency: string;
  memberStats: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    total: number;
    count: number;
    percentage: number;
    contributions: Array<{
      amount: number;
      date: string;
    }>;
  }>;
}

const HouseholdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentHousehold, loading } = useSelector((state: RootState) => state.households);
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'balances'>('overview');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddContributionModalOpen, setIsAddContributionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState(DEFAULT_CURRENCY);
  const [contributionStats, setContributionStats] = useState<ContributionStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchHouseholdById(id));
      loadContributionStats();
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentHousehold?.budget) {
      setBudgetLimit(currentHousehold.budget.monthlyLimit?.toString() || '');
      setBudgetCurrency(currentHousehold.budget.currency || 'EUR');
    }
  }, [currentHousehold]);

  const loadContributionStats = async () => {
    if (!id) return;
    setLoadingStats(true);
    try {
      const result = await dispatch(getContributionStats(id)).unwrap();
      setContributionStats(result);
    } catch (error: any) {
      console.error('Failed to load contribution stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !memberEmail.trim()) return;

    try {
      await dispatch(addMember({ id, email: memberEmail })).unwrap();
      showToast('Member added successfully', 'success');
      setMemberEmail('');
      setIsAddMemberModalOpen(false);
    } catch (error: any) {
      showToast(error || 'Failed to add member', 'error');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!id) return;
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this household?`)) return;

    try {
      await dispatch(removeMember({ id, memberId })).unwrap();
      showToast('Member removed successfully', 'success');
    } catch (error: any) {
      showToast(error || 'Failed to remove member', 'error');
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !contributionAmount || parseFloat(contributionAmount) <= 0) return;

    try {
      await dispatch(addContribution({ id, amount: parseFloat(contributionAmount) })).unwrap();
      showToast('Contribution added successfully', 'success');
      setContributionAmount('');
      setIsAddContributionModalOpen(false);
      loadContributionStats();
    } catch (error: any) {
      showToast(error || 'Failed to add contribution', 'error');
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const data: { monthlyLimit?: number; currency?: string } = {};
      if (budgetLimit) data.monthlyLimit = parseFloat(budgetLimit);
      data.currency = DEFAULT_CURRENCY; // Always EUR

      await dispatch(updateHouseholdBudget({ id, data })).unwrap();
      showToast('Budget updated successfully', 'success');
      setIsBudgetModalOpen(false);
    } catch (error: any) {
      showToast(error || 'Failed to update budget', 'error');
    }
  };

  if (loading && !currentHousehold) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!currentHousehold) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Household not found</p>
          <button onClick={() => navigate('/households')} className="btn btn-primary">
            Back to Households
          </button>
        </div>
      </Layout>
    );
  }

  const isCreator = currentHousehold.createdBy._id === user?.id || currentHousehold.createdBy.id === user?.id;
  const getCurrencySymbol = (code: string) => {
    // Currency is now always EUR
    return '€';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/households')}
              className="text-primary-600 hover:text-primary-700 mb-2 flex items-center gap-1"
            >
              ← Back to Households
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{currentHousehold.name}</h1>
            <p className="text-gray-600 mt-1">
              Created by {currentHousehold.createdBy.name}
              {isCreator && <span className="ml-2 text-primary-600">(You)</span>}
            </p>
          </div>
          {isCreator && (
            <button onClick={() => setIsBudgetModalOpen(true)} className="btn btn-primary">
              Manage Budget
            </button>
          )}
        </div>

        {/* Budget Info */}
        {currentHousehold.budget && currentHousehold.budget.monthlyLimit > 0 && (
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Household Budget</h3>
            <p className="text-3xl font-bold text-primary-700">
              {getCurrencySymbol(currentHousehold.budget.currency)}
              {currentHousehold.budget.monthlyLimit.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Monthly Limit</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'balances'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Balances & Settlements
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Members Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Members ({currentHousehold.members.length})
            </h2>
            {isCreator && (
              <button onClick={() => setIsAddMemberModalOpen(true)} className="btn btn-secondary">
                Add Member
              </button>
            )}
          </div>
          <div className="space-y-3">
            {currentHousehold.members.map((member: any) => {
              const memberId = member._id || member.id;
              const isCurrentUser = memberId === user?.id;
              const isMemberCreator = memberId === (currentHousehold.createdBy._id || currentHousehold.createdBy.id);

              return (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.name}
                      {isCurrentUser && <span className="ml-2 text-primary-600">(You)</span>}
                      {isMemberCreator && (
                        <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                          Creator
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  {isCreator && !isMemberCreator && (
                    <button
                      onClick={() => handleRemoveMember(memberId, member.name)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contributions Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Contributions</h2>
            <button onClick={() => setIsAddContributionModalOpen(true)} className="btn btn-primary">
              Add Contribution
            </button>
          </div>

          {loadingStats ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading contribution stats...</p>
            </div>
          ) : contributionStats && contributionStats.memberStats.length > 0 ? (
            <>
              <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
                <p className="text-3xl font-bold text-green-700">
                  {getCurrencySymbol(contributionStats.currency)}
                  {contributionStats.totalContributions.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="space-y-4">
                {contributionStats.memberStats.map((stat) => (
                  <div key={stat.user._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{stat.user.name}</p>
                        <p className="text-sm text-gray-600">{stat.count} contributions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {getCurrencySymbol(contributionStats.currency)}
                          {stat.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {stat.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    {/* Recent Contributions */}
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">Recent Contributions</p>
                      {stat.contributions.slice(-3).reverse().map((contrib, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {new Date(contrib.date).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-gray-900">
                            {getCurrencySymbol(contributionStats.currency)}
                            {contrib.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No contributions yet</p>
              <p className="text-sm text-gray-400">
                Start tracking household contributions by adding your first contribution
              </p>
            </div>
          )}
        </div>
          </>
        )}

        {/* Balances & Settlements Tab */}
        {activeTab === 'balances' && id && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Balances & Settlements</h2>
              <button
                onClick={() => setIsSettlementModalOpen(true)}
                className="btn btn-primary"
              >
                Record Settlement
              </button>
            </div>
            <BalancesView householdId={id} />
          </div>
        )}

        {/* Settlement Modal */}
        <Modal
          isOpen={isSettlementModalOpen}
          onClose={() => setIsSettlementModalOpen(false)}
          title="Record Settlement"
        >
          {id && (
            <SettlementForm
              householdId={id}
              members={currentHousehold.members}
              onSuccess={() => {
                showToast('Settlement recorded successfully', 'success');
                setIsSettlementModalOpen(false);
              }}
              onCancel={() => setIsSettlementModalOpen(false)}
            />
          )}
        </Modal>

        {/* Add Member Modal */}
        <Modal
          isOpen={isAddMemberModalOpen}
          onClose={() => {
            setIsAddMemberModalOpen(false);
            setMemberEmail('');
          }}
          title="Add Member to Household"
        >
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="label">Member Email</label>
              <input
                type="email"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="input"
                placeholder="user@example.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the email of an existing user to add them to this household
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Add Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setMemberEmail('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* Add Contribution Modal */}
        <Modal
          isOpen={isAddContributionModalOpen}
          onClose={() => {
            setIsAddContributionModalOpen(false);
            setContributionAmount('');
          }}
          title="Add Contribution"
        >
          <form onSubmit={handleAddContribution} className="space-y-4">
            <div>
              <label className="label">Contribution Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                className="input"
                placeholder="100.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Currency: {currentHousehold.budget?.currency || 'EUR'}
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Add Contribution
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddContributionModalOpen(false);
                  setContributionAmount('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* Budget Management Modal */}
        <Modal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          title="Manage Household Budget"
        >
          <form onSubmit={handleUpdateBudget} className="space-y-4">
            <div>
              <label className="label">Monthly Limit</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="input"
                placeholder="1000.00"
              />
            </div>
            {/* Currency is now fixed to EUR - no selection needed */}
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Update Budget
              </button>
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default HouseholdDetail;

