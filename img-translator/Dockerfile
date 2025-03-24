# 基础镜像
FROM node:16-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装依赖
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 构建应用
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 生产环境
FROM base AS runner
ENV NODE_ENV production

# 设置用户权限
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# 拷贝构建结果和依赖
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 暴露端口
EXPOSE 3000

# 启动命令
ENV PORT 3000
CMD ["npm", "start"] 