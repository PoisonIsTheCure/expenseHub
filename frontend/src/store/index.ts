import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expenseReducer from './slices/expenseSlice';
import householdReducer from './slices/householdSlice';
import budgetReducer from './slices/budgetSlice';
import settlementReducer from './slices/settlementSlice';
import recurringExpenseReducer from './slices/recurringExpenseSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expenseReducer,
    households: householdReducer,
    budget: budgetReducer,
    settlements: settlementReducer,
    recurringExpenses: recurringExpenseReducer,
    analytics: analyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

