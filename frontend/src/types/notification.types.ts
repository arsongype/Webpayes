export interface ChatRequest {
  session_id: string;
  message: string;
}

export interface ChatResponse {
  session_id: string;
  reply: string;
}

export interface SmsRequest {
  phoneNumber: string;
  message: string;
}

export type NotificationType = 'TRANSACTION' | 'PAYMENT' | 'PAYMENT_RECEIVED' | 'SYSTEM' | 'ALERT';

export interface NotificationDTO {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  type: NotificationType | string;
  status: string;
  createdAt?: string;
  read?: boolean;
}
