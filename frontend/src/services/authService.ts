import api from './api';

export interface AuthTokenResponse {
  access_token?: string;
  accessToken?: string;
  twoFactorRequired?: boolean;
  twoFactorSetupRequired?: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    accountNumber?: string;
    twoFactorEnabled?: boolean;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  cin: string;
  dateOfBirth?: string;
  nationality?: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface RegisterSuccessResponse {
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    accountNumber?: string;
  };
}

const authService = {
  login: async (payload: LoginPayload): Promise<AuthTokenResponse> => {
    const response = await api.post('/auth/login', {
      email: payload.email,
      password: payload.password,
      twoFactorCode: payload.twoFactorCode ?? null,
    });
    return response.data;
  },
  register: async (payload: RegisterPayload): Promise<RegisterSuccessResponse> => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
};

export const extractAccessToken = (response: AuthTokenResponse): string => {
  return response.access_token ?? response.accessToken ?? '';
};

export default authService;