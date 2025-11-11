# 用户指南

MalModelScan 提供了命令行和Web界面两种使用方式，满足不同用户的需求。

## 📋 选择使用方式

| 使用方式 | 适合场景 | 优点 | 缺点 |
|---------|---------|------|------|
| **命令行** | 自动化脚本、批量处理、CI/CD | 快速、可脚本化、资源占用少 | 无图形界面 |
| **Web界面** | 单次分析、详细查看、非技术用户 | 直观易用、实时进度、历史管理 | 需要浏览器 |

## 🖥️ Web界面使用

### 访问地址

- **本地部署**: http://localhost:5173
- **在线演示**: https://neilalfred.github.io/malmodelscan/

### 基本操作

#### 1. 上传模型文件

**支持格式**:
- TensorFlow: `.pb`, `.h5`, `.hdf5`
- PyTorch: `.pt`, `.pth`
- Pickle: `.pkl`, `.pickle`
- ONNX: `.onnx`
- TensorFlow Lite: `.tflite`

**上传方式**:
- 拖拽文件到上传区域
- 点击"选择文件"按钮
- 文件大小限制: 100MB

#### 2. 扫描过程

上传后系统会自动：
1. **检测模型格式** - 自动选择合适的扫描引擎
2. **实时显示进度** - 上传 → 队列 → 扫描中 → 完成
3. **显示扫描结果** - 风险统计、详细问题列表

#### 3. 查看扫描结果

**结果概览**:
- 风险级别统计（CRITICAL、HIGH、MEDIUM、LOW）
- 模型信息（类型、大小、扫描引擎）
- 总问题数量

**详细信息**:
- **算子 (Operator)**: 具体的TensorFlow或PyTorch操作
- **能力 (Ability)**: 安全风险能力描述
- **位置 (Location)**: 文件路径或组件位置
- **描述 (Description)**: 详细的安全分析

#### 4. 管理扫描历史

在**历史记录**页面可以：
- 查看所有扫描记录
- 按时间排序浏览
- 查看详细扫描结果
- 清除历史记录

## 💻 命令行使用

### 基本语法

```bash
python main.py -m <模型路径> [选项]
```

### 常用选项

```bash
# 基本扫描
python main.py -m model.h5

# 详细输出
python main.py -m model.h5 --verbose

# JSON格式输出
python main.py -m model.h5 --output json

# 保存结果到文件
python main.py -m model.h5 --output report.txt

# 查看帮助
python main.py --help
```

### 输出格式

**默认输出**（控制台）:
```
🔍 MalModelScan - AI模型安全检查工具
📁 模型: model.h5
🔍 扫描引擎: TensorDetect
⚠️  发现问题: 3 个
  🔴 HIGH: 2 个
  🟡 MEDIUM: 1 个
```

**JSON输出**:
```json
{
  "scan_id": "...",
  "filename": "model.h5",
  "model_type": "TensorFlow (H5)",
  "scanner_used": "TensorDetect",
  "total_issues": 3,
  "issues": [...]
}
```

## 🧪 使用示例

### TensorFlow模型

```bash
# TensorFlow SavedModel
python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb

# TensorFlow H5
python main.py -m demo_models/lambda_savedmodel/
```

### PyTorch模型

```bash
# PyTorch checkpoint
python main.py -m demo_models/data/unsafe_zip_pytorch.pt
```

### Pickle文件

```bash
# Python pickle文件
python main.py -m demo_models/data/example.pkl
```

### 批量扫描

```bash
# 使用脚本批量扫描
for file in models/*.h5; do
    echo "扫描: $file"
    python main.py -m "$file" --output json > "${file%.h5}_report.json"
done
```

## 📊 结果解读

### 风险级别

| 级别 | 颜色 | 严重程度 | 处理建议 |
|------|------|----------|----------|
| **CRITICAL** | 🔴 红色 | 严重 | 立即处理，存在重大安全风险 |
| **HIGH** | 🟠 橙色 | 高风险 | 尽快处理，存在明显安全威胁 |
| **MEDIUM** | 🟡 黄色 | 中等风险 | 关注处理，存在潜在安全问题 |
| **LOW** | 🟢 绿色 | 低风险 | 适时处理，存在轻微安全问题 |

### 常见威胁类型

#### TensorFlow威胁
- **文件访问风险**: `/etc/passwd`, `/home/*/.ssh`
- **网络连接**: 外部IP地址、URL连接
- **调试泄露**: `DebugIdentity` 操作
- **系统调用**: `posix.system`, `subprocess`

#### 通用威胁
- **反序列化攻击**: 恶意pickle文件
- **代码注入**: 模型中包含恶意代码
- **后门程序**: 隐藏的执行路径
- **数据泄露**: 敏感信息外泄

## 🔧 高级功能

### API集成

```bash
# 启动API服务
cd backend
uvicorn main:app --host 0.0.0.0 --port 5180

# 健康检查
curl http://localhost:5180/health

# 上传扫描
curl -X POST "http://localhost:5180/api/upload" \
  -F "file=@model.h5"
```

### 配置选项

**环境变量**:
```bash
export SCAN_TIMEOUT=300          # 扫描超时（秒）
export MAX_FILE_SIZE=104857600    # 最大文件大小（字节）
export CORS_ORIGINS="http://localhost:5173"  # CORS允许的源
```

## 🚨 最佳实践

### 1. 安全扫描建议

- **定期扫描**: 定期检查生产环境模型
- **CI/CD集成**: 在模型部署前进行安全检查
- **模型来源验证**: 只扫描可信来源的模型
- **结果审核**: 人工复核高风险扫描结果

### 2. 性能优化

- **大文件处理**: 大型模型建议使用命令行工具
- **批量操作**: 使用脚本进行批量扫描
- **资源管理**: 监控内存和CPU使用情况
- **网络环境**: 确保稳定的网络连接

### 3. 结果管理

- **记录保存**: 定期备份扫描结果
- **趋势分析**: 跟踪安全风险变化趋势
- **团队协作**: 与安全团队共享扫描报告

---

更多详细信息请参考[API文档](../api/)或[开发指南](../development/)。