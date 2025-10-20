import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { ToastProvider } from './contexts/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Households from './pages/Households';
import HouseholdDetail from './pages/HouseholdDetail';
import Budget from './pages/Budget';
import Admin from './pages/Admin';

function App() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <ToastProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/expenses"
            element={
              <PrivateRoute>
                <Expenses />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/households"
            element={
              <PrivateRoute>
                <Households />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/households/:id"
            element={
              <PrivateRoute>
                <HouseholdDetail />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/budget"
            element={
              <PrivateRoute>
                <Budget />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <PrivateRoute requireAdmin>
                <Admin />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

