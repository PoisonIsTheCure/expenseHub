import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchHouseholdBalances } from '../store/slices/settlementSlice';
import LoadingSpinner from './LoadingSpinner';

interface BalancesViewProps {
  householdId: string;
}

const BalancesView = ({ householdId }: BalancesViewProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { balances, loading, error } = useSelector((state: RootState) => state.settlements);

  useEffect(() => {
    if (householdId) {
      dispatch(fetchHouseholdBalances(householdId));
    }
  }, [dispatch, householdId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading balances: {error}
      </div>
    );
  }

  if (!balances) {
    return null;
  }

  const { balances: memberBalances, debts, currency } = balances;
  
  const getCurrencySymbol = (code: string) => {
    // Currency is now always EUR
    return '€';
  };

  const symbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-6">
      {/* Member Balances Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Member Balances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberBalances.map((member) => (
            <div
              key={member.userId}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <span
                  className={`text-sm font-semibold ${
                    member.balance > 0
                      ? 'text-green-600'
                      : member.balance < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {member.balance > 0 ? '+' : ''}
                  {symbol}
                  {member.balance.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span>
                    {symbol}
                    {member.totalPaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Owes:</span>
                  <span>
                    {symbol}
                    {member.totalOwed.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                {member.balance > 0 && (
                  <p className="text-xs text-green-600">Should receive</p>
                )}
                {member.balance < 0 && (
                  <p className="text-xs text-red-600">Needs to pay</p>
                )}
                {member.balance === 0 && (
                  <p className="text-xs text-gray-600">All settled</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified Debts */}
      {debts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Suggested Settlements</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              These are simplified payment suggestions to settle all debts with the
              minimum number of transactions.
            </p>
          </div>
          <div className="space-y-3">
            {debts.map((debt, index) => (
              <div
                key={index}
                className="bg-white border rounded-lg p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold">
                      {debt.fromUser.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">
                      {debt.fromUser.name}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                      {debt.toUser.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">
                      {debt.toUser.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {symbol}
                    {debt.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{debt.currency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {debts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-green-500 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-green-900 mb-1">
            All Settled!
          </h3>
          <p className="text-green-700">
            There are no outstanding debts in this household.
          </p>
        </div>
      )}
    </div>
  );
};

export default BalancesView;

