# MalModelScan - AI模型安全检查工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-green.svg)](https://vuejs.org/)

专业的机器学习模型安全扫描工具，支持检测 TensorFlow、PyTorch、Pickle 等主流格式模型中的潜在安全风险和恶意代码。

## ✨ 功能特性

- 🔍 **多格式支持**: TensorFlow (.h5, .pb), PyTorch (.pt, .pth), Pickle (.pkl), ONNX, TFLite
- 🛡️ **双重扫描引擎**: TensorDetect (TensorFlow专用) + ModelScan (通用格式)
- 📊 **详细分析**: 提取算子名称、安全能力分类、风险评估
- 🌐 **Web界面**: 现代化Vue 3界面，支持拖拽上传、实时进度
- 📱 **响应式设计**: 支持桌面和移动设备
- 🔄 **实时监控**: 扫描状态实时更新，历史记录管理
- 🌍 **中英双语**: 界面本地化支持

## 🏗️ 项目架构

```
malmodel_scan/
├── frontend/                 # Vue 3 前端应用
│   ├── src/
│   │   ├── components/      # Vue组件
│   │   ├── views/          # 页面视图
│   │   ├── services/       # API服务
│   │   └── config/         # 环境配置
│   ├── dist/               # 构建输出
│   └── package.json        # 前端依赖
├── backend/                  # FastAPI 后端服务
│   ├── main.py             # 主服务文件
│   ├── uploads/            # 临时文件目录
│   └── requirements.txt    # Python依赖
├── TensorDetect/             # TensorFlow扫描引擎
│   ├── TDmodel.py          # 模型类型检测
│   ├── TDscan.py           # TensorFlow扫描逻辑
│   ├── TDissue.py          # 问题分类
│   └── TDsettings.py       # 恶意操作配置
├── modelscan/                # 通用模型扫描框架
│   ├── scanners/           # 格式特定扫描器
│   ├── middlewares/        # 处理管道
│   └── reports.py          # 报告生成
├── tensorflow/               # 精简版TensorFlow依赖
├── demo_models/              # 测试模型文件
├── scripts/                  # 工具脚本
└── docs/                     # 文档目录
```

## 🚀 快速开始

### 环境要求

- **Python**: 3.8 或更高版本
- **Node.js**: 16.0 或更高版本
- **npm**: 7.0 或更高版本

### 一键启动（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd malmodel_scan

# 一键启动前后端服务
./scripts/start-local.sh
```

这将自动：
1. 设置 Python 虚拟环境
2. 安装前后端依赖
3. 启动后端服务 (http://127.0.0.1:5180)
4. 启动前端服务 (http://localhost:5173)
5. 提供优雅的关闭机制 (Ctrl+C)

### 📋 选择部署方案

我们提供两种部署选择，根据你的需求选择：

#### 方案一：GitHub Pages + 云服务后端（推荐新手）
- **特点**: 免费、简单、全球 CDN 加速
- **适合**: 个人项目、原型验证、公开演示
- **成本**: 前端免费，后端免费额度内免费
- **文档**: [详细部署指南](DEPLOYMENT.md#方案一github-pages-云服务后端推荐初学者)

#### 方案二：自托管服务器（推荐企业）
- **特点**: 完全控制、数据私有、可定制
- **适合**: 企业应用、内网部署、数据敏感
- **成本**: 需要服务器费用，完全自主
- **文档**: [详细部署指南](DEPLOYMENT.md#方案二本地服务器云服务器全栈部署)

| 特性 | GitHub Pages | 自托管服务器 |
|------|-------------|------------|
| **成本** | 免费 | 需要服务器费用 |
| **维护** | 无需维护 | 需要运维 |
| **控制权** | 有限 | 完全控制 |
| **扩展性** | 中等 | 高 |
| **安全性** | GitHub 负责 | 自己负责 |
| **部署难度** | 简单 | 复杂 |
| **数据隐私** | 公开 | 完全私有 |

### 手动安装和启动

#### 1. 安装后端

```bash
# 进入项目根目录
cd malmodel_scan

# 创建Python虚拟环境
python -m venv .venv

# 激活虚拟环境
# Linux/macOS:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# 安装Python依赖
pip install -r requirements.txt

# 验证安装
python -c "import sys; sys.path.append('tensorflow'); import tensorflow as tf; print('✅ TensorFlow 导入成功')"
```

#### 2. 安装前端

```bash
# 进入前端目录
cd frontend

# 安装Node.js依赖
npm install

# 验证安装
npm --version
node --version
```

#### 3. 启动服务

**方法一：分别启动**

```bash
# 终端1: 启动后端
cd backend
source venv/bin/activate  # 如果使用独立虚拟环境
uvicorn main:app --host 127.0.0.1 --port 5180 --reload

# 终端2: 启动前端
cd frontend
npm run dev
```

**方法二：使用脚本**

```bash
# 启动后端服务
./scripts/start.sh

# 或者启动完整应用
./scripts/start-local.sh
```

## 🌐 访问地址

启动成功后，你可以通过以下地址访问：

- **前端界面**: http://localhost:5173
- **后端API**: http://127.0.0.1:5180
- **API文档**: http://127.0.0.1:5180/docs
- **健康检查**: http://127.0.0.1:5180/health

## 📋 使用指南

### Web界面使用

1. **上传模型文件**
   - 拖拽模型文件到上传区域，或点击浏览按钮选择文件
   - 支持的格式：.h5, .pb, .pkl, .pt, .pth, .onnx, .tflite
   - 文件大小限制：100MB

2. **查看扫描结果**
   - 实时显示扫描进度
   - 详细的算子信息和安全能力分析
   - 按严重程度分类的风险报告

3. **管理扫描历史**
   - 查看所有扫描记录
   - 对比不同模型的扫描结果
   - 清除历史记录

### 命令行使用

```bash
# 直接扫描模型文件
python main.py -m /path/to/model.h5

# 使用测试模型
python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb
python main.py -m demo_models/lambda_savedmodel/
python main.py -m demo_models/data/example.pkl

# 查看帮助
python main.py --help
```

### API使用

```bash
# 健康检查
curl http://127.0.0.1:5180/health

# 上传模型扫描
curl -X POST "http://127.0.0.1:5180/api/upload" \
  -F "file=@demo_models/tensorabuse_savedmodel/saved_model.pb"

# 查看扫描状态
curl http://127.0.0.1:5180/api/scan/status/{scan_id}

# 获取扫描结果
curl http://127.0.0.1:5180/api/scan/result/{scan_id}

# 查看扫描历史
curl http://127.0.0.1:5180/api/scans/history
```

## 🔧 开发指南

### 本地开发

```bash
# 前端开发模式
cd frontend
npm run dev

# 后端开发模式
cd backend
uvicorn main:app --host 127.0.0.1 --port 5180 --reload --log-level debug
```

### 构建和部署

```bash
# 构建前端
cd frontend
npm run build

# 预览构建结果
npm run preview

# 打包为可执行文件
./scripts/package.sh
```

### 环境配置

**前端环境变量**
```bash
# .env.development
VITE_API_BASE_URL=http://127.0.0.1:5180
VITE_APP_TITLE=MalModelScan (开发环境)

# .env.production
VITE_API_BASE_URL=https://your-backend-service.onrender.com
VITE_APP_TITLE=MalModelScan
```

**后端环境变量**
```bash
# 开发环境
export ENVIRONMENT=development
export DEBUG=true

# 生产环境
export ENVIRONMENT=production
export DEBUG=false
export CORS_ORIGINS="https://yourdomain.com"
```

## 🧪 测试

### 使用测试模型

项目提供了多个测试模型：

```bash
# TensorFlow SavedModel（推荐测试）
python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb

# TensorFlow H5格式
python main.py -m demo_models/lambda_savedmodel/

# Pickle格式
python main.py -m demo_models/data/example.pkl
```

### 压力测试

```bash
# 测试文件上传限制
find demo_models/ -name "*.pb" -exec curl -X POST "http://127.0.0.1:5180/api/upload" -F "file=@{}" \;

# 并发测试
for i in {1..5}; do
  curl -X POST "http://127.0.0.1:5180/api/upload" \
    -F "file=@demo_models/tensorabuse_savedmodel/saved_model.pb" &
done
wait
```

## 📊 支持的模型格式

### TensorFlow 模型 (TensorDetect扫描器)
- **.h5, .hdf5** - TensorFlow HDF5 格式
- **.pb** - TensorFlow SavedModel Protocol Buffer
- **完整功能**: ✅ 算子提取、安全能力分类

### 通用ML模型 (ModelScan扫描器)
- **.pkl, .pickle** - Python Pickle 序列化格式
- **.pt, .pth** - PyTorch 模型格式
- **.onnx** - ONNX 开放神经网络交换格式
- **.tflite** - TensorFlow Lite 移动端格式
- **基础扫描**: 🚧 通用安全检测

## 🛡️ 安全检测能力

### TensorFlow特定威胁
- 恶意TensorFlow操作检测
- 网络访问能力识别
- 文件系统访问检测
- 调试操作数据泄露风险
- 分布式计算安全风险

### 通用ML安全威胁
- 不安全反序列化模式
- 代码注入检测
- 可疑导入和模块加载
- 越界文件访问
- 潜在后门检测

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📞 支持

- 📧 邮箱: [your-email@example.com]
- 🐛 问题反馈: [GitHub Issues](https://github.com/yourusername/malmodel_scan/issues)
- 📖 文档: [项目文档](docs/)

## 🙏 致谢

感谢以下开源项目的支持：
- [TensorFlow](https://www.tensorflow.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)

---

**⚡ 让AI模型更安全，让模型扫描更简单！**