# 安装指南

本指南将帮助您快速安装和配置 MalModelScan。

## 📋 环境要求

- **Python**: 3.8+ （推荐 3.11+）
- **Node.js**: 16.0+ （推荐 18.0+）
- **npm**: 7.0+
- **内存**: 最少 4GB RAM
- **磁盘**: 最少 2GB 可用空间

## 🚀 快速安装

### 方法一：一键安装（推荐）

```bash
# 克隆项目
git clone https://github.com/NeilAlfred/malmodelscan.git
cd malmodelscan

# 一键安装和启动
./scripts/start-local.sh
```

### 方法二：手动安装

#### 1. 克隆项目

```bash
git clone https://github.com/NeilAlfred/malmodelscan.git
cd malmodelscan
```

#### 2. 后端安装

```bash
# 创建Python虚拟环境
python -m venv .venv

# 激活虚拟环境
# Linux/macOS:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# 安装Python依赖
pip install -r requirements.txt

# 验证TensorFlow安装
python -c "import tensorflow as tf; print('✅ TensorFlow 安装成功:', tf.__version__)"
```

#### 3. 前端安装

```bash
# 进入前端目录
cd frontend

# 安装Node.js依赖
npm install

# 验证安装
npm --version
node --version
```

#### 4. 启动服务

```bash
# 终端1: 启动后端
cd backend
source ../.venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 5180 --reload

# 终端2: 启动前端
cd frontend
npm run dev
```

## 🐛 常见问题

### Python相关

**问题**: `ImportError: No module named 'tensorflow'`
```bash
# 解决方案：重新安装TensorFlow
pip install --upgrade tensorflow
```

**问题**: 虚拟环境激活失败
```bash
# 确保Python版本正确
python --version  # 应该显示 3.8+

# 手动创建虚拟环境
python -m venv .venv --python=python3
```

### Node.js相关

**问题**: `npm: command not found`
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nodejs npm

# macOS (使用Homebrew)
brew install node

# Windows
# 从 https://nodejs.org 下载安装包
```

**问题**: 依赖安装失败
```bash
# 清理npm缓存并重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TensorFlow相关问题

**问题**: TensorFlow DLL加载错误（Windows）
```bash
# 安装Microsoft Visual C++ Redistributable
# https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist
```

**问题**: CUDA版本不匹配
```bash
# 安装CPU版本TensorFlow
pip install tensorflow-cpu
```

## 🔧 高级配置

### 环境变量配置

**后端环境变量**
```bash
# .env
ENVIRONMENT=development
DEBUG=true
PORT=5180
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

**前端环境变量**
```bash
# frontend/.env.development
VITE_API_BASE_URL=http://127.0.0.1:5180
VITE_APP_TITLE=MalModelScan (开发环境)

# frontend/.env.production
VITE_API_BASE_URL=https://your-backend.com
VITE_APP_TITLE=MalModelScan
```

### 性能优化

**增加上传文件大小限制**
```python
# backend/main.py
app = FastAPI(max_upload_size=100 * 1024 * 1024)  # 100MB
```

**配置扫描超时**
```bash
# 设置扫描超时时间（秒）
export SCAN_TIMEOUT=300
```

## 🧪 验证安装

### 1. 健康检查

```bash
# 检查后端服务
curl http://localhost:5180/health

# 检查前端服务
curl http://localhost:5173
```

### 2. 功能测试

```bash
# 测试TensorFlow模型
python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb

# 测试PyTorch模型
python main.py -m demo_models/data/unsafe_zip_pytorch.pt
```

### 3. Web界面测试

1. 访问 http://localhost:5173
2. 上传测试模型文件
3. 查看扫描结果和历史记录

## 📚 下一步

安装完成后，您可以：

- 📖 阅读[用户指南](user-guide/)了解使用方法
- 🚀 查看[部署指南](deployment/)了解部署选项
- 🔧 参考[开发指南](development/)开始开发

---

如遇到安装问题，请查看[常见问题](../troubleshooting.md)或提交Issue。