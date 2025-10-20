import { ReactNode, useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white shadow-md">
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
                  <Link
                    to="/budget"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/budget') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Budget
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

      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              ExpenseHub
            </Link>
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 truncate max-w-32">
                  {user.name}
                </span>
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Dropdown Menu */}
        {user && mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/expenses"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/expenses') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Expenses
              </Link>
              <Link
                to="/households"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/households') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Households
              </Link>
              <Link
                to="/budget"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/budget') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Budget
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin
                </Link>
              )}
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-4 gap-1">
            <Link
              to="/"
              className={`flex flex-col items-center py-2 px-1 ${
                isActive('/') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span className="text-xs">Dashboard</span>
            </Link>
            <Link
              to="/expenses"
              className={`flex flex-col items-center py-2 px-1 ${
                isActive('/expenses') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Expenses</span>
            </Link>
            <Link
              to="/households"
              className={`flex flex-col items-center py-2 px-1 ${
                isActive('/households') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-xs">Households</span>
            </Link>
            <Link
              to="/budget"
              className={`flex flex-col items-center py-2 px-1 ${
                isActive('/budget') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Budget</span>
            </Link>
          </div>
        </nav>
      )}

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 ${user ? 'pb-16 md:pb-8' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;

