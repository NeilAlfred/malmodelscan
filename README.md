# MalModelScan

<div align="center">

**专业的AI模型安全检查工具**

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)](LICENSE)

[在线演示](https://neilalfred.github.io/malmodelscan/) • [文档](docs/) • [安装指南](docs/installation.md) • [API文档](docs/api/)

</div>

## ✨ 特性

- 🔍 **多格式支持**: TensorFlow (.pb, .h5), PyTorch (.pt, .pth), Pickle (.pkl), ONNX (.onnx), TensorFlow Lite (.tflite)
- ⚡ **双引擎扫描**: TensorDetect (TensorFlow专用) + ModelScan (通用)
- 🎯 **精准检测**: CRITICAL、HIGH、MEDIUM、LOW四级风险分类
- 🌐 **双端支持**: 命令行工具 + Web界面
- 🔧 **灵活部署**: 本地部署、GitHub Pages、云端服务

## 🚀 快速开始

### 命令行使用

```bash
# 克隆项目
git clone https://github.com/NeilAlfred/malmodelscan.git
cd malmodelscan

# 安装依赖
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 扫描模型
python main.py -m /path/to/model.h5
python main.py -m /path/to/saved_model/
python main.py -m /path/to/model.pkl
```

### Web界面

```bash
# 启动完整Web应用
./scripts/start-local.sh

# 访问 http://localhost:5173
```

## 📖 文档

| 文档 | 描述 |
|------|------|
| [安装指南](docs/installation.md) | 详细安装和环境配置 |
| [用户指南](docs/user-guide/) | 使用方法和功能介绍 |
| [部署指南](docs/deployment/) | 部署到不同平台 |
| [开发指南](docs/development/) | 开发环境和贡献指南 |
| [API文档](docs/api/) | REST API接口文档 |

## 🔧 技术栈

- **后端**: FastAPI + TensorDetect + ModelScan
- **前端**: Vue 3 + TypeScript + Vite + TailwindCSS
- **扫描引擎**: TensorFlow安全分析 + 恶意代码检测

## 🛡️ 安全检测

### TensorFlow模型威胁 (TensorDetect)
- 恶意操作检测 (Tensor Abuse)
- 文件系统访问风险
- 网络连接风险
- 调试信息泄露

### 通用ML模型威胁 (ModelScan)
- 不安全的反序列化
- 恶意代码注入
- 可疑模块导入
- 文件访问越界

## 🤝 贡献

欢迎提交Issue和Pull Request！详见[开发指南](docs/development/)。

## 📄 许可证

本项目采用 [Apache-2.0许可证](LICENSE)。

---

<div align="center">
Made with ❤️ by the MalModelScan Team
</div>