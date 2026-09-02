import api from './api';

export interface TokenizeRequest {
    pan: string;
    expiryMonth: string;
    expiryYear: string;
    cardHolderName: string;
}

export interface TokenizeResponse {
    token: string;
    panLast4: string;
    cardBrand: string;
    expiryMonth: string;
    expiryYear: string;
    message: string;
}

export interface DetokenizeRequest {
    token: string;
}

export interface DetokenizeResponse {
    pan: string;
    panLast4: string;
    cardBrand: string;
    expiryMonth: string;
    expiryYear: string;
}

const vaultService = {
    tokenize: async (request: TokenizeRequest): Promise<TokenizeResponse> => {
        const response = await api.post('/vault/tokenize', request);
        return response.data;
    },
    detokenize: async (request: DetokenizeRequest): Promise<DetokenizeResponse> => {
        const response = await api.post('/vault/detokenize', request);
        return response.data;
    },
    deactivateToken: async (token: string): Promise<void> => {
        await api.post(`/vault/tokens/${token}/deactivate`);
    },
};

export default vaultService;
