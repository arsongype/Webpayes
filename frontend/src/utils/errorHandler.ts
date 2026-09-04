import axios from 'axios';

export const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message) && data.message.length > 0) return data.message.join(' ');
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};
