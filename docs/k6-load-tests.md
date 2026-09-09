# k6 Load Tests

## Installation

### Windows (Chocolatey)
```powershell
choco install k6
```

### macOS
```bash
brew install k6
```

### Linux
```bash
sudo apt install k6  # Debian/Ubuntu
```

## Run

```powershell
k6 run backend/src/test/resources/k6-payment-load.js
```

With custom base URL:
```powershell
k6 run -e BASE_URL=http://localhost:8080 backend/src/test/resources/k6-payment-load.js
```

## SLA
- p95 latency < 500 ms
- failure rate < 1%
- stages: 50 -> 200 -> 0 VUs
