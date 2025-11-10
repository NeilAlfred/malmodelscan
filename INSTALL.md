# MalModelScan 安装和配置指南

本指南将帮助你完整地安装和配置 MalModelScan 项目的开发环境。

## 📋 系统要求

### 操作系统支持
- ✅ Linux (Ubuntu 18.04+, CentOS 7+, Debian 9+)
- ✅ macOS 10.14+
- ✅ Windows 10+

### 必需软件

#### Python 环境
- **版本**: Python 3.8 或更高版本
- **推荐**: Python 3.10 或 3.11

#### Node.js 环境
- **版本**: Node.js 16.0 或更高版本
- **推荐**: Node.js 18.x LTS

#### 包管理器
- **npm**: 7.0 或更高版本（随 Node.js 安装）
- **pip**: 随 Python 安装

## 🔍 环境检查

### 检查 Python 环境

```bash
# 检查 Python 版本
python3 --version
# 或
python --version

# 检查 pip 版本
pip3 --version
# 或
pip --version

# 检查 Python 路径
which python3
which pip3
```

### 检查 Node.js 环境

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查 npm 配置
npm config list
```

## 📦 安装步骤

### 第一步：获取项目代码

```bash
# 如果是从 GitHub 克隆
git clone https://github.com/yourusername/malmodel_scan.git
cd malmodel_scan

# 如果是本地已有代码，确保在项目根目录
cd /path/to/malmodel_scan
```

### 第二步：安装和配置 Python 环境

#### 方法一：使用系统 Python（推荐用于测试）

```bash
# 1. 创建虚拟环境
python3 -m venv .venv

# 2. 激活虚拟环境
# Linux/macOS:
source .venv/bin/activate

# Windows:
.venv\Scripts\activate

# 3. 升级 pip
pip install --upgrade pip

# 4. 安装项目依赖
pip install -r requirements.txt

# 5. 验证关键依赖
python -c "
import sys
sys.path.append('tensorflow')
try:
    import tensorflow as tf
    print('✅ TensorFlow 导入成功')
except ImportError as e:
    print(f'❌ TensorFlow 导入失败: {e}')

try:
    import h5py
    print('✅ h5py 导入成功')
except ImportError as e:
    print(f'❌ h5py 导入失败: {e}')

try:
    import numpy
    print('✅ numpy 导入成功')
except ImportError as e:
    print(f'❌ numpy 导入失败: {e}')
"
```

#### 方法二：使用 Conda（推荐用于开发）

```bash
# 1. 创建 Conda 环境
conda create -n malmodel-scan python=3.10

# 2. 激活环境
conda activate malmodel-scan

# 3. 安装依赖
pip install -r requirements.txt

# 4. 验证安装
python -c "import tensorflow as tf; print('✅ TensorFlow 安装成功')"
```

### 第三步：安装和配置 Node.js 环境

```bash
# 1. 进入前端目录
cd frontend

# 2. 检查并安装依赖
npm install

# 3. 验证关键依赖
npm list vue
npm list vite
npm list @vitejs/plugin-vue

# 4. 返回项目根目录
cd ..
```

### 第四步：配置环境变量

#### 前端环境配置

```bash
# 进入前端目录
cd frontend

# 检查环境变量文件
ls -la .env*

# 开发环境配置（默认已存在）
cat .env.development

# 生产环境配置（需要修改后端地址）
cat .env.production
```

#### 后端环境配置

```bash
# 创建后端环境配置文件
cd backend
cat > .env << EOF
# 后端环境配置
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAX_FILE_SIZE=104857600
PYTHONPATH=/path/to/malmodel_scan:/path/to/malmodel_scan/tensorflow
EOF

# 返回项目根目录
cd ..
```

## 🚀 启动和验证

### 验证安装

```bash
# 1. 检查项目结构
ls -la
ls -la frontend/
ls -la backend/
ls -la TensorDetect/
ls -la modelscan/

# 2. 验证 Python 脚本
python main.py --help

# 3. 验证前端构建
cd frontend
npm run build:prod
npm run preview  # 预览构建结果
cd ..
```

### 启动服务

#### 方法一：使用启动脚本（推荐）

```bash
# 启动完整应用
./scripts/start-local.sh

# 或者只启动后端
./scripts/start.sh
```

#### 方法二：手动启动

```bash
# 终端1：启动后端
cd backend
# 激活虚拟环境
source ../.venv/bin/activate
# 启动服务
uvicorn main:app --host 127.0.0.1 --port 5180 --reload

# 终端2：启动前端
cd frontend
npm run dev
```

### 验证服务运行

```bash
# 检查后端健康状态
curl http://127.0.0.1:5180/health

# 检查前端访问
# 在浏览器中打开：http://localhost:5173

# 检查 API 文档
# 在浏览器中打开：http://127.0.0.1:5180/docs
```

## 🔧 常见问题解决

### Python 相关问题

#### 1. Python 版本不兼容

```bash
# 解决方案：使用 pyenv 管理 Python 版本
# 安装 pyenv
curl https://pyenv.run | bash

# 安装 Python 3.10
pyenv install 3.10.12

# 设置项目 Python 版本
pyenv local 3.10.12

# 重新创建虚拟环境
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### 2. TensorFlow 导入失败

```bash
# 检查 Python 路径
python -c "import sys; print(sys.path)"

# 确保 tensorflow 目录在 Python 路径中
export PYTHONPATH="${PYTHONPATH}:$(pwd):$(pwd)/tensorflow"

# 验证导入
python -c "import sys; sys.path.append('tensorflow'); import tensorflow as tf; print('✅ 成功')"
```

#### 3. 依赖安装失败

```bash
# 升级 pip 和 setuptools
pip install --upgrade pip setuptools wheel

# 使用国内镜像源（中国用户）
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/

# 或者配置永久镜像源
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple/
```

### Node.js 相关问题

#### 1. Node.js 版本过低

```bash
# 解决方案：使用 nvm 管理 Node.js 版本
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell
source ~/.bashrc

# 安装 Node.js 18 LTS
nvm install 18
nvm use 18

# 验证安装
node --version
npm --version
```

#### 2. npm 权限问题

```bash
# 解决方案：配置 npm 全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# 添加到 shell 配置
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 重新安装依赖
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 3. 网络连接问题

```bash
# 配置 npm 镜像源
npm config set registry https://registry.npmmirror.com/

# 或者使用 yarn
npm install -g yarn
cd frontend
yarn install
```

### 端口占用问题

```bash
# 检查端口占用
lsof -i :5180  # 后端端口
lsof -i :5173  # 前端端口

# 杀死占用进程
kill -9 <PID>

# 或者更改端口
# 后端：uvicorn main:app --host 127.0.0.1 --port 5181 --reload
# 前端：npm run dev -- --port 5174
```

### SSH 访问问题（远程开发）

```bash
# 1. 修改 Vite 配置，允许外部访问
# 在 frontend/vite.config.ts 中：
server: {
  host: '0.0.0.0',  # 监听所有接口
  port: 5173
},
preview: {
  host: '0.0.0.0',  # 监听所有接口
  port: 4173
}

# 2. SSH 端口转发
ssh -L 5173:localhost:5173 user@server
ssh -L 4173:localhost:4173 user@server

# 3. 本地访问
# http://localhost:5173  # 开发模式
# http://localhost:4173  # 预览模式
```

## 📚 开发工具配置

### VS Code 配置

```json
// .vscode/settings.json
{
  "python.defaultInterpreterPath": "./.venv/bin/python",
  "python.linting.enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### 推荐插件

- **Python**: Python, Pylance, Black Formatter
- **Vue**: Vue Language Features (Volar), TypeScript Vue Plugin
- **通用**: GitLens, Docker, Remote SSH

## 🧪 测试安装

### 基础功能测试

```bash
# 1. 测试命令行扫描
python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb

# 2. 测试API接口
curl -X POST "http://127.0.0.1:5180/api/upload" \
  -F "file=@demo_models/tensorabuse_savedmodel/saved_model.pb"

# 3. 测试前端上传
# 访问 http://localhost:5173 并上传测试文件
```

### 性能测试

```bash
# 测试大文件处理
time python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb

# 测试并发请求
for i in {1..3}; do
  curl -X POST "http://127.0.0.1:5180/api/upload" \
    -F "file=@demo_models/tensorabuse_savedmodel/saved_model.pb" &
done
wait
```

## 📞 获取帮助

如果遇到问题，请按以下顺序排查：

1. **查看本文档**的常见问题部分
2. **检查项目日志**：后端控制台输出、前端浏览器控制台
3. **查看错误信息**：完整的错误堆栈信息
4. **查阅项目文档**：README.md, CLAUDE.md
5. **提交Issue**：在 GitHub 仓库创建新Issue

---

**🎉 恭喜！你已经成功安装和配置了 MalModelScan 项目！**