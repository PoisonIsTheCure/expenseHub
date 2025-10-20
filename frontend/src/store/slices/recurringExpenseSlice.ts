import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { recurringExpenseAPI } from '../../services/api';
import { RecurringExpenseState, RecurringExpense } from '../../types';

const initialState: RecurringExpenseState = {
  recurringExpenses: [],
  loading: false,
  error: null,
};

export const fetchRecurringExpenses = createAsyncThunk(
  'recurringExpense/fetchAll',
  async () => {
    const response = await recurringExpenseAPI.getAll();
    return response.data.recurringExpenses;
  }
);

export const fetchRecurringExpenseById = createAsyncThunk(
  'recurringExpense/fetchById',
  async (id: string) => {
    const response = await recurringExpenseAPI.getById(id);
    return response.data.recurringExpense;
  }
);

export const createRecurringExpense = createAsyncThunk(
  'recurringExpense/create',
  async (data: any) => {
    const response = await recurringExpenseAPI.create(data);
    return response.data.recurringExpense;
  }
);

export const updateRecurringExpense = createAsyncThunk(
  'recurringExpense/update',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await recurringExpenseAPI.update(id, data);
    return response.data.recurringExpense;
  }
);

export const deleteRecurringExpense = createAsyncThunk(
  'recurringExpense/delete',
  async (id: string) => {
    await recurringExpenseAPI.delete(id);
    return id;
  }
);

export const processRecurringExpenses = createAsyncThunk(
  'recurringExpense/process',
  async () => {
    const response = await recurringExpenseAPI.process();
    return response.data;
  }
);

const recurringExpenseSlice = createSlice({
  name: 'recurringExpense',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchRecurringExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecurringExpenses.fulfilled, (state, action: PayloadAction<RecurringExpense[]>) => {
        state.loading = false;
        state.recurringExpenses = action.payload;
      })
      .addCase(fetchRecurringExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch recurring expenses';
      })
      // Fetch by ID
      .addCase(fetchRecurringExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecurringExpenseById.fulfilled, (state, action: PayloadAction<RecurringExpense>) => {
        state.loading = false;
        const index = state.recurringExpenses.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.recurringExpenses[index] = action.payload;
        } else {
          state.recurringExpenses.push(action.payload);
        }
      })
      .addCase(fetchRecurringExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch recurring expense';
      })
      // Create
      .addCase(createRecurringExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRecurringExpense.fulfilled, (state, action: PayloadAction<RecurringExpense>) => {
        state.loading = false;
        state.recurringExpenses.unshift(action.payload);
      })
      .addCase(createRecurringExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create recurring expense';
      })
      // Update
      .addCase(updateRecurringExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecurringExpense.fulfilled, (state, action: PayloadAction<RecurringExpense>) => {
        state.loading = false;
        const index = state.recurringExpenses.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.recurringExpenses[index] = action.payload;
        }
      })
      .addCase(updateRecurringExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update recurring expense';
      })
      // Delete
      .addCase(deleteRecurringExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRecurringExpense.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.recurringExpenses = state.recurringExpenses.filter((e) => e._id !== action.payload);
      })
      .addCase(deleteRecurringExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete recurring expense';
      })
      // Process
      .addCase(processRecurringExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processRecurringExpenses.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(processRecurringExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to process recurring expenses';
      });
  },
});

export const { clearError } = recurringExpenseSlice.actions;
export default recurringExpenseSlice.reducer;

