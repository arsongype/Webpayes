import { useDispatch as useReduxDispatch } from 'react-redux';
import { useSelector as useReduxSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';

export const useAppDispatch = () => useReduxDispatch<AppDispatch>();
export const useAppSelector = <T,>(selector: (state: RootState) => T) => useReduxSelector(selector);
