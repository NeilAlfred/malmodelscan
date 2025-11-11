# 开发指南

本文档介绍如何参与MalModelScan项目的开发。

## 🏗️ 项目结构

```
malmodel_scan/
├── frontend/                 # Vue 3前端应用
│   ├── src/
│   │   ├── components/      # Vue组件
│   │   ├── views/          # 页面视图
│   │   ├── services/       # API服务
│   │   ├── config/         # 环境配置
│   │   └── types/          # TypeScript类型定义
│   ├── dist/               # 构建输出
│   └── package.json        # 前端依赖
├── backend/                  # FastAPI后端服务
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
└── docs/                     # 项目文档
```

## 🚀 本地开发环境

### 环境要求

- **Python**: 3.8+ (推荐 3.11+)
- **Node.js**: 16.0+ (推荐 18.0+)
- **Git**: 2.0+

### 克隆项目

```bash
git clone https://github.com/NeilAlfred/malmodelscan.git
cd malmodelscan
```

### 后端开发环境

```bash
# 创建虚拟环境
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 开发模式启动后端
cd backend
uvicorn main:app --host 0.0.0.0 --port 5180 --reload --log-level debug
```

### 前端开发环境

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 开发模式启动前端
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 一键启动

```bash
# 同时启动前后端
./scripts/start-local.sh
```

## 🔧 开发规范

### 代码风格

**Python代码**:
- 遵循PEP 8规范
- 使用类型注解
- 最大行长度：88字符
- 使用Black格式化

```python
# 示例
def scan_model(
    file_path: str,
    options: ScanOptions | None = None
) -> ScanResult:
    """扫描模型文件并返回结果"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    # 实现扫描逻辑
    return ScanResult()
```

**JavaScript/TypeScript代码**:
- 遵循ESLint规则
- 使用TypeScript类型检查
- 使用Prettier格式化

```typescript
// 示例
interface ScanResult {
  scan_id: string;
  filename: string;
  total_issues: number;
  issues: Issue[];
}

async function scanModel(file: File): Promise<ScanResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  return response.json();
}
```

### 提交规范

**Commit消息格式**:
```
type(scope): description

[optional body]

More detailed explanatory text, if necessary. Wrap it to
72 characters if needed. 🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**类型**:
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例**:
```
feat(scan): add support for ONNX model format

Implement ONNX scanner with basic security checks and
issue detection capabilities.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Archored-By: Claude <noreply@anthropic.com>
```


## 🔍 调试指南

### 后端调试

**VS Code调试配置** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/main.py",
      "console": "integratedTerminal",
      "env": {
        "PYTHONPATH": "${workspaceFolder}"
      }
    }
  ]
}
```

**日志调试**:
```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def scan_model(file_path: str):
    logger.debug(f"Starting scan for {file_path}")
    # 调试代码
    logger.info("Scan completed successfully")
```

### 前端调试

**浏览器开发者工具**:
1. 使用Chrome DevTools
2. 设置断点在Vue组件中
3. 监控网络请求和响应

**VS Code调试**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Vue.js: debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/node_modules/.bin/vite",
      "args": ["--mode", "development"],
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## 🏗️ 扩展开发

### 添加新的扫描引擎

1. **创建扫描器类**:
```python
# modelscan/scanners/new_scanner.py
from modelscan.scanners.base import BaseScanner
from modelscan.issues import Issue

class NewScanner(BaseScanner):
    def __init__(self, settings=None):
        super().__init__(settings)
        self.name = "New Scanner"

    def scan(self, file_path: str):
        issues = []
        # 实现扫描逻辑
        return issues
```

2. **注册扫描器**:
```python
# modelscan/__init__.py
from .scanners.new_scanner import NewScanner

AVAILABLE_SCANNERS = [NewScanner, ...]
```

### 添加新的威胁检测

1. **定义威胁类型**:
```python
# TDissue.py
class IssueType(Enum):
    NEW_THREAT = "New Threat"
    # ...
```

2. **添加检测逻辑**:
```python
# TDsettings.py
MALICIOUS_OPERATIONS = {
    'NewOp': {
        'severity': IssueSeverity.HIGH,
        'ability': 'New capability',
        'description': 'New malicious operation'
    }
}
```

### 添加新的前端组件

1. **创建组件**:
```vue
<!-- frontend/src/components/NewComponent.vue -->
<template>
  <div class="new-component">
    <!-- 组件模板 -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NewComponent',
  // 组件逻辑
});
</script>

<style scoped>
.new-component {
  /* 组件样式 */
}
</style>
```

2. **注册组件**:
```typescript
// frontend/src/components/index.ts
export { default as NewComponent } from './NewComponent.vue';
```

## 📦 构建和部署

### 开发构建

```bash
# 前端开发构建
cd frontend
npm run build:dev

# 后端开发包
python -m build
```

### 生产构建

```bash
# 前端生产构建
cd frontend
npm run build:prod

# 后端可执行文件
./scripts/package.sh
```

### 发布流程

1. **测试和验证**
2. **更新版本号**
3. **创建发布标签**
4. **推送代码**
5. **触发CI/CD**

```bash
# 更新版本号
npm version patch  # 或 minor/major

# 创建标签
git tag v1.2.3
git push origin v1.2.3

# 触发部署
git push origin main
```

## 🔧 开发工具

### VS Code扩展推荐

- **Python**: Python extension pack
- **Vue.js**: Volar, Vue VSCode Snippets
- **TypeScript**: TypeScript Importer
- **GitLens**: GitLens
- **Prettier**: Prettier - Code formatter

### 有用的脚本

**代码格式化**:
```bash
# Python代码格式化
black .

# JavaScript/TypeScript代码格式化
npm run format

# 导入排序
npm run lint:fix
```

**类型检查**:
```bash
# Python类型检查
mypy backend/

# TypeScript类型检查
npm run type-check
```

**性能分析**:
```bash
# 前端打包分析
npm run build:analyze

# Python性能分析
python -m cProfile -s time main.py -m model.h5
```

## 🤝 贡献流程

1. **Fork项目**
   ```bash
   # Fork到GitHub账号
   git clone https://github.com/yourusername/malmodelscan.git
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **开发和测试**
   - 编写代码
   - 添加测试
   - 确保所有测试通过

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建Pull Request**
   - 在GitHub上创建PR
   - 等待代码审查
   - 根据反馈修改代码

## 📋 开发检查清单

### 代码质量
- [ ] 代码通过类型检查
- [ ] 代码遵循项目规范
- [ ] 添加了必要的注释
- [ ] 更新了相关文档

### 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试验证

### 兼容性
- [ ] 支持的Python版本测试通过
- [ ] 支持的Node.js版本测试通过
- [ ] 主要浏览器测试通过

### 文档
- [ ] API文档更新
- [ ] 用户指南更新
- [ ] README文件更新

---

有问题？请查看[问题反馈](../troubleshooting.md)或提交Issue。