import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchExpenses } from '../store/slices/expenseSlice';
import { fetchHouseholds } from '../store/slices/householdSlice';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, loading } = useSelector((state: RootState) => state.expenses);
  const { user } = useSelector((state: RootState) => state.auth);
  const { households } = useSelector((state: RootState) => state.households);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchHouseholds());
  }, [dispatch]);

  const stats = useMemo(() => {
    const personalExpenses = expenses.filter((e) => !e.householdId);
    const householdExpenses = expenses.filter((e) => e.householdId);
    
    const personalTotal = personalExpenses.reduce((sum, e) => sum + e.amount, 0);
    const householdTotal = householdExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Category breakdown
    const categoryData: Record<string, number> = {};
    expenses.forEach((expense) => {
      categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
    });

    const chartData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));

    return {
      personalTotal,
      householdTotal,
      total: personalTotal + householdTotal,
      personalCount: personalExpenses.length,
      householdCount: householdExpenses.length,
      chartData,
    };
  }, [expenses]);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expenses]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Link to="/expenses" className="btn btn-primary">
            Add Expense
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <h3 className="text-lg font-medium mb-2 opacity-90">Total Expenses</h3>
            <p className="text-3xl font-bold">${stats.total.toFixed(2)}</p>
            <p className="text-sm mt-2 opacity-75">{expenses.length} total expenses</p>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-lg font-medium mb-2 opacity-90">Personal Expenses</h3>
            <p className="text-3xl font-bold">${stats.personalTotal.toFixed(2)}</p>
            <p className="text-sm mt-2 opacity-75">{stats.personalCount} expenses</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h3 className="text-lg font-medium mb-2 opacity-90">Household Expenses</h3>
            <p className="text-3xl font-bold">${stats.householdTotal.toFixed(2)}</p>
            <p className="text-sm mt-2 opacity-75">{stats.householdCount} expenses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
            {stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No expenses yet</p>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
            {recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <div key={expense._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                <Link to="/expenses" className="text-primary-600 hover:text-primary-800 text-sm font-medium block text-center mt-4">
                  View All Expenses →
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">No recent expenses</p>
            )}
          </div>
        </div>

        {/* Households */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Households</h2>
            <Link to="/households" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              Manage →
            </Link>
          </div>
          {households.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {households.map((household) => (
                <div key={household._id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{household.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{household.members.length} members</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No households yet. Create one to share expenses!</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

