      
# frontend-app/Dockerfile

# --- Build Stage ---
# 使用 Node.js 镜像进行构建
FROM node:22-alpine as builder
WORKDIR /app

# 全局安装pnpm
RUN npm install -g pnpm

# 设置镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 复制 package.json 和 lock 文件
COPY package.json pnpm-lock.yaml ./
# 或者如果你用 npm:
# COPY package.json package-lock.json ./

# 安装依赖
RUN pnpm install --frozen-lockfile
# 或者如果你用 npm:
# RUN npm ci

# 复制项目文件
COPY . .

# 构建生产版本的静态文件 (通常在 build 或 dist 目录)
RUN pnpm build
# 或者如果你用 npm:
# RUN npm run build

# --- Production Stage ---
# 使用 Nginx 镜像托管静态文件
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# 删除 Nginx 默认的欢迎页面
RUN rm -rf ./*

# 从构建阶段复制构建好的静态文件
COPY --from=builder /app/dist .
# 注意: React build 的输出目录可能是 'build' 或 'dist'，请根据实际情况修改

# 复制自定义的 Nginx 配置 (用于处理 React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 Nginx 默认的 80 端口
EXPOSE 80

# Nginx 默认会启动，不需要 CMD 或 ENTRYPOINT

    
