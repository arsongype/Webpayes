import api from './api';
import type { TokenizeResponse } from './vaultService';

export type PaymentMethodType = 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
export type PaymentProvider = 'STRIPE' | 'ADYEN' | 'ORANGE_MONEY' | 'MTN_MOBILE_MONEY' | 'MPESA' | 'VISA' | 'MASTERCARD';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface MobileMoneyOperator {
    name: string;
    displayName: string;
    countryCallingCode: string;
}

export interface PaymentRequest {
    token: string;
    merchantApiKey?: string;
    paymentMethod: PaymentMethodType;
    provider?: PaymentProvider;
    amount: number;
    currency: string;
    customerId?: string;
    mobileMoneyPhone?: string;
    mobileMoneyOperator?: string;
    cardHolderName?: string;
    destinationAccount?: string;
    idempotencyKey?: string;
    description?: string;
    threeDsAuthCode?: string;
    previousTransactionId?: string;
    isOneClick?: boolean;
}

export interface PaymentResponse {
    paymentId: string;
    status: PaymentStatus;
    transactionReference: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethodType;
    provider?: PaymentProvider;
    message: string;
    success: boolean;
    token?: string;
    externalTransactionId?: string;
    riskScore?: number;
    threeDsRequired?: boolean;
    riskLevel?: string;
    fraudRecommendation?: string;
}

export interface PaymentProvidersResponse {
    cardProviders: PaymentProvider[];
    methodTypes: PaymentMethodType[];
}

export const PROVIDER_LABELS: Record<string, string> = {
    STRIPE: 'Stripe',
    ADYEN: 'Adyen',
    ORANGE_MONEY: 'Orange Money',
    MTN_MOBILE_MONEY: 'MTN Mobile Money',
    MPESA: 'M-Pesa',
    VISA: 'Visa',
    MASTERCARD: 'Mastercard',
};

const paymentService = {
    processPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
        const idempotencyKey = request.idempotencyKey || `pay-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        const response = await api.post('/payments/process', request, {
            headers: { 'Idempotency-Key': idempotencyKey },
        });
        return response.data;
    },
    getPaymentProviders: async (): Promise<PaymentProvidersResponse> => {
        const response = await api.get('/payments/providers');
        return response.data;
    },
    tokenizeCard: async (cardData: {
        pan: string;
        expiryMonth: string;
        expiryYear: string;
        cardHolderName: string;
    }): Promise<TokenizeResponse> => {
        const response = await api.post('/vault/tokenize', cardData);
        return response.data;
    },
};

export default paymentService;
