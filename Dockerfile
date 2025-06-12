# Multi-stage Dockerfile for ContractLens

# Stage 1: Backend
FROM python:3.11-slim AS backend

# Set working directory
WORKDIR /app/backend

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Expose FastAPI port
EXPOSE 8000

# Command to run FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Stage 2: Frontend
FROM node:20-alpine AS frontend

# Set working directory
WORKDIR /app/frontend

# Install dependencies
COPY SaaS/package.json SaaS/package-lock.json ./
RUN npm install

# Copy frontend source code
COPY SaaS/ .

# Build Next.js app
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Command to start Next.js server
CMD ["npm", "start"]
