# 部署指南

MalModelScan支持多种部署方式，从本地开发到生产环境都有合适的方案。

## 🚀 部署方案选择

| 部署方式 | 适用场景 | 成本 | 维护复杂度 |
|---------|---------|------|------------|
| **本地开发** | 开发测试 | 免费 | 低 |
| **GitHub Pages + Render** | 个人项目、演示 | 免费 | 中 |
| **自托管服务器** | 企业应用、数据敏感 | 需要服务器 | 高 |
| **Docker容器** | 标准化部署 | 低 | 中 |
| **云服务** | 快速部署 | 按需付费 | 低 |

## 🏠 本地开发部署

### 快速启动

```bash
# 克隆项目
git clone https://github.com/NeilAlfred/malmodelscan.git
cd malmodelscan

# 一键启动
./scripts/start-local.sh
```

访问地址：
- 前端：http://localhost:5173
- 后端：http://localhost:5180
- API文档：http://localhost:5180/docs

### 手动启动

```bash
# 终端1：启动后端
cd backend
source ../.venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 5180 --reload

# 终端2：启动前端
cd frontend
npm run dev
```

## 🌐 GitHub Pages + Render（推荐个人项目）

### 前端部署到GitHub Pages

```bash
# 1. 构建前端
cd frontend
npm run build
npm run deploy

# 2. 配置GitHub Pages
# 访问：GitHub仓库 → Settings → Pages
# 选择：gh-pages分支
# 访问：https://yourusername.github.io/malmodelscan/
```

### 后端部署到Render

1. **登录Render控制台**
   - 访问 https://dashboard.render.com
   - 使用GitHub账号登录

2. **创建New Web Service**
   - 连接GitHub仓库
   - 选择根目录
   - 设置构建命令：`pip install -r requirements.txt`
   - 设置启动命令：`uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **配置环境变量**
   ```bash
   CORS_ORIGINS=https://yourusername.github.io,http://localhost:5173
   PORT=10000
   ```

4. **部署完成**
   - 自动部署，获得API地址：`https://your-app.onrender.com`

### 配置前端连接后端

修改 `frontend/.env.production`：
```bash
VITE_API_BASE_URL=https://your-app.onrender.com
VITE_APP_TITLE=MalModelScan
```

重新部署前端：
```bash
npm run deploy
```

## 🏢 自托管服务器部署

### 系统要求

- **操作系统**: Linux (推荐 Ubuntu 20.04+)
- **CPU**: 2核心以上
- **内存**: 4GB以上
- **存储**: 20GB以上
- **网络**: 稳定的网络连接

### 部署步骤

#### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip -y

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装Nginx
sudo apt install nginx -y
```

#### 2. 部署应用

```bash
# 克隆项目
git clone https://github.com/NeilAlfred/malmodelscan.git
cd malmodelscan

# 后端部署
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 前端构建
cd frontend
npm install
npm run build
cp -r dist/* /var/www/html/
cd ..

# 创建systemd服务
sudo tee /etc/systemd/system/malmodelscan-backend.service > /dev/null <<EOF
[Unit]
Description=MalModelScan Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/ubuntu/malmodelscan
Environment=PATH=/home/ubuntu/malmodelscan/.venv/bin
ExecStart=/home/ubuntu/malmodelscan/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 5180
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable malmodelscan-backend
sudo systemctl start malmodelscan-backend
```

#### 3. 配置Nginx

```bash
sudo tee /etc/nginx/sites-available/malmodelscan > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/html;
        try_files \$uri \$uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:5180;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket支持
    location /ws {
        proxy_pass http://127.0.0.1:5180;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/malmodelscan /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. HTTPS配置（可选）

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Docker部署

### 创建Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 5180

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5180"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5180:5180"
    environment:
      - CORS_ORIGINS=http://localhost:5173
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
```

### 启动Docker

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## ☁️ 云服务部署

### AWS部署

```bash
# 使用AWS CLI部署后端
aws ecs create-cluster --cluster-name malmodelscan
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster malmodelscan --service-name malmodelscan-backend
```

### Google Cloud Platform

```bash
# 使用Cloud Run部署
gcloud run deploy malmodelscan-backend \
  --image gcr.io/your-project/malmodelscan \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Microsoft Azure

```bash
# 使用Azure Container Instances
az container create \
  --resource-group malmodelscan-rg \
  --name malmodelscan-backend \
  --image yourregistry.azurecr.io/malmodelscan \
  --cpu 1 \
  --memory 2
```

## 🔧 部署配置

### 环境变量

**生产环境推荐配置**：
```bash
# 后端环境变量
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://yourdomain.com
MAX_FILE_SIZE=104857600  # 100MB
SCAN_TIMEOUT=300
```

### 性能优化

**后端优化**：
```bash
# 增加工作进程
uvicorn main:app --host 0.0.0.0 --port 5180 --workers 4

# 启用压缩
pip install "uvicorn[gzip]"
```

**前端优化**：
```bash
# 启用生产模式优化
npm run build:prod

# 配置缓存头
# 在nginx或CDN中配置静态资源缓存
```

## 📊 监控和维护

### 健康检查

```bash
# 系统服务状态
sudo systemctl status malmodelscan-backend

# 应用健康检查
curl http://localhost:5180/health

# 日志监控
sudo journalctl -u malmodelscan-backend -f
```

### 备份策略

```bash
# 数据备份
tar -czf backup-$(date +%Y%m%d).tar.gz uploads/ scan_history.json

# 配置文件备份
cp -r /etc/nginx/sites-available/ backup/
```

### 更新部署

```bash
# 拉取最新代码
git pull origin main

# 后端更新
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart malmodelscan-backend

# 前端更新
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

---

根据您的需求选择合适的部署方案。如需帮助，请参考具体部署方案文档或提交Issue。