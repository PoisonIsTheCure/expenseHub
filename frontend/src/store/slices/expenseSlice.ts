import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ExpenseState, Expense } from '../../types';
import { expenseAPI } from '../../services/api';

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getAll();
      return response.data.expenses;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.create(data);
      return response.data.expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.update(id, data);
      return response.data.expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await expenseAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch expenses
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create expense
    builder
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update expense
    builder
      .addCase(updateExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        const index = state.expenses.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      });

    // Delete expense
    builder.addCase(deleteExpense.fulfilled, (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((e) => e._id !== action.payload);
    });
  },
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer;

