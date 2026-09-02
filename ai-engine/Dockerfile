FROM python:3.13-slim

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir \
    "fastapi>=0.110.0" \
    "uvicorn[standard]>=0.29.0" \
    "redis>=5.0.0" \
    "scikit-learn>=1.4.0" \
    "numpy>=1.26.0" \
    "pandas>=2.2.0"

COPY main.py ./

ENV PORT=8001
EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
