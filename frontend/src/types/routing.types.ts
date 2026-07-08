export interface RoutingChannel {
  id: string;
  name: string;
  type: string;
  fee_percent: number;
  min_amount: number;
  max_amount: number;
  processing_time_seconds: number;
  available: boolean;
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
