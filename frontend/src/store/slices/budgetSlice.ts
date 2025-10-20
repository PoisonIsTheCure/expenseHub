import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BudgetState, PersonalBudget, HouseholdBudget } from '../../types';
import { budgetAPI } from '../../services/api';

const initialState: BudgetState = {
  personalBudget: null,
  householdBudgets: {},
  loading: false,
  error: null,
};

// Fetch personal budget
export const fetchPersonalBudget = createAsyncThunk(
  'budget/fetchPersonal',
  async (_, { rejectWithValue }) => {
    try {
      const response = await budgetAPI.getPersonal();
      return response.data.budget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch personal budget');
    }
  }
);

// Update personal budget
export const updatePersonalBudget = createAsyncThunk(
  'budget/updatePersonal',
  async (data: { monthlyLimit?: number; currency?: string }, { rejectWithValue }) => {
    try {
      const response = await budgetAPI.updatePersonal(data);
      return response.data.budget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update personal budget');
    }
  }
);

// Fetch household budget
export const fetchHouseholdBudget = createAsyncThunk(
  'budget/fetchHousehold',
  async (householdId: string, { rejectWithValue }) => {
    try {
      const response = await budgetAPI.getHousehold(householdId);
      return { householdId, budget: response.data.budget };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch household budget');
    }
  }
);

// Update household budget
export const updateHouseholdBudget = createAsyncThunk(
  'budget/updateHousehold',
  async ({ householdId, data }: { householdId: string; data: { monthlyLimit?: number; currency?: string } }, { rejectWithValue }) => {
    try {
      const response = await budgetAPI.updateHousehold(householdId, data);
      return { householdId, budget: response.data.budget };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update household budget');
    }
  }
);

// Add household contribution
export const addHouseholdContribution = createAsyncThunk(
  'budget/addHouseholdContribution',
  async ({ householdId, amount }: { householdId: string; amount: number }, { rejectWithValue }) => {
    try {
      const response = await budgetAPI.addHouseholdContribution(householdId, amount);
      return { householdId, contribution: response.data.contribution, budget: response.data.budget };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add contribution');
    }
  }
);

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearHouseholdBudget: (state, action: PayloadAction<string>) => {
      delete state.householdBudgets[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Fetch personal budget
    builder
      .addCase(fetchPersonalBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonalBudget.fulfilled, (state, action: PayloadAction<PersonalBudget>) => {
        state.loading = false;
        state.personalBudget = action.payload;
        state.error = null;
      })
      .addCase(fetchPersonalBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update personal budget
    builder
      .addCase(updatePersonalBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePersonalBudget.fulfilled, (state, action: PayloadAction<PersonalBudget>) => {
        state.loading = false;
        state.personalBudget = action.payload;
        state.error = null;
      })
      .addCase(updatePersonalBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch household budget
    builder
      .addCase(fetchHouseholdBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHouseholdBudget.fulfilled, (state, action: PayloadAction<{ householdId: string; budget: HouseholdBudget }>) => {
        state.loading = false;
        state.householdBudgets[action.payload.householdId] = action.payload.budget;
        state.error = null;
      })
      .addCase(fetchHouseholdBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update household budget
    builder
      .addCase(updateHouseholdBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHouseholdBudget.fulfilled, (state, action: PayloadAction<{ householdId: string; budget: HouseholdBudget }>) => {
        state.loading = false;
        state.householdBudgets[action.payload.householdId] = action.payload.budget;
        state.error = null;
      })
      .addCase(updateHouseholdBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add household contribution
    builder
      .addCase(addHouseholdContribution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHouseholdContribution.fulfilled, (state, action: PayloadAction<{ householdId: string; contribution: any; budget?: HouseholdBudget }>) => {
        state.loading = false;
        const { householdId, budget } = action.payload;
        if (budget) {
          state.householdBudgets[householdId] = budget;
        }
        state.error = null;
      })
      .addCase(addHouseholdContribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearHouseholdBudget } = budgetSlice.actions;
export default budgetSlice.reducer;
