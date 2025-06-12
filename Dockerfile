# Shared base with common dependencies
FROM alpine:latest AS base
RUN apk add --no-cache \
    openssl \
    curl

#############################################
# Frontend Stage
#############################################
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Leverage shared base packages if needed
COPY --from=base /usr /usr

# Copy package files and install deps
COPY SaaS/package.json SaaS/package-lock.json ./
RUN npm config set registry https://registry.npmmirror.com \
 && npm install -g npm@latest --loglevel verbose \
 && npm install --loglevel verbose

# Copy source and build
COPY SaaS/ ./
RUN npm run build

#############################################
# Backend builder (build stage with tools)
#############################################
FROM python:3.13-alpine AS backend-builder
WORKDIR /app/backend

RUN apk add --no-cache \
    build-base \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev

# Create a virtual environment
RUN python -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

COPY backend/requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

#############################################
# Final Frontend Image
#############################################
FROM node:20-alpine AS contractlens-frontend
WORKDIR /app
COPY --from=frontend-builder /app/frontend ./
EXPOSE 3000
CMD ["npm", "start"]

#############################################
# Final Backend Image (runtime only)
#############################################
FROM python:3.13-alpine AS contractlens-backend
WORKDIR /app

# Install only runtime libs needed for Python packages
RUN apk add --no-cache libffi openssl musl

# Copy virtual environment from builder
COPY --from=backend-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy backend source
COPY --from=backend-builder /app/backend ./

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
