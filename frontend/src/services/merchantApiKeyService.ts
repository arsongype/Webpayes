import api from './api';

export interface ApiKeyResponse {
    keyId: string;
    apiKey: string;
    name: string;
    prefix: string;
    createdAt: string;
    expiresAt: string;
}

export interface ApiKeyListResponse {
    keyId: string;
    name: string;
    prefix: string;
    createdAt: string;
    expiresAt: string;
    lastUsedAt: string | null;
    active: boolean;
}

const merchantApiKeyService = {
    generate: async (name: string, twoFactorCode?: string): Promise<ApiKeyResponse> => {
        const headers: Record<string, string> = {};
        if (twoFactorCode) {
            headers['X-2FA-Code'] = twoFactorCode;
        }
        const response = await api.post('/merchant/api-keys', { name }, { headers });
        return response.data;
    },
    list: async (): Promise<ApiKeyListResponse[]> => {
        const response = await api.get('/merchant/api-keys');
        return response.data;
    },
    revoke: async (keyId: string): Promise<void> => {
        await api.post(`/merchant/api-keys/${keyId}/revoke`);
    },
    validate: async (apiKey: string): Promise<{ valid: boolean }> => {
        const response = await api.post('/merchant/validate-key', { apiKey });
        return response.data;
    },
};

export default merchantApiKeyService;
