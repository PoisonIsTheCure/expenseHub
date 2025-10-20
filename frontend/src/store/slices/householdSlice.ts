import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HouseholdState, Household } from '../../types';
import { householdAPI } from '../../services/api';

const initialState: HouseholdState = {
  households: [],
  currentHousehold: null,
  loading: false,
  error: null,
};

export const fetchHouseholds = createAsyncThunk(
  'households/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await householdAPI.getAll();
      return response.data.households;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch households');
    }
  }
);

export const fetchHouseholdById = createAsyncThunk(
  'households/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await householdAPI.getById(id);
      return response.data.household;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch household');
    }
  }
);

export const createHousehold = createAsyncThunk(
  'households/create',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await householdAPI.create(name);
      return response.data.household;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create household');
    }
  }
);

export const joinHousehold = createAsyncThunk(
  'households/join',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await householdAPI.join(id);
      return response.data.household;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join household');
    }
  }
);

export const leaveHousehold = createAsyncThunk(
  'households/leave',
  async (id: string, { rejectWithValue }) => {
    try {
      await householdAPI.leave(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave household');
    }
  }
);

export const deleteHousehold = createAsyncThunk(
  'households/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await householdAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete household');
    }
  }
);

export const addMember = createAsyncThunk(
  'households/addMember',
  async ({ id, email }: { id: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await householdAPI.addMember(id, email);
      return response.data.household;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member');
    }
  }
);

export const removeMember = createAsyncThunk(
  'households/removeMember',
  async ({ id, memberId }: { id: string; memberId: string }, { rejectWithValue }) => {
    try {
      const response = await householdAPI.removeMember(id, memberId);
      return response.data.household;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

export const addContribution = createAsyncThunk(
  'households/addContribution',
  async ({ id, amount }: { id: string; amount: number }, { rejectWithValue }) => {
    try {
      const response = await householdAPI.addContribution(id, amount);
      return response.data.household;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add contribution');
    }
  }
);

export const getContributionStats = createAsyncThunk(
  'households/getContributionStats',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await householdAPI.getContributionStats(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get contribution stats');
    }
  }
);

export const updateHouseholdBudget = createAsyncThunk(
  'households/updateBudget',
  async ({ id, data }: { id: string; data: { monthlyLimit?: number; currency?: string } }, { rejectWithValue }) => {
    try {
      const response = await householdAPI.updateBudget(id, data);
      return response.data.household;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update budget');
    }
  }
);

const householdSlice = createSlice({
  name: 'households',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentHousehold: (state, action: PayloadAction<Household | null>) => {
      state.currentHousehold = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch households
    builder
      .addCase(fetchHouseholds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHouseholds.fulfilled, (state, action: PayloadAction<Household[]>) => {
        state.loading = false;
        state.households = action.payload;
      })
      .addCase(fetchHouseholds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch household by ID
    builder
      .addCase(fetchHouseholdById.fulfilled, (state, action: PayloadAction<Household>) => {
        state.currentHousehold = action.payload;
      });

    // Create household
    builder
      .addCase(createHousehold.fulfilled, (state, action: PayloadAction<Household>) => {
        state.households.push(action.payload);
      });

    // Join household
    builder
      .addCase(joinHousehold.fulfilled, (state, action: PayloadAction<Household>) => {
        const index = state.households.findIndex((h) => h._id === action.payload._id);
        if (index === -1) {
          state.households.push(action.payload);
        }
      });

    // Leave household
    builder
      .addCase(leaveHousehold.fulfilled, (state, action: PayloadAction<string>) => {
        state.households = state.households.filter((h) => h._id !== action.payload);
        if (state.currentHousehold?._id === action.payload) {
          state.currentHousehold = null;
        }
      });

    // Delete household
    builder
      .addCase(deleteHousehold.fulfilled, (state, action: PayloadAction<string>) => {
        state.households = state.households.filter((h) => h._id !== action.payload);
        if (state.currentHousehold?._id === action.payload) {
          state.currentHousehold = null;
        }
      });

    // Add member
    builder
      .addCase(addMember.fulfilled, (state, action: PayloadAction<Household>) => {
        const index = state.households.findIndex((h) => h._id === action.payload._id);
        if (index !== -1) {
          state.households[index] = action.payload;
        }
        if (state.currentHousehold?._id === action.payload._id) {
          state.currentHousehold = action.payload;
        }
      });

    // Remove member
    builder
      .addCase(removeMember.fulfilled, (state, action: PayloadAction<Household>) => {
        const index = state.households.findIndex((h) => h._id === action.payload._id);
        if (index !== -1) {
          state.households[index] = action.payload;
        }
        if (state.currentHousehold?._id === action.payload._id) {
          state.currentHousehold = action.payload;
        }
      });

    // Add contribution
    builder
      .addCase(addContribution.fulfilled, (state, action: PayloadAction<Household>) => {
        const index = state.households.findIndex((h) => h._id === action.payload._id);
        if (index !== -1) {
          state.households[index] = action.payload;
        }
        if (state.currentHousehold?._id === action.payload._id) {
          state.currentHousehold = action.payload;
        }
      });

    // Update household budget
    builder
      .addCase(updateHouseholdBudget.fulfilled, (state, action: PayloadAction<Household>) => {
        const index = state.households.findIndex((h) => h._id === action.payload._id);
        if (index !== -1) {
          state.households[index] = action.payload;
        }
        if (state.currentHousehold?._id === action.payload._id) {
          state.currentHousehold = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentHousehold } = householdSlice.actions;
export default householdSlice.reducer;

