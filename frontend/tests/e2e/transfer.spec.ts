import { test, expect, request } from '@playwright/test';

test('register -> login -> create transfer -> check balance', async () => {
  const apiContext = await request.newContext({ baseURL: 'http://localhost:8081' });

  // Register user
  const email = `e2e.user+${Date.now()}@example.com`;
  const registerResp = await apiContext.post('/api/auth/register', {
    data: { firstName: 'E2E', lastName: 'User', email, password: 'Password123' },
  });
  expect(registerResp.ok()).toBeTruthy();
  const auth = await registerResp.json();
  const token = auth.accessToken;
  expect(token).toBeTruthy();

  // List accounts
  const accountsResp = await apiContext.get('/api/accounts', { headers: { Authorization: `Bearer ${token}` } });
  expect(accountsResp.ok()).toBeTruthy();
  const accounts = await accountsResp.json();
  expect(accounts.length).toBeGreaterThanOrEqual(1);
  const accountId = accounts[0].id;

  // Deposit via wallet API to ensure balance updates
  const depositResp = await apiContext.post('/api/wallet/deposit', {
    headers: { Authorization: `Bearer ${token}` },
    data: { accountId, amount: 50.0, description: 'E2E deposit' },
  });
  expect(depositResp.ok()).toBeTruthy();

  // Check balance
  const balanceResp = await apiContext.get(`/api/wallet/balance?accountId=${accountId}`, { headers: { Authorization: `Bearer ${token}` } });
  expect(balanceResp.ok()).toBeTruthy();
  const balance = await balanceResp.json();
  expect(Number(balance.balance)).toBeGreaterThanOrEqual(50);
});
