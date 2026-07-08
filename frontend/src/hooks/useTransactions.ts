import { useEffect } from 'react';
import { useAppSelector } from './useAppDispatch';

const useTransactions = () => {
  const { transactions, loading, error } = useAppSelector((state) => state.transactions);

  useEffect(() => {
    if (transactions.length === 0 && !loading) {
      void 0;
    }
  }, [transactions, loading]);

  return { transactions, loading, error, hasFetched: true };
};

export default useTransactions;
