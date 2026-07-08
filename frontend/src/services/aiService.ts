import api from './api';
import type { FraudAlert, RiskScore } from '../types/transaction.types';
import type { ChatRequest, ChatResponse, SmsRequest } from '../types/notification.types';
import type { KycVerificationRequest, KycVerificationResponse, KycStatusUpdate } from '../types/kyc.types';
import type { RecommendationResponse } from '../types/recommendation.types';
import type { RoutingRequest, RoutingResponse } from '../types/routing.types';

const aiService = {
  getFraudAlerts: async (): Promise<FraudAlert[]> => {
    const response = await api.get('/ai/fraud/alerts');
    return response.data as FraudAlert[];
  },

  getRiskScore: async (transactionId: string): Promise<RiskScore> => {
    const response = await api.get(`/ai/risk/score/${transactionId}`);
    return response.data as RiskScore;
  },

  analyzeTransaction: async (transactionId: string): Promise<{ fraudScore: number; riskScore: number }> => {
    const response = await api.post(`/ai/analyze/${transactionId}`);
    return response.data as { fraudScore: number; riskScore: number };
  },

  chat: async (payload: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/ai/chatbot/chat', payload);
    return response.data as ChatResponse;
  },

  verifyKyc: async (payload: KycVerificationRequest): Promise<KycVerificationResponse> => {
    const response = await api.post('/ai/kyc/verify', payload);
    return response.data as KycVerificationResponse;
  },

  getKycVerification: async (verificationId: string): Promise<KycVerificationResponse> => {
    const response = await api.get(`/ai/kyc/verification/${verificationId}`);
    return response.data as KycVerificationResponse;
  },

  updateKycStatus: async (verificationId: string, payload: KycStatusUpdate): Promise<KycVerificationResponse> => {
    const response = await api.patch(`/ai/kyc/verification/${verificationId}`, payload);
    return response.data as KycVerificationResponse;
  },

  sendSms: async (payload: SmsRequest): Promise<string> => {
    const response = await api.post('/notifications/sms/send', payload);
    return response.data as string;
  },

  getRecommendations: async (payload: { user_id: string; transaction_history?: unknown[]; current_balance?: number }): Promise<RecommendationResponse> => {
    const response = await api.post('/ai/recommendations/analyze', payload);
    return response.data as RecommendationResponse;
  },

  getBestPaymentChannel: async (payload: RoutingRequest): Promise<RoutingResponse> => {
    const response = await api.post('/ai/routing/best-channel', payload);
    return response.data as RoutingResponse;
  },
};

export default aiService;
