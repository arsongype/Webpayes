import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 200 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
  const payload = {
    paymentMethod: 'BANK_TRANSFER',
    amount: 100.0,
    currency: 'MGA',
    destinationAccount: `ACCT-LOAD-${Math.floor(Math.random() * 10000)}`,
    description: 'Load test payment',
  };

  const res = http.post(`${BASE_URL}/api/payments/process`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has success': (r) => {
      try {
        return r.json('success') === true;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
