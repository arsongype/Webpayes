import { createContext, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import authService, { extractAccessToken } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { LoginPayload, RegisterPayload } from '../services/authService';

type TokenPayload = {
  sub?: string;
  email?: string;
  roles?: string[];
  role?: string;
  firstName?: string;
  lastName?: string;
  exp?: number;
};

export type AuthUser = TokenPayload & {
  token: string;
  avatar?: string;
};

interface AuthContextType {
  user: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loginWithGoogle: () => void;
  completeOAuthLogin: (token: string) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

const buildUserFromToken = (token: string): AuthUser => {
  const payload = jwtDecode<TokenPayload>(token);
  const roles = payload.roles ?? (payload.role ? [payload.role] : ['user']);
  const overrides = loadOverrides(payload.sub);

  return {
    ...payload,
    roles,
    token,
    ...overrides,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setUser(buildUserFromToken(token));
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const persistToken = (token: string) => {
    localStorage.setItem('token', token);
    setUser(buildUserFromToken(token));
  };

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    const token = extractAccessToken(response);
    if (!token) {
      throw new Error('Token JWT manquant dans la réponse de connexion');
    }
    persistToken(token);
    navigate('/dashboard');
  };

  const register = async (payload: RegisterPayload) => {
    const response = await authService.register(payload);
    const token = extractAccessToken(response);
    if (!token) {
      throw new Error("Token JWT manquant dans la réponse d'inscription");
    }
    persistToken(token);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const loginWithGoogle = () => {
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const completeOAuthLogin = (token: string) => {
    persistToken(token);
    navigate('/dashboard', { replace: true });
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      saveOverrides(next.sub, {
        email: next.email,
        firstName: next.firstName,
        lastName: next.lastName,
        avatar: next.avatar,
      });
      return next;
    });
  };

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
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};