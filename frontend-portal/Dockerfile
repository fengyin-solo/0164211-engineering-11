# 构建阶段
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci --registry=https://registry.npmmirror.com

# 复制源代码
COPY . .

# 上线前检查（与本地同一套标准：类型校验 + 代码检查）
# Dockerfile 上一步已按 lockfile 安装依赖，跳过 check 的重复安装步骤
ENV CHECK_SKIP_INSTALL=1
RUN npm run check

# 构建
RUN npm run build

# 运行阶段
FROM --platform=$TARGETPLATFORM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
