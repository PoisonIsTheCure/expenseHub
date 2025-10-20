import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                ExpenseHub
              </Link>
              {user && (
                <div className="ml-10 flex space-x-4">
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/expenses"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/expenses') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Expenses
                  </Link>
                  <Link
                    to="/households"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/households') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Households
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/admin') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                </div>
              )}
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.name} {user.role === 'admin' && '(Admin)'}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary text-sm">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};

export default Layout;

