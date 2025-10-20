import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchPersonalAnalytics,
  fetchHouseholdAnalytics,
  fetchMonthComparison,
} from '../store/slices/analyticsSlice';
import { fetchAllHouseholds } from '../store/slices/householdSlice';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { CURRENCIES } from '../types';

const Analytics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { personalAnalytics, householdAnalytics, monthComparison, loading } = useSelector(
    (state: RootState) => state.analytics
  );
  const { households } = useSelector((state: RootState) => state.households);
  const [selectedView, setSelectedView] = useState<'personal' | 'household'>('personal');
  const [selectedHousehold, setSelectedHousehold] = useState('');

  useEffect(() => {
    dispatch(fetchAllHouseholds());
    dispatch(fetchPersonalAnalytics());
    dispatch(fetchMonthComparison());
  }, [dispatch]);

  useEffect(() => {
    if (selectedView === 'household' && selectedHousehold) {
      dispatch(fetchHouseholdAnalytics({ householdId: selectedHousehold }));
      dispatch(fetchMonthComparison(selectedHousehold));
    } else if (selectedView === 'personal') {
      dispatch(fetchMonthComparison());
    }
  }, [dispatch, selectedView, selectedHousehold]);

  const getCurrencySymbol = (code: string) => {
    const currency = CURRENCIES.find((c) => c.code === code);
    return currency?.symbol || code;
  };

  const renderPersonalAnalytics = () => {
    if (!personalAnalytics) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900">
              €{personalAnalytics.totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900">
              {personalAnalytics.totalExpenses}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Average Expense</p>
            <p className="text-3xl font-bold text-gray-900">
              €{personalAnalytics.avgExpense.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Top Categories */}
        {personalAnalytics.topCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
            <div className="space-y-3">
              {personalAnalytics.topCategories.map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-gray-600">
                      €{cat.amount.toFixed(2)} ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Month Comparison */}
        {monthComparison && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Month Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Month</p>
                <p className="text-2xl font-bold">
                  €{monthComparison.currentMonth.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {monthComparison.currentMonth.count} expenses
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Last Month</p>
                <p className="text-2xl font-bold">
                  €{monthComparison.lastMonth.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {monthComparison.lastMonth.count} expenses
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Change:</span>
                <span
                  className={`text-lg font-semibold ${
                    monthComparison.comparison.trend === 'increase'
                      ? 'text-red-600'
                      : monthComparison.comparison.trend === 'decrease'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  {monthComparison.comparison.difference > 0 ? '+' : ''}€
                  {monthComparison.comparison.difference.toFixed(2)} (
                  {monthComparison.comparison.percentageChange > 0 ? '+' : ''}
                  {monthComparison.comparison.percentageChange.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHouseholdAnalytics = () => {
    if (!selectedHousehold) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">
            Select a household to view analytics
          </p>
        </div>
      );
    }

    const analytics = householdAnalytics[selectedHousehold];
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900">
              €{analytics.totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.totalExpenses}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Members</p>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.household.memberCount}
            </p>
          </div>
        </div>

        {/* Top Spenders */}
        {analytics.topSpenders.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {analytics.topSpenders.map((spender) => (
                <div key={spender.userId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{spender.name}</span>
                    <span className="text-gray-600">
                      €{spender.total.toFixed(2)} ({spender.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${spender.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Categories */}
        {analytics.topCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
            <div className="space-y-3">
              {analytics.topCategories.map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-gray-600">
                      €{cat.amount.toFixed(2)} ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            View insights and trends for your expenses
          </p>
        </div>

        {/* View Selector */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedView('personal')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedView === 'personal'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setSelectedView('household')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedView === 'household'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Household
            </button>
          </div>

          {selectedView === 'household' && (
            <select
              value={selectedHousehold}
              onChange={(e) => setSelectedHousehold(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select household...</option>
              {households.map((household) => (
                <option key={household._id} value={household._id}>
                  {household.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Analytics Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : selectedView === 'personal' ? (
          renderPersonalAnalytics()
        ) : (
          renderHouseholdAnalytics()
        )}
      </div>
    </Layout>
  );
};

export default Analytics;

