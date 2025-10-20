import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { analyticsAPI } from '../../services/api';
import { AnalyticsState, PersonalAnalytics, HouseholdAnalytics, MonthComparison } from '../../types';

const initialState: AnalyticsState = {
  personalAnalytics: null,
  householdAnalytics: {},
  monthComparison: null,
  loading: false,
  error: null,
};

export const fetchPersonalAnalytics = createAsyncThunk(
  'analytics/fetchPersonal',
  async (params?: { startDate?: string; endDate?: string }) => {
    const response = await analyticsAPI.getPersonal(params);
    return response.data;
  }
);

export const fetchHouseholdAnalytics = createAsyncThunk(
  'analytics/fetchHousehold',
  async ({
    householdId,
    params,
  }: {
    householdId: string;
    params?: { startDate?: string; endDate?: string };
  }) => {
    const response = await analyticsAPI.getHousehold(householdId, params);
    return { householdId, data: response.data };
  }
);

export const fetchMonthComparison = createAsyncThunk(
  'analytics/compareMonths',
  async (householdId?: string) => {
    const response = await analyticsAPI.compareMonths(householdId);
    return response.data;
  }
);

export const fetchCategoryTrends = createAsyncThunk(
  'analytics/categoryTrends',
  async (params?: { householdId?: string; months?: number }) => {
    const response = await analyticsAPI.getCategoryTrends(params);
    return response.data;
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnalytics: (state) => {
      state.personalAnalytics = null;
      state.householdAnalytics = {};
      state.monthComparison = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch personal analytics
      .addCase(fetchPersonalAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonalAnalytics.fulfilled, (state, action: PayloadAction<PersonalAnalytics>) => {
        state.loading = false;
        state.personalAnalytics = action.payload;
      })
      .addCase(fetchPersonalAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch personal analytics';
      })
      // Fetch household analytics
      .addCase(fetchHouseholdAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchHouseholdAnalytics.fulfilled,
        (state, action: PayloadAction<{ householdId: string; data: HouseholdAnalytics }>) => {
          state.loading = false;
          state.householdAnalytics[action.payload.householdId] = action.payload.data;
        }
      )
      .addCase(fetchHouseholdAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch household analytics';
      })
      // Fetch month comparison
      .addCase(fetchMonthComparison.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthComparison.fulfilled, (state, action: PayloadAction<MonthComparison>) => {
        state.loading = false;
        state.monthComparison = action.payload;
      })
      .addCase(fetchMonthComparison.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch month comparison';
      })
      // Fetch category trends
      .addCase(fetchCategoryTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryTrends.fulfilled, (state) => {
        state.loading = false;
        // Trend data could be stored if needed
      })
      .addCase(fetchCategoryTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch category trends';
      });
  },
});

export const { clearError, clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;

