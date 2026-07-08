import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081/api';

export default function () {
  const res = http.get(`${BASE_URL}/actuator/health`);
  check(res, {
    'health check status 200': (r) => r.status === 200,
  });
  sleep(1);
}
