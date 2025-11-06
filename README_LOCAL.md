# MalModelScan 本地开发指南

这个指南将帮助你搭建和运行 MalModelScan 的完整本地开发环境。

## 🚀 快速开始

### 一键启动（推荐）

```bash
# 在项目根目录运行
./start.sh
```

或者直接运行完整脚本：

```bash
# 在项目根目录运行
./scripts/start-local.sh
```

这个脚本会自动：
1. 启动后端服务（FastAPI）在 `http://127.0.0.1:5180`
2. 启动前端开发服务器（Vue 3）在 `http://localhost:5173`
3. 自动安装依赖项
4. 提供优雅的关闭机制（Ctrl+C）

### 手动启动

如果你想分别启动前后端服务：

#### 启动后端

```bash
./scripts/start.sh
```

或者：

```bash
cd backend
source venv/bin/activate  # 激活虚拟环境
pip install -r requirements.txt  # 安装依赖
uvicorn main:app --host 127.0.0.1 --port 5180 --reload
```

#### 启动前端

```bash
cd frontend
npm install  # 安装依赖（首次运行）
npm run dev  # 启动开发服务器
```

## 📋 功能特性

### 三种使用方式

#### 1. 命令行直接分析（CLI）
- **⚡ 即时分析**: 无需启动服务，直接分析模型文件
- **🔧 脚本化**: 支持批处理和自动化脚本
- **📊 多格式输出**: 控制台输出、JSON、文本文件
- **🎯 调试友好**: 详细输出，便于开发和测试

#### 2. Web 界面（GUI）
- **🎨 现代界面**: 响应式设计，中文界面，TailwindCSS 样式
- **📤 智能上传**: 拖拽上传，文件验证，进度显示，错误处理
- **📊 实时更新**: 扫描进度实时显示，结果即时呈现
- **🔍 详细分析**: 显示算子（操作符）和能力（安全风险）详细信息
- **📜 历史管理**: 扫描历史查看，结果对比，历史清理
- **🎯 本地化**: 中文字段标签（算子、能力），技术细节保留

#### 3. REST API 接口
- **🔄 异步处理**: 后台扫描，实时状态轮询，避免超时
- **📊 数据持久化**: JSON 存储扫描历史，支持历史查询
- **📖 OpenAPI 文档**: 自动生成的交互式 API 文档
- **🏥 健康检查**: 服务状态监控和故障检测
- **🔧 集成友好**: 易于集成到 CI/CD 和其他系统中

### 双扫描器架构

#### TensorDetect 扫描器（TensorFlow 专用）
- **🔍 详细操作分析**: 提取具体 TensorFlow 操作名称
- **🏷️ 算子识别**: 显示 `DebugIdentityV3`、`FixedLengthRecordDatasetV2` 等操作
- **⚡ 能力分类**: 分类为 "网络访问"、"任意文件读取" 等安全能力
- **📍 精确定位**: 精确定位恶意操作在模型中的位置
- **🎯 高精度检测**: 针对 TensorFlow 恶意模式的专业检测

#### ModelScan 扫描器（通用格式）
- **🔄 多格式支持**: 支持 PyTorch、Pickle、ONNX 等非 TensorFlow 格式
- **🛡️ 通用安全**: 检测反序列化、代码注入等通用安全问题
- **🔧 跨平台**: 兼容不同框架和序列化格式
- **📊 基础扫描**: 提供基础但全面的安全评估

### 智能格式检测

- **🔍 自动识别**: 根据文件扩展名和内容自动选择扫描器
- **📤 安全上传**: 文件验证、临时存储、自动清理
- **🎛️ 灵活配置**: 支持多种输出格式和详细程度控制

## 🌐 访问地址

- **前端界面**: http://localhost:5173
- **后端 API**: http://127.0.0.1:5180
- **API 文档**: http://127.0.0.1:5180/docs
- **健康检查**: http://127.0.0.1:5180/health

## 📁 项目结构

```
malmodel_scan/
├── main.py                 # 主命令行入口 - 直接模型分析
├── backend/                 # 后端 FastAPI 服务
│   ├── main.py             # Web API 服务主文件
│   ├── venv/               # Python 虚拟环境
│   ├── uploads/            # 上传文件临时目录
│   └── requirements.txt    # Python 依赖
├── frontend/               # 前端 Vue 3 应用
│   ├── src/                # 源代码
│   │   ├── components/     # Vue 组件
│   │   ├── views/          # 页面视图
│   │   └── services/       # API 服务
│   ├── dist/               # 构建输出
│   └── package.json        # Node.js 依赖
├── scripts/                # 脚本目录
│   ├── start.sh            # 后端启动脚本
│   ├── start-local.sh      # 完整应用启动脚本
│   ├── stop.sh             # 服务停止脚本
│   ├── restart.sh          # 服务重启脚本
│   ├── package.sh          # 打包脚本
│   └── setup.sh            # 环境设置脚本
├── TensorDetect/           # TensorFlow 扫描模块
│   ├── TDmodel.py          # 模型类型检测
│   ├── TDscan.py           # TensorFlow 扫描逻辑
│   ├── TDissue.py          # 问题分类和严重性
│   └── TDsettings.py       # 恶意操作配置
├── modelscan/             # 通用模型扫描模块
│   ├── scanners/           # 格式特定扫描器
│   ├── middlewares/        # 处理管道
│   └── reports.py          # 报告生成
├── tensorflow/            # 精简版 TensorFlow 依赖
├── demo_models/           # 测试模型文件
│   ├── tensorabuse_savedmodel/  # TensorFlow 恶意示例
│   ├── lambda_savedmodel/        # Lambda 操作示例
│   └── data/                     # 其他格式测试文件
├── start.sh               # 根目录快捷启动脚本
├── CLAUDE.md              # AI 开发者指南
└── README_LOCAL.md        # 本地开发指南
```

## 🚀 使用方式概览

### 1. 命令行工具（推荐用于快速分析和自动化）
```bash
# 直接分析，无需启动任何服务
python main.py -m /path/to/model.h5
```

### 2. Web 界面（推荐用于交互式分析）
```bash
./scripts/start-local.sh  # 启动完整 Web 应用
# 访问 http://localhost:5173
```

### 3. API 接口（推荐用于集成开发）
```bash
./scripts/start.sh        # 仅启动 API 服务
# 访问 http://localhost:5180/docs
```

## 🔧 API 接口

### 主要端点

- `POST /api/upload` - 上传模型文件进行扫描
- `GET /api/scan/status/{scan_id}` - 获取扫描状态
- `GET /api/scan/result/{scan_id}` - 获取扫描结果
- `GET /api/scans/history` - 获取扫描历史
- `GET /api/scans/active` - 获取活跃扫描
- `DELETE /api/scans/history` - 清除扫描历史
- `GET /health` - 健康检查

### API 文档

访问 http://127.0.0.1:5180/docs 查看完整的 API 文档和交互式测试界面。

## 🧪 测试和验证

### 支持的模型格式

#### TensorFlow 模型（TensorDetect 扫描器）
- **`.h5`, `.hdf5`** - TensorFlow HDF5 格式
- **`.pb`** - TensorFlow SavedModel Protocol Buffer 格式
- **完整支持** ✅ - 显示算子名称和安全能力

#### 通用 ML 模型（ModelScan 扫描器）
- **`.pkl`, `.pickle`** - Python Pickle 序列化格式
- **`.pt`, `.pth`** - PyTorch 模型格式
- **`.onnx`** - ONNX 开放神经网络交换格式
- **`.tflite`** - TensorFlow Lite 移动端格式
- **`.bin`** - 二进制序列化格式
- **基础支持** 🚧 - 通用安全检测，需要增强操作提取

### 测试模型示例

项目提供了多种测试模型：

```bash
# TensorFlow SavedModel（推荐 - 完整功能演示）
./demo_models/tensorabuse_savedmodel/saved_model.pb

# TensorFlow H5 格式
./demo_models/lambda_savedmodel/

# 其他格式测试文件
./demo_models/data/
```

### 功能测试步骤

#### 方式一：命令行直接分析（无需启动服务）

```bash
# 直接分析模型文件 - 快速测试
python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb

# 测试不同格式
python main.py -m demo_models/lambda_savedmodel/                    # TensorFlow SavedModel 目录
python main.py -m demo_models/data/example.pkl                     # Pickle 格式

# 批量测试脚本
for model in demo_models/tensorabuse_savedmodel/saved_model.pb \
             demo_models/lambda_savedmodel/ \
             demo_models/data/*.pkl; do
    echo "Testing: $model"
    python main.py -m "$model"
    echo "----------------------------------------"
done
```

#### 方式二：Web 界面测试（完整功能体验）

1. **启动服务**
   ```bash
   ./scripts/start-local.sh
   ```

2. **测试 TensorFlow 模型**（推荐）
   - 访问 http://localhost:5173
   - 上传 `demo_models/tensorabuse_savedmodel/saved_model.pb`
   - 观察算子字段：`DebugIdentityV3`, `FixedLengthRecordDatasetV2`
   - 观察能力字段：`Network access`, `Arbitrary file read`

3. **测试其他格式**
   - 上传 `.pkl`, `.h5`, `.pt` 等格式文件
   - 对比不同扫描器的输出差异

4. **验证 Web 界面功能**
   - 拖拽上传功能
   - 实时扫描进度
   - 详细结果展示
   - 扫描历史管理

#### 方式三：API 接口测试

```bash
# 启动后端服务
./scripts/start.sh

# 在另一个终端测试 API
curl -X POST "http://localhost:5180/api/upload" \
  -F "file=@demo_models/tensorabuse_savedmodel/saved_model.pb"
```

### API 测试

```bash
# 健康检查
curl http://127.0.0.1:5180/health

# 上传模型（替换为实际文件路径）
curl -X POST "http://localhost:5180/api/upload" \
  -F "file=@demo_models/tensorabuse_savedmodel/saved_model.pb"

# 查看扫描历史
curl http://localhost:5180/api/scans/history
```

## 🛠️ 开发

### 后端开发

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt

# 开发模式启动（自动重载）
uvicorn main:app --host 127.0.0.1 --port 5180 --reload
```

### 前端开发

```bash
cd frontend
npm install
npm run dev    # 开发服务器
npm run build  # 构建生产版本
```

## 🔍 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   lsof -i :5180  # 后端端口
   lsof -i :5173  # 前端端口

   # 杀死占用进程
   kill -9 <PID>
   ```

2. **Python 依赖问题**
   ```bash
   cd backend
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Node.js 依赖问题**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TensorFlow 依赖问题**
   ```bash
   # 确保使用项目自带的 slim tensorflow
   export PYTHONPATH="${PYTHONPATH}:/path/to/malmodel_scan/tensorflow"
   ```

5. **权限问题**
   ```bash
   chmod +x scripts/start-local.sh
   chmod +x scripts/start.sh
   ```

6. **模型格式不支持**
   - 检查文件扩展名是否在允许列表中
   - TensorFlow 模型使用 TensorDetect，其他格式使用 ModelScan
   - 查看 `backend/main.py` 中的 `allowed_extensions` 列表

### 日志查看

- **后端日志**: 终端中直接显示 FastAPI 日志
- **前端日志**: 浏览器开发者工具控制台（F12 → Console）
- **扫描历史**: `backend/scan_history.json`
- **API 文档**: http://127.0.0.1:5180/docs

### 调试模式

```bash
# 后端调试模式
cd backend
uvicorn main:app --host 127.0.0.1 --port 5180 --reload --log-level debug

# 前端调试模式
cd frontend
npm run dev  # 浏览器自动打开开发者工具
```

## 📝 开发注意事项

### 当前开发状态

#### ✅ 已完成功能
- **SavedModel (.pb) 格式**: 完整的算子和能力检测
- **Web 界面**: 实时扫描、结果显示、历史管理
- **双扫描器架构**: 自动格式检测和路由
- **异步处理**: 后台扫描，避免超时
- **中文字段**: 算子、能力本地化显示

#### 🚧 需要改进的格式
- **H5 (.h5) 格式**: 需要 TensorFlow 操作解析增强
- **Pickle (.pkl) 格式**: 需要操作级别的安全分析
- **PyTorch (.pt/.pth) 格式**: 需要模型结构分析
- **Binary (.bin) 格式**: 需要格式特定的解析器

### 性能优化建议
- **大型模型**: 考虑实现文件大小限制和进度显示
- **并发扫描**: 实现扫描队列和并发限制
- **缓存机制**: 对重复文件实现哈希缓存
- **内存管理**: 大文件处理时的内存优化

### 安全注意事项
1. **文件验证**: 严格的文件类型和大小限制
2. **沙箱执行**: 考虑在隔离环境中扫描未知文件
3. **临时文件**: 定期清理上传目录
4. **访问控制**: 生产环境需要身份验证和授权
5. **网络安全**: 使用 HTTPS 和安全头配置

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

本项目遵循 MIT 许可证。