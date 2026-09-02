export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  cin?: string;
  dateOfBirth?: string;
  nationality?: string;
  role: string;
  enabled: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  avatarUrl?: string;
  preferredLanguage?: string;
  timezone?: string;
  notificationEmail?: boolean;
  notificationSms?: boolean;
  notificationPush?: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  user: UserDTO;
  account: AccountSummary | null;
  kyc: KycSummary;
  security: SecuritySummary;
  stats: StatsSummary;
}

export interface AccountSummary {
  id: string;
  accountNumber: string;
  balance: number;
  currency: string;
  status: string;
}

export interface KycSummary {
  status: string;
  confidence?: number | null;
  verifiedAt?: string | null;
  attempts: number;
  maxAttempts: number;
  remainingAttempts: number;
  locked: boolean;
  lockedUntil?: string | null;
}

export interface SecuritySummary {
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  recoveryCodesRemaining: number;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  failedLoginCount: number;
}

export interface StatsSummary {
  transactionsCount: number;
  apiKeysCount: number;
  memberSince?: string | null;
}

export interface LoginHistoryEntry {
  loginAt: string;
  ip: string;
  success: boolean;
}
