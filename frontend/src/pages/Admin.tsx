import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { register } from '../store/slices/authSlice';
import { userAPI } from '../services/api';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  householdId?: string;
}

const Admin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(register(formData));
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account!');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(userId);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            Create User
          </button>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Household</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id || user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.householdId ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(user._id || user.id)}
                          disabled={(user._id || user.id) === currentUser?.id}
                          className={`text-sm ${
                            (user._id || user.id) === currentUser?.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-800'
                          }`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Total Users:</strong> {users.length} | <strong>Admins:</strong>{' '}
              {users.filter((u) => u.role === 'admin').length} | <strong>Regular Users:</strong>{' '}
              {users.filter((u) => u.role === 'user').length}
            </p>
          </div>
        </div>

        {/* Create User Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New User">
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label className="label">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Create User
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({ name: '', email: '', password: '', role: 'user' });
                }}
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

export default Admin;

