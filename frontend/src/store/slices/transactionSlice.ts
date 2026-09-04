import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';
import type { Transaction, TransferRequest } from '../../types/transaction.types';

interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  stats: { total: number; completed: number; pending: number; failed: number } | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  currentTransaction: null,
  stats: null,
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
    try {
      return await transactionService.list(params.page, params.size);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors du chargement');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchTransactionById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await transactionService.getById(id);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors du chargement');
    }
  }
);

export const transfer = createAsyncThunk(
  'transactions/transfer',
  async (payload: TransferRequest, { rejectWithValue }) => {
    try {
      return await transactionService.transfer(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors du transfert');
    }
  }
);

export const fetchStats = createAsyncThunk(
  'transactions/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await transactionService.getStats();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors du chargement des stats');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.currentTransaction = action.payload;
      })
      .addCase(transfer.fulfilled, (state, action) => {
        state.currentTransaction = action.payload as Transaction;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearCurrentTransaction, clearError } = transactionSlice.actions;
export default transactionSlice.reducer;
