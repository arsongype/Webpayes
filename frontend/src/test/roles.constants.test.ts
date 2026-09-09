import { describe, it, expect } from 'vitest';
import { USER, ADMIN, ROLES } from '../constants/roles.constants';

describe('roles.constants', () => {
  it('defines USER and ADMIN roles', () => {
    expect(USER).toBe('USER');
    expect(ADMIN).toBe('ADMIN');
  });

  it('exports ROLES array with both roles', () => {
    expect(ROLES).toEqual([USER, ADMIN]);
    expect(ROLES).toHaveLength(2);
  });
});
