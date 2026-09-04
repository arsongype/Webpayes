import { useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import authService, { extractAccessToken } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { LoginPayload, RegisterPayload } from '../services/authService';
import { AuthContext } from './authContextStore';
import type { AuthUser, TokenPayload } from './authContextTypes';
import { ADMIN } from '../constants/roles.constants';

const overridesKey = (sub?: string) => `profileOverrides:${sub ?? 'guest'}`;

const loadOverrides = (sub?: string): Partial<AuthUser> => {
  try {
    const raw = localStorage.getItem(overridesKey(sub));
    return raw ? (JSON.parse(raw) as Partial<AuthUser>) : {};
  } catch {
    return {};
  }
};

const saveOverrides = (sub: string | undefined, updates: Partial<AuthUser>) => {
  const current = loadOverrides(sub);
  localStorage.setItem(overridesKey(sub), JSON.stringify({ ...current, ...updates }));
};

const getRoles = (payload: TokenPayload): string[] => {
  if (payload.roles && payload.roles.length > 0) return payload.roles;
  if (payload.role) return [payload.role];
  return ['user'];
};

const buildUserFromToken = (token: string): AuthUser => {
  const payload = jwtDecode<TokenPayload>(token);
  const roles = getRoles(payload);
  const overrides = loadOverrides(payload.sub);

  return {
    ...payload,
    roles,
    token,
    ...overrides,
  };
};

const determineRedirect = (token: string): string => {
  try {
    const payload = jwtDecode<TokenPayload>(token);
    return getRoles(payload).includes(ADMIN) ? '/admin/dashboard' : '/dashboard';
  } catch {
    return '/dashboard';
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      return buildUserFromToken(token);
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  });
  const navigate = useNavigate();

  const persistToken = useCallback((token: string) => {
    localStorage.setItem('token', token);
    setUser(buildUserFromToken(token));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const login = useCallback(
    async (payload: LoginPayload, options?: { redirectTo?: string; requireRole?: string[] }) => {
      const response = await authService.login(payload);
      if (!response) {
        throw new Error('Réponse de connexion invalide.');
      }
      if (response.twoFactorRequired) {
        throw new Error('TWO_FACTOR_REQUIRED');
      }
      const token = extractAccessToken(response);
      if (!token) {
        throw new Error('Token JWT manquant dans la réponse de connexion');
      }
      persistToken(token);

      if (response.user?.accountNumber && payload.email) {
        saveOverrides(payload.email.toLowerCase(), {
          accountNumber: response.user.accountNumber,
        });
        setUser((prev) => (prev ? { ...prev, accountNumber: response.user!.accountNumber } : prev));
      }

      if (response.twoFactorSetupRequired) {
        navigate('/two-factor-setup');
        return;
      }

      if (options?.requireRole) {
        try {
          const decoded = jwtDecode<TokenPayload>(token);
          const roles = getRoles(decoded);
          if (!options.requireRole.some((role) => roles.includes(role))) {
            logout();
            throw new Error(`Accès refusé : ce compte n'a pas les droits ${options.requireRole.join(' ou ')}.`);
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes('Accès refusé')) {
            throw err;
          }
        }
      }
      const destination = options?.redirectTo ?? determineRedirect(token);
      navigate(destination);
    },
    [navigate, persistToken, logout],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authService.register(payload);
      navigate('/login', { replace: true });
    },
    [navigate],
  );

  const loginWithGoogle = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/google`;
  }, []);

  const completeOAuthLogin = useCallback(
    (token: string) => {
      persistToken(token);
      const redirectTo = determineRedirect(token);
      navigate(redirectTo, { replace: true });
    },
    [navigate, persistToken],
  );

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      saveOverrides(next.sub, {
        email: next.email,
        firstName: next.firstName,
        lastName: next.lastName,
        avatar: next.avatar,
        accountNumber: next.accountNumber,
        shopName: next.shopName,
      });
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      loginWithGoogle,
      completeOAuthLogin,
      updateUser,
    }),
    [user, login, register, logout, loginWithGoogle, completeOAuthLogin, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
