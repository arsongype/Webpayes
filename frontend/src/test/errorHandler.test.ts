import { describe, it, expect } from 'vitest';
import { extractErrorMessage } from '../utils/errorHandler';

describe('extractErrorMessage', () => {
  it('extracts message from axios error response', () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: 'Invalid credentials' } },
    };

    expect(extractErrorMessage(error, 'Fallback')).toBe('Invalid credentials');
  });

  it('extracts first message from array of messages', () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: ['Field required', 'Invalid format'] } },
    };

    expect(extractErrorMessage(error, 'Fallback')).toBe('Field required Invalid format');
  });

  it('falls back to Error message when no axios data', () => {
    const error = new Error('Network error');

    expect(extractErrorMessage(error, 'Fallback')).toBe('Network error');
  });

  it('returns fallback for unknown error', () => {
    const error = { some: 'thing' };

    expect(extractErrorMessage(error, 'Default fallback')).toBe('Default fallback');
  });
});
