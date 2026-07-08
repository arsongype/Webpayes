export interface RecommendationResponse {
  user_id: string;
  savings_tip: string;
  spending_alert?: string;
  suggested_budget: Record<string, number>;
  recommended_channel?: string;
  confidence: number;
}

export interface RoutingRequest {
  amount: number;
  currency: string;
  sender_country: string;
  receiver_country: string;
  urgency_seconds?: number;
  preferred_channel?: string;
}

export interface RoutingResponse {
  recommended_channel: string;
  reason: string;
  estimated_fee: number;
  estimated_arrival_seconds: number;
  alternatives: Array<{ channel: string; name: string; fee: number; score: number }>;
}
