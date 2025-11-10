# MalModelScan 部署指南

本指南详细说明了如何将 MalModelScan 项目部署到生产环境。我们提供两种前端部署选择，你可以根据需求选择最适合的方案。

## 🏗️ 部署架构选择

### 选择一：GitHub Pages + 云服务后端（推荐初学者）

```
用户访问流程：
┌─────────────────┐    HTTPS/HTTP    ┌─────────────────┐
│   GitHub Pages  │◄─────────────────►│   云服务 (Render)│
│                 │                   │                 │
│  ┌───────────┐  │    API 请求        │  ┌───────────┐  │
│  │  前端应用   │◄─┼────────────────────┼──►│  后端 API  │  │
│  │ (Vue.js)   │  │                   │  │ (FastAPI) │  │
│  └───────────┘  │                   │  └───────────┘  │
│                 │                   │                 │
└─────────────────┘                   └─────────────────┘
     静态网站托管                            API 服务托管
```

**优点**:
- ✅ 完全免费的前端托管
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 简单的部署流程
- ✅ GitHub 集成

**缺点**:
- ❌ 需要单独的后端服务
- ❌ 后端可能需要付费（超出免费额度）

### 选择二：本地服务器/云服务器全栈部署

```
用户访问流程：
┌─────────────────┐    HTTPS/HTTP    ┌─────────────────┐
│    自己的服务器  │◄─────────────────►│    自己的服务器  │
│                 │                   │                 │
│  ┌───────────┐  │    本地 API 调用  │  ┌───────────┐  │
│  │  前端应用   │◄─┼────────────────────┼──►│  后端 API  │  │
│  │ (Vue.js)   │  │                   │  │ (FastAPI) │  │
│  └───────────┘  │                   │  └───────────┘  │
│                 │                   │                 │
└─────────────────┘                   └─────────────────┘
     静态文件服务 (Nginx)                    后端服务 (uvicorn)
```

**优点**:
- ✅ 完全控制服务器
- ✅ 统一的服务管理
- ✅ 无第三方依赖
- ✅ 数据完全自主
- ✅ 内网部署可能性

**缺点**:
- ❌ 需要服务器运维
- ❌ 需要配置 HTTPS
- ❌ 需要处理安全防护
- ❌ 需要监控和维护

## 📋 如何选择？

### 选择 GitHub Pages 如果你：
- 🆕 **新手用户**，不想管理服务器
- 💰 **预算有限**，希望免费部署
- 🌐 **面向公众**，需要全球访问速度
- 🔄 **项目原型**，快速验证想法
- 👥 **团队协作**，使用 GitHub 工作流

### 选择自托管服务器如果你：
- 🔒 **企业用户**，需要数据隐私
- 🏢 **内部部署**，需要内网访问
- 🎛️ **高级定制**，需要特殊配置
- 📊 **高流量需求**，需要性能优化
- 🔧 **运维能力强**，有技术团队

### 快速对比表

| 特性 | GitHub Pages | 自托管服务器 |
|------|-------------|------------|
| **成本** | 免费 | 需要服务器费用 |
| **维护** | 无需维护 | 需要运维 |
| **控制权** | 有限 | 完全控制 |
| **扩展性** | 中等 | 高 |
| **安全性** | GitHub 负责 | 自己负责 |
| **部署难度** | 简单 | 复杂 |
| **数据隐私** | 公开 | 完全私有 |

## 📋 部署前准备

### 1. 代码仓库准备

```bash
# 确保 Git 已配置
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 提交所有更改
git add .
git commit -m "feat: prepare for deployment"

# 推送到远程仓库
git push origin main
```

### 2. 环境配置检查

```bash
# 验证前端构建
cd frontend
npm run build:prod

# 验证后端启动
cd backend
source ../.venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
# 测试访问：http://localhost:8000/health
```

## 🌐 前端部署方案

### 方案一：GitHub Pages 部署（推荐初学者）

### 方法一：自动部署（推荐）

#### 1. 配置 GitHub Pages

```bash
# 在前端目录
cd frontend

# 确保已安装 gh-pages
npm install gh-pages --save-dev

# 执行部署
npm run deploy
```

#### 2. 启用 GitHub Pages

1. **访问 GitHub 仓库设置**
   - 进入你的 GitHub 仓库
   - 点击 `Settings` 选项卡
   - 在左侧菜单中找到 `Pages`

2. **配置部署源**
   - Source: 选择 `Deploy from a branch`
   - Branch: 选择 `gh-pages`
   - Folder: 选择 `/ (root)`
   - 点击 `Save`

3. **等待部署完成**
   - GitHub 会自动构建和部署
   - 几分钟后你的网站将可以访问

#### 3. 访问你的网站

部署成功后，你的网站将在以下地址可用：
- `https://yourusername.github.io/malmodel-scan/`

### 方法二：GitHub Actions 自动部署

#### 1. 创建 GitHub Actions 工作流

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'

    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'

    - name: Install dependencies
      run: |
        cd frontend
        npm install

    - name: Build
      run: |
        cd frontend
        npm run build:prod

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/dist
        destination_dir: malmodel-scan
```

#### 2. 配置自定义域名（可选）

创建 `CNAME` 文件：
```bash
# 在 frontend/public/ 目录下
echo "yourdomain.com" > frontend/public/CNAME

# 提交更改
git add frontend/public/CNAME
git commit -m "add custom domain"
git push origin main
```

## ☁️ 后端部署 - 云服务

### 方案一：Render（推荐）

#### 1. 准备 Render 部署文件

```yaml
# render.yaml
services:
  - type: web
    name: malmodel-scan-backend
    runtime: python
    plan: free
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.10.0
      - key: PORT
        value: 10000
      - key: ENVIRONMENT
        value: production
      - key: DEBUG
        value: false
      - key: CORS_ORIGINS
        value: "https://yourusername.github.io"
    healthCheckPath: /health
    healthCheckParams:
      intervalSeconds: 30
      timeoutSeconds: 3
      retries: 3
```

```dockerfile
# Dockerfile（可选，用于更高级的配置）
FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 设置环境变量
ENV PYTHONPATH=/app:/app/tensorflow
ENV ENVIRONMENT=production

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. 部署到 Render

1. **注册 Render 账户**
   - 访问 https://render.com/
   - 使用 GitHub 账户注册

2. **创建新服务**
   - 点击 `New +` → `Web Service`
   - 连接你的 GitHub 仓库
   - 选择 `malmodel-scan` 仓库

3. **配置服务**
   - **Name**: `malmodel-scan-backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

4. **设置环境变量**
   ```
   ENVIRONMENT=production
   DEBUG=false
   CORS_ORIGINS=https://yourusername.github.io
   PYTHONPATH=/app:/app/tensorflow
   ```

5. **部署并测试**
   - 点击 `Create Web Service`
   - 等待部署完成
   - 记录生成的 URL

### 方案二：Railway

#### 1. 安装 Railway CLI

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录 Railway
railway login
```

#### 2. 配置 Railway 项目

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "malmodel-scan-backend"

[services.variables]
ENVIRONMENT = "production"
DEBUG = "false"
CORS_ORIGINS = "https://yourusername.github.io"
PYTHONPATH = "/app:/app/tensorflow"
```

#### 3. 部署到 Railway

```bash
# 初始化 Railway 项目
railway init

# 部署
railway up

# 查看日志
railway logs
```

### 方案三：Vercel（Serverless）

#### 1. 创建 Vercel 配置

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ],
  "env": {
    "ENVIRONMENT": "production",
    "DEBUG": "false",
    "CORS_ORIGINS": "https://yourusername.github.io"
  }
}
```

#### 2. 适配 Vercel 的后端代码

```python
# backend/api/index.py
import os
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.append(str(Path(__file__).parent.parent))

from main import app

# Vercel 处理程序
def handler(request):
    return app(request.scope, receive, send)
```

## 🔧 生产环境配置

### 1. 前端生产配置

```bash
# frontend/.env.production
VITE_API_BASE_URL=https://your-backend-service.onrender.com
VITE_APP_TITLE=MalModelScan - AI模型安全检查工具
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=专业的机器学习模型安全扫描工具
```

### 2. 后端生产配置

```python
# backend/.env
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://yourusername.github.io,https://yourdomain.com
MAX_FILE_SIZE=104857600
PYTHONPATH=/app:/app/tensorflow

# 安全配置
SECURE_COOKIES=true
ALLOWED_HOSTS=your-backend-service.onrender.com
RATE_LIMIT_ENABLED=true
```

### 3. 更新后端 CORS 配置

```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourusername.github.io",
        "https://yourdomain.com",  # 自定义域名
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧪 部署验证

### 1. 前端验证

```bash
# 访问前端网站
https://yourusername.github.io/malmodel-scan/

# 检查控制台错误
# 检查网络请求
# 验证 API 连接状态
```

### 2. 后端验证

```bash
# 健康检查
curl https://your-backend-service.onrender.com/health

# API 测试
curl -X POST "https://your-backend-service.onrender.com/api/upload" \
  -F "file=@demo_models/tensorabuse_savedmodel/saved_model.pb"
```

### 3. 集成测试

```bash
# 测试完整流程
# 1. 在前端网站上上传测试文件
# 2. 验证扫描结果展示
# 3. 检查扫描历史功能
# 4. 验证错误处理
```

## 📊 监控和维护

### 1. 性能监控

```python
# 添加性能监控
import time
import logging

@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    # 记录慢请求
    if process_time > 5.0:
        logging.warning(f"Slow request: {request.url} took {process_time:.2f}s")

    return response
```

### 2. 错误监控

```python
# 添加错误日志
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### 3. 健康检查增强

```python
# backend/health.py
import psutil
import os
from datetime import datetime

async def health_check():
    """增强的健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "uptime": os.popen('uptime').read().strip(),
        "memory_usage": psutil.virtual_memory().percent,
        "disk_usage": psutil.disk_usage('/').percent,
        "cpu_count": psutil.cpu_count()
    }
```

## 🔒 安全配置

### 1. HTTPS 配置

GitHub Pages 自动提供 HTTPS。对于后端服务：

```python
# 强制 HTTPS
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
```

### 2. 安全头配置

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["your-backend-service.onrender.com", "*.github.io"]
)
```

### 3. 速率限制

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

@app.get("/api/upload")
@limiter.limit("5/minute")
async def upload_file():
    # 限制上传频率
    pass
```

## 🔄 CI/CD 自动化

### GitHub Actions 示例

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest

    - name: Run tests
      run: pytest tests/

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4

    - name: Deploy to Render
      run: |
        curl -X POST https://api.render.com/v1/services \
          -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
          -H "Content-Type: application/json" \
          -d '{"serviceId": "your-service-id"}'

    - name: Deploy Frontend
      run: |
        cd frontend
        npm install
        npm run deploy
```

## 📞 故障排除

### 常见问题

1. **CORS 错误**
   - 检查后端 CORS 配置
   - 确保前端域名在允许列表中

2. **API 连接失败**
   - 检查后端服务状态
   - 验证 API URL 配置

3. **文件上传失败**
   - 检查文件大小限制
   - 验证支持的文件格式

4. **部署失败**
   - 检查构建日志
   - 验证依赖安装

### 调试工具

```bash
# 查看后端日志
curl https://your-backend-service.onrender.com/logs

# 检查网络连接
curl -v https://your-backend-service.onrender.com/health

# 监控 API 请求
# 在浏览器开发者工具中查看 Network 标签
```

---

## 🏠 方案二：本地服务器/云服务器全栈部署

### 服务器要求

#### 最低配置
- **CPU**: 2核心
- **内存**: 4GB RAM
- **存储**: 20GB SSD
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 10+

#### 推荐配置
- **CPU**: 4核心
- **内存**: 8GB RAM
- **存储**: 50GB SSD
- **网络**: 100Mbps 带宽

### 系统准备

#### 1. 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim nginx python3 python3-pip python3-venv

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应该是 v18.x
npm --version
python3 --version  # 应该是 3.8+
```

#### 2. 安装和配置 Nginx

```bash
# 安装 Nginx
sudo apt install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证 Nginx 状态
sudo systemctl status nginx
```

#### 3. 配置防火墙

```bash
# 配置 UFW 防火墙
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 或者使用 iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT   # SSH
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT   # HTTP
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT  # HTTPS
```

### 应用部署

#### 1. 部署应用代码

```bash
# 创建应用目录
sudo mkdir -p /opt/malmodel-scan
sudo chown $USER:$USER /opt/malmodel-scan
cd /opt/malmodel-scan

# 克隆代码
git clone <your-repository-url> .

# 或者上传代码包
# scp -r malmodel-scan user@server:/opt/
```

#### 2. 配置 Python 环境

```bash
# 创建虚拟环境
python3 -m venv .venv
source .venv/bin/activate

# 安装依赖
pip install --upgrade pip
pip install -r requirements.txt

# 安装 Gunicorn（生产级 WSGI 服务器）
pip install gunicorn
```

#### 3. 配置环境变量

```bash
# 创建生产环境配置
sudo tee backend/.env > /dev/null <<EOF
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=https://yourdomain.com,http://yourdomain.com
MAX_FILE_SIZE=104857600
PYTHONPATH=/opt/malmodel-scan:/opt/malmodel-scan/tensorflow
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com,your-server-ip
EOF
```

#### 4. 构建前端应用

```bash
# 构建前端
cd frontend
npm install
npm run build:prod

# 验证构建结果
ls -la dist/
```

### 服务配置

#### 1. 配置 Nginx

```bash
# 创建 Nginx 配置文件
sudo tee /etc/nginx/sites-available/malmodel-scan > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 前端静态文件
    location / {
        root /opt/malmodel-scan/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;

        # 缓存设置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # 文件上传大小限制
        client_max_body_size 100M;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 拒绝访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/malmodel-scan /etc/nginx/sites-enabled/

# 删除默认站点
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 2. 创建 Systemd 服务

```bash
# 创建后端服务文件
sudo tee /etc/systemd/system/malmodel-scan-backend.service > /dev/null <<EOF
[Unit]
Description=MalModelScan Backend Service
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/opt/malmodel-scan
Environment=PATH=/opt/malmodel-scan/.venv/bin
ExecStart=/opt/malmodel-scan/.venv/bin/gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable malmodel-scan-backend
sudo systemctl start malmodel-scan-backend

# 检查服务状态
sudo systemctl status malmodel-scan-backend
```

### SSL 证书配置

#### 使用 Let's Encrypt (推荐)

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 或者使用自签名证书（仅用于测试）

```bash
# 生成自签名证书
sudo mkdir -p /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/malmodel-scan-selfsigned.key \
    -out /etc/ssl/certs/malmodel-scan-selfsigned.crt

# 更新 Nginx 配置使用自签名证书
sudo sed -i 's|/etc/letsencrypt/|/etc/ssl/|g' /etc/nginx/sites-available/malmodel-scan
sudo nginx -t && sudo systemctl reload nginx
```

### 监控和日志

#### 1. 配置日志轮转

```bash
# 创建日志轮转配置
sudo tee /etc/logrotate.d/malmodel-scan > /dev/null <<EOF
/opt/malmodel-scan/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload malmodel-scan-backend
    endscript
}
EOF
```

#### 2. 设置监控脚本

```bash
# 创建监控脚本
sudo tee /opt/malmodel-scan/scripts/monitor.sh > /dev/null <<'EOF'
#!/bin/bash

# 健康检查脚本
HEALTH_URL="http://localhost:8000/health"
LOG_FILE="/var/log/malmodel-scan-monitor.log"

check_health() {
    response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
    if [ "$response" != "200" ]; then
        echo "$(date): Health check failed (HTTP $response)" >> $LOG_FILE
        systemctl restart malmodel-scan-backend
        echo "$(date): Service restarted" >> $LOG_FILE
    fi
}

check_health
EOF

chmod +x /opt/malmodel-scan/scripts/monitor.sh

# 添加到 crontab（每5分钟检查一次）
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/malmodel-scan/scripts/monitor.sh") | crontab -
```

### 备份策略

#### 1. 数据备份

```bash
# 创建备份脚本
sudo tee /opt/malmodel-scan/scripts/backup.sh > /dev/null <<'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/malmodel-scan"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份应用数据
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" \
    /opt/malmodel-scan/backend/uploads/ \
    /opt/malmodel-scan/backend/scan_history.json \
    /opt/malmodel-scan/.env

# 保留最近30天的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: app_$DATE.tar.gz"
EOF

chmod +x /opt/malmodel-scan/scripts/backup.sh

# 设置每日备份
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/malmodel-scan/scripts/backup.sh") | crontab -
```

### 验证部署

#### 1. 检查所有服务

```bash
# 检查 Nginx
sudo systemctl status nginx

# 检查后端服务
sudo systemctl status malmodel-scan-backend

# 检查端口监听
sudo netstat -tlnp | grep -E ':(80|443|8000)'

# 检查磁盘空间
df -h /opt/malmodel-scan
```

#### 2. 测试功能

```bash
# 测试健康检查
curl https://yourdomain.com/health

# 测试文件上传
curl -X POST "https://yourdomain.com/api/upload" \
  -F "file=@/opt/malmodel-scan/demo_models/tensorabuse_savedmodel/saved_model.pb"

# 测试前端访问
curl -I https://yourdomain.com/
```

---

**🎉 恭喜！你的 MalModelScan 应用现在已经成功部署到自己的服务器！**