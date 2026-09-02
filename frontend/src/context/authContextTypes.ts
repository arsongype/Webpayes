export type TokenPayload = {
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
  accountNumber?: string;
  shopName?: string;
};

export interface AuthContextType {
  user: AuthUser | null;
  login: (payload: { email: string; password: string }, options?: { redirectTo?: string; requireRole?: string[] }) => Promise<void>;
  register: (payload: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loginWithGoogle: () => void;
  completeOAuthLogin: (token: string) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}
