import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { settlementAPI } from '../../services/api';
import { SettlementState, Settlement, BalanceData } from '../../types';

const initialState: SettlementState = {
  settlements: [],
  balances: null,
  loading: false,
  error: null,
};

export const fetchHouseholdBalances = createAsyncThunk(
  'settlement/fetchHouseholdBalances',
  async (householdId: string) => {
    const response = await settlementAPI.getBalances(householdId);
    return response.data;
  }
);

export const fetchHouseholdSettlements = createAsyncThunk(
  'settlement/fetchHouseholdSettlements',
  async (householdId: string) => {
    const response = await settlementAPI.getHouseholdSettlements(householdId);
    return response.data.settlements;
  }
);

export const fetchUserSettlements = createAsyncThunk(
  'settlement/fetchUserSettlements',
  async () => {
    const response = await settlementAPI.getUserSettlements();
    return response.data.settlements;
  }
);

export const createSettlement = createAsyncThunk(
  'settlement/createSettlement',
  async (data: any) => {
    const response = await settlementAPI.create(data);
    return response.data.settlement;
  }
);

export const updateSettlementStatus = createAsyncThunk(
  'settlement/updateSettlementStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await settlementAPI.updateStatus(id, status);
    return response.data.settlement;
  }
);

const settlementSlice = createSlice({
  name: 'settlement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBalances: (state) => {
      state.balances = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch household balances
      .addCase(fetchHouseholdBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHouseholdBalances.fulfilled, (state, action: PayloadAction<BalanceData>) => {
        state.loading = false;
        state.balances = action.payload;
      })
      .addCase(fetchHouseholdBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch balances';
      })
      // Fetch household settlements
      .addCase(fetchHouseholdSettlements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHouseholdSettlements.fulfilled, (state, action: PayloadAction<Settlement[]>) => {
        state.loading = false;
        state.settlements = action.payload;
      })
      .addCase(fetchHouseholdSettlements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settlements';
      })
      // Fetch user settlements
      .addCase(fetchUserSettlements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSettlements.fulfilled, (state, action: PayloadAction<Settlement[]>) => {
        state.loading = false;
        state.settlements = action.payload;
      })
      .addCase(fetchUserSettlements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user settlements';
      })
      // Create settlement
      .addCase(createSettlement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSettlement.fulfilled, (state, action: PayloadAction<Settlement>) => {
        state.loading = false;
        state.settlements.unshift(action.payload);
      })
      .addCase(createSettlement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create settlement';
      })
      // Update settlement status
      .addCase(updateSettlementStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettlementStatus.fulfilled, (state, action: PayloadAction<Settlement>) => {
        state.loading = false;
        const index = state.settlements.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.settlements[index] = action.payload;
        }
      })
      .addCase(updateSettlementStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update settlement status';
      });
  },
});

export const { clearError, clearBalances } = settlementSlice.actions;
export default settlementSlice.reducer;

