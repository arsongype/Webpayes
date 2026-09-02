import api from './api';

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
  qrDataUrl: string;
}

export interface TwoFactorStatusResponse {
  twoFactorEnabled: boolean;
}

export interface TwoFactorRecoveryResponse {
  recoveryCodes: string[];
}

const twoFactorService = {
  setup: async (): Promise<TwoFactorSetupResponse> => {
    const response = await api.post('/auth/two-factor/setup');
    return response.data;
  },
  enable: async (secret: string, code: number): Promise<void> => {
    await api.post('/auth/two-factor/enable', null, {
      params: { secret, code },
    });
  },
  disable: async (code?: number, recoveryCode?: string): Promise<void> => {
    await api.post('/auth/two-factor/disable', null, {
      params: code !== undefined ? { code } : recoveryCode ? { recoveryCode } : {},
    });
  },
  status: async (): Promise<TwoFactorStatusResponse> => {
    const response = await api.get('/auth/two-factor/status');
    return response.data;
  },
  recoveryCodes: async (): Promise<TwoFactorRecoveryResponse> => {
    const response = await api.get('/auth/two-factor/recovery-codes');
    return response.data;
  },
  regenerateRecoveryCodes: async (): Promise<TwoFactorRecoveryResponse> => {
    const response = await api.post('/auth/two-factor/recovery-codes/regenerate');
    return response.data;
  },
  verifyQr: async (secret: string, code: number): Promise<boolean> => {
    const response = await api.post('/auth/two-factor/verify-qr', null, {
      params: { secret, code },
    });
    return response.data;
  },
};

export default twoFactorService;
