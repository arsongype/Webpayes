import api from './api';

export interface AuthTokenResponse {
  access_token?: string;
  accessToken?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  firstName: string;
  lastName: string;
}

const authService = {
  login: async (payload: LoginPayload): Promise<AuthTokenResponse> => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },
  register: async (payload: RegisterPayload): Promise<AuthTokenResponse> => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
};

export const extractAccessToken = (response: AuthTokenResponse): string => {
  return response.access_token ?? response.accessToken ?? '';
};

export default authService;