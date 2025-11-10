# MalModelScan 项目概览

## 📋 项目文档导航

| 文档 | 描述 | 适用对象 |
|------|------|----------|
| **README.md** | 项目介绍和快速开始 | 所有用户 |
| **INSTALL.md** | 详细安装和环境配置指南 | 开发者和运维 |
| **DEPLOYMENT.md** | 生产环境部署指南 | 运维和部署人员 |
| **CLAUDE.md** | Claude Code 开发者指南 | AI 开发者 |
| **PROJECT_OVERVIEW.md** | 项目概览（本文档） | 所有用户 |

## 🎯 项目目标

MalModelScan 是一个专业的机器学习模型安全扫描工具，旨在：

- 🔍 **安全检测**: 识别 AI 模型中的潜在安全风险和恶意代码
- 🛡️ **预防攻击**: 帮助开发者在部署前发现模型安全问题
- 📊 **详细分析**: 提供算子级别的安全分析报告
- 🌐 **易用性**: 提供友好的 Web 界面和命令行工具

## 🏗️ 核心架构

### 双扫描器架构
```
┌─────────────────────────────────────────────────────────────┐
│                   MalModelScan                             │
├─────────────────────────────────────────────────────────────┤
│  格式检测 (TDmodel.py)                                      │
│  ├── TensorFlow (.h5, .pb) → TensorDetect 扫描器             │
│  └── 其他格式 (.pkl, .pt, .onnx) → ModelScan 扫描器          │
├─────────────────────────────────────────────────────────────┤
│  TensorDetect (TensorFlow 专用)                              │
│  ├── 操作名称提取                                            │
│  ├── 安全能力分类                                            │
│  └── 详细漏洞分析                                            │
├─────────────────────────────────────────────────────────────┤
│  ModelScan (通用格式)                                         │
│  ├── 反序列化安全检测                                         │
│  ├── 代码注入检测                                            │
│  └── 文件访问检查                                            │
└─────────────────────────────────────────────────────────────┘
```

### 前后端分离架构
```
┌─────────────────┐    HTTP/HTTPS     ┌─────────────────┐
│   前端 (Vue 3)   │◄─────────────────►│  后端 (FastAPI)  │
│                 │                   │                 │
│ • 文件上传界面    │   • 文件上传API    │ • 模型扫描引擎   │
│ • 实时进度显示    │   • 状态查询API    │ • 背景任务处理   │
│ • 结果可视化     │   • 结果获取API    │ • 历史记录管理   │
│ • 历史管理       │   • 历史查询API    │ • CORS 支持     │
└─────────────────┘                   └─────────────────┘
```

## 🛠️ 技术栈

### 后端技术
- **框架**: FastAPI (Python Web Framework)
- **语言**: Python 3.8+
- **AI库**: TensorFlow (精简版)、numpy、h5py
- **异步**: asyncio、uvicorn
- **数据处理**: pandas、tomlkit
- **安全**: CORS、文件验证、输入过滤

### 前端技术
- **框架**: Vue 3 + Composition API
- **语言**: TypeScript
- **构建工具**: Vite
- **UI框架**: TailwindCSS
- **状态管理**: Pinia
- **路由**: Vue Router
- **工具库**: @vueuse/core

### 开发工具
- **包管理**: npm (前端)、pip (后端)
- **代码格式化**: Prettier、Black
- **版本控制**: Git
- **部署**: GitHub Pages + 云服务 (Render/Railway)

## 📁 项目结构详解

```
malmodel_scan/
├── 📁 核心代码
│   ├── main.py                 # 命令行入口点
│   ├── TensorDetect/           # TensorFlow 扫描引擎
│   │   ├── TDmodel.py          # 模型类型检测
│   │   ├── TDscan.py           # 扫描核心逻辑
│   │   ├── TDissue.py          # 问题分类系统
│   │   └── TDsettings.py       # 恶意操作配置
│   └── modelscan/              # 通用模型扫描框架
│       ├── scanners/           # 格式特定扫描器
│       ├── middlewares/        # 处理管道
│       ├── reports.py          # 报告生成
│       └── modelscan.py        # 主扫描器
│
├── 📁 Web 应用
│   ├── frontend/               # Vue 3 前端应用
│   │   ├── src/
│   │   │   ├── components/     # Vue 组件
│   │   │   ├── views/          # 页面视图
│   │   │   ├── services/       # API 服务
│   │   │   ├── stores/         # 状态管理
│   │   │   └── config/         # 环境配置
│   │   ├── dist/               # 构建输出
│   │   └── package.json        # 前端依赖
│   └── backend/                # FastAPI 后端服务
│       ├── main.py             # API 服务主文件
│       ├── uploads/            # 临时文件存储
│       └── requirements.txt    # Python 依赖
│
├── 📁 依赖和数据
│   ├── tensorflow/             # 精简版 TensorFlow
│   ├── demo_models/            # 测试模型
│   └── requirements.txt        # 核心依赖列表
│
├── 📁 工具和脚本
│   ├── scripts/                # 自动化脚本
│   │   ├── start-local.sh      # 完整应用启动
│   │   ├── start.sh            # 后端启动
│   │   ├── stop.sh             # 服务停止
│   │   ├── setup.sh            # 环境安装
│   │   └── package.sh          # 打包脚本
│   └── *.sh                    # 快捷启动脚本
│
└── 📁 文档
    ├── README.md               # 项目介绍
    ├── INSTALL.md              # 安装指南
    ├── DEPLOYMENT.md           # 部署指南
    ├── CLAUDE.md               # 开发者指南
    └── PROJECT_OVERVIEW.md     # 项目概览
```

## 🔄 开发工作流

### 1. 环境设置
```bash
# 一键安装
./scripts/setup.sh

# 或手动安装
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd frontend && npm install
```

### 2. 本地开发
```bash
# 启动完整应用
./scripts/start-local.sh

# 或分别启动
# 后端: cd backend && uvicorn main:app --reload
# 前端: cd frontend && npm run dev
```

### 3. 功能开发
1. **修改扫描逻辑**: 编辑 `TensorDetect/` 或 `modelscan/` 文件
2. **更新前端界面**: 编辑 `frontend/src/components/`
3. **API 接口修改**: 编辑 `backend/main.py`
4. **测试验证**: 使用 `demo_models/` 中的测试文件

### 4. 构建部署
```bash
# 前端构建
cd frontend && npm run build:prod

# 前端部署到 GitHub Pages
npm run deploy

# 后端部署到云服务 (Render/Railway)
# 参考 DEPLOYMENT.md
```

## 🎯 核心功能模块

### 1. 模型检测 (TDmodel.py)
- 自动识别模型格式 (H5, SavedModel, Pickle 等)
- ZIP 文件解压和验证
- 模型类型分类

### 2. 安全扫描 (TDscan.py)
- TensorFlow 操作提取
- 恶意操作匹配
- 安全能力分类
- 漏洞严重性评估

### 3. Web API (backend/main.py)
- 文件上传处理
- 后台任务管理
- 实时状态查询
- 历史记录管理

### 4. 前端界面 (frontend/src/)
- 拖拽文件上传
- 实时进度监控
- 结果可视化
- 历史记录管理

## 🔍 支持的模型格式

### TensorFlow 模型 (完整支持 ✅)
- **.h5, .hdf5**: TensorFlow Keras 模型
- **.pb**: TensorFlow SavedModel
- **功能**: 算子提取、安全能力分类、详细分析

### 通用 ML 模型 (基础支持 🚧)
- **.pkl, .pickle**: Python Pickle 序列化
- **.pt, .pth**: PyTorch 模型
- **.onnx**: ONNX 格式
- **.tflite**: TensorFlow Lite
- **功能**: 基础安全检测、格式验证

## 🛡️ 安全检测能力

### TensorFlow 特定威胁
- **DebugIdentityV3**: 调试操作数据泄露
- **FixedLengthRecordDatasetV2**: 任意文件读取
- **Lambda/MutableHashTable**: 代码执行风险
- **分布式操作**: 网络通信安全

### 通用安全威胁
- **不安全反序列化**: Pickle 代码注入
- **文件系统访问**: 越界文件操作
- **可疑导入**: 恶意模块加载
- **模型篡改**: 完整性验证

## 📊 性能特性

### 文件处理
- **最大文件大小**: 100MB (可配置)
- **支持格式**: 10+ 种主流格式
- **处理速度**: < 30秒 (大部分模型)
- **内存优化**: 临时文件自动清理

### 并发处理
- **异步扫描**: 后台任务队列
- **状态轮询**: 实时进度更新
- **历史记录**: JSON 本地存储
- **连接检测**: 自动重试机制

### 部署优化
- **前端**: 静态文件 CDN 加速
- **后端**: 自动扩缩容支持
- **监控**: 健康检查和错误日志
- **安全**: HTTPS、CORS、速率限制

## 🚀 快速开始检查清单

### 新用户设置
- [ ] Python 3.8+ 已安装
- [ ] Node.js 16+ 已安装
- [ ] 克隆项目到本地
- [ ] 运行安装脚本: `./scripts/setup.sh`

### 开发环境验证
- [ ] 虚拟环境已创建并激活
- [ ] Python 依赖已安装
- [ ] 前端依赖已安装
- [ ] 命令行工具正常: `python main.py --help`

### 服务启动验证
- [ ] 后端服务启动: `http://127.0.0.1:5180/health`
- [ ] 前端服务启动: `http://localhost:5173`
- [ ] API 文档可访问: `http://127.0.0.1:5180/docs`
- [ ] 测试模型扫描功能正常

### 部署前准备
- [ ] 代码已推送到 GitHub
- [ ] 前端构建成功: `npm run build:prod`
- [ ] 后端健康检查正常
- [ ] 环境变量已配置

## 🤝 如何贡献

### 报告问题
- 使用 GitHub Issues 报告 Bug
- 提供详细的复现步骤
- 包含系统环境信息

### 提交代码
1. Fork 项目仓库
2. 创建功能分支
3. 编写代码和测试
4. 提交 Pull Request

### 开发指南
- 查看 CLAUDE.md 了解开发规范
- 遵循项目代码风格
- 添加必要的测试用例
- 更新相关文档

## 📞 获取帮助

### 文档优先级
1. **INSTALL.md**: 安装问题
2. **DEPLOYMENT.md**: 部署问题
3. **CLAUDE.md**: 开发问题
4. **README.md**: 基本使用问题

### 社区支持
- **GitHub Issues**: 技术问题和 Bug 报告
- **项目 Wiki**: 详细教程和最佳实践
- **代码注释**: 查看内联文档

---

**🎉 欢迎使用 MalModelScan！让 AI 模型更安全，让安全检测更简单！**