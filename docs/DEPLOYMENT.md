# 🚀 SpendPulse Production Deployment Guide

SpendPulse can be deployed as a static web application on edge platforms (Vercel, Netlify, Cloudflare Pages, GitHub Pages) or as a containerized full-stack application with Docker.

---

## 1. Static Edge Deployment (Recommended for Frontend)

Since SpendPulse uses an offline-first architecture with native client-side PDF and CSV report compilation, the frontend can be deployed statically with zero backend required.

### Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run from the `frontend/` directory:
   ```bash
   cd frontend
   vercel
   ```
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`

### Netlify
1. Connect your GitHub repository on Netlify.
2. Build Settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

---

## 2. Docker & Docker Compose (Full-Stack Deployment)

To run both the React frontend and FastAPI backend together using Docker:

### `Dockerfile` (Frontend)
```dockerfile
# Stage 1: Build React App
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### `Dockerfile` (Backend)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 3. Environment Variables

| Variable | Target | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Frontend | `http://localhost:8000` | Optional backend API base URL |
| `DATABASE_URL` | Backend | `sqlite:///./spendpulse.db` | Database connection string |
| `PORT` | Backend | `8000` | Server HTTP port |
