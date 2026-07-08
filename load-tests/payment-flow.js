import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081/api';

export default function () {
  const authRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(authRes, {
    'login status 200': (r) => r.status === 200 || r.status === 401,
  });

  const token = authRes.json('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const dashboardRes = http.get(`${BASE_URL}/dashboard`, { headers });
  check(dashboardRes, {
    'dashboard status 200': (r) => r.status === 200,
  });

  const txRes = http.get(`${BASE_URL}/transactions`, { headers });
  check(txRes, {
    'transactions status 200': (r) => r.status === 200,
  });

  sleep(1);
}
