# ── Stage 1: deps — install only (used by dev compose) ───────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile


# ── Stage 2: builder — compile for production (used by prod/staging compose) ──
FROM deps AS builder
ARG VITE_API_BASE_URL
ARG VITE_CARDS_PUBLIC_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CARDS_PUBLIC_URL=$VITE_CARDS_PUBLIC_URL
COPY . .
RUN pnpm build


# ── Stage 3: runner — nginx serves static files ───────────────────────────────
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
RUN printf 'server {\n\
  listen 5173;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
