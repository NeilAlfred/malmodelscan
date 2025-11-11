# API文档

MalModelScan提供RESTful API，支持程序化模型安全扫描。

## 🌐 基础信息

- **Base URL**: `http://localhost:5180/api`
- **认证方式**: 无需认证（可配置）
- **数据格式**: JSON
- **字符编码**: UTF-8

## 📋 API端点

### 核心端点

| 方法 | 端点 | 描述 |
|------|------|------|
| `POST` | `/upload` | 上传并扫描模型 |
| `GET` | `/scan/status/{scan_id}` | 获取扫描状态 |
| `GET` | `/scan/result/{scan_id}` | 获取扫描结果 |
| `GET` | `/scans/history` | 获取扫描历史 |
| `DELETE` | `/scans/history` | 清除扫描历史 |

### 系统端点

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/health` | 健康检查 |
| `GET` | `/` | API信息 |

## 🔍 详细接口说明

### 1. 上传模型扫描

**请求**:
```http
POST /api/upload
Content-Type: multipart/form-data
```

**参数**:
- `file` (required): 模型文件，支持格式：
  - TensorFlow: `.pb`, `.h5`, `.hdf5`
  - PyTorch: `.pt`, `.pth`
  - Pickle: `.pkl`, `.pickle`
  - ONNX: `.onnx`
  - TensorFlow Lite: `.tflite`
  - ZIP: `.zip` (包含模型文件)

**响应**:
```json
{
  "scan_id": "12345678-1234-1234-1234-123456789abc",
  "status": "queued",
  "message": "File uploaded successfully. Scan started in background."
}
```

**示例**:
```bash
curl -X POST "http://localhost:5180/api/upload" \
  -F "file=@model.h5"
```

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:5180/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### 2. 获取扫描状态

**请求**:
```http
GET /api/scan/status/{scan_id}
```

**路径参数**:
- `scan_id`: 扫描ID

**响应**:
```json
{
  "scan_id": "12345678-1234-1234-1234-123456789abc",
  "status": "scanning",
  "progress": 75,
  "message": "Scanning with TensorDetect..."
}
```

**状态说明**:
- `queued`: 排队中
- `scanning`: 扫描中
- `completed`: 扫描完成
- `failed`: 扫描失败

**示例**:
```bash
curl "http://localhost:5180/api/scan/status/12345678-1234-1234-1234-123456789abc"
```

### 3. 获取扫描结果

**请求**:
```http
GET /api/scan/result/{scan_id}
```

**路径参数**:
- `scan_id`: 扫描ID

**响应**:
```json
{
  "scan_id": "12345678-1234-1234-1234-123456789abc",
  "filename": "model.h5",
  "model_type": "TensorFlow (H5)",
  "scanner_used": "TensorDetect",
  "total_issues": 3,
  "issues_by_severity": {
    "HIGH": 2,
    "MEDIUM": 1
  },
  "scan_time": "2024-01-01T12:00:00.000Z",
  "issues": [
    {
      "severity": "HIGH",
      "description": "Tensorabuse op detected...",
      "operator": "Tensor abuse",
      "location": "model.h5",
      "ability": "Arbitrary file read",
      "op": "FixedLengthRecordDatasetV2"
    }
  ]
}
```

**字段说明**:
- `severity`: 风险级别 (CRITICAL, HIGH, MEDIUM, LOW)
- `operator`: 操作符/算子名称
- `ability`: 安全能力描述
- `op`: 具体操作名称
- `location`: 问题位置

**示例**:
```bash
curl "http://localhost:5180/api/scan/result/12345678-1234-1234-1234-123456789abc"
```

### 4. 获取扫描历史

**请求**:
```http
GET /api/scans/history
```

**查询参数** (可选):
- `limit`: 返回记录数量限制
- `offset`: 偏移量

**响应**:
```json
{
  "scans": [
    {
      "scan_id": "12345678-1234-1234-1234-123456789abc",
      "filename": "model.h5",
      "model_type": "TensorFlow (H5)",
      "scanner_used": "TensorDetect",
      "total_issues": 3,
      "issues_by_severity": {
        "HIGH": 2,
        "MEDIUM": 1
      },
      "scan_time": "2024-01-01T12:00:00.000Z",
      "issues": [...]
    }
  ],
  "total_count": 1
}
```

**示例**:
```bash
curl "http://localhost:5180/api/scans/history?limit=10"
```

### 5. 清除扫描历史

**请求**:
```http
DELETE /api/scans/history
```

**响应**:
```json
{
  "message": "Scan history cleared successfully"
}
```

**示例**:
```bash
curl -X DELETE "http://localhost:5180/api/scans/history"
```

### 6. 健康检查

**请求**:
```http
GET /api/health
```

**响应**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**示例**:
```bash
curl "http://localhost:5180/api/health"
```

## 🔧 错误处理

### HTTP状态码

| 状态码 | 描述 |
|--------|------|
| `200` | 成功 |
| `400` | 请求参数错误 |
| `404` | 资源不存在 |
| `422` | 文件格式不支持或处理失败 |
| `500` | 服务器内部错误 |

### 错误响应格式

```json
{
  "detail": "Error message description"
}
```

**常见错误**:
```json
{
  "detail": "No file uploaded"
}
```

```json
{
  "detail": "Unsupported file format. Allowed formats: .h5, .hdf5, .pb, .pkl, .pickle, .pt, .pth, .onnx, .tflite"
}
```

## 📚 使用示例

### Python客户端

```python
import requests
import json

# 上传文件
def upload_model(file_path):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post('http://localhost:5180/api/upload', files=files)
        return response.json()

# 获取扫描结果
def get_scan_result(scan_id):
    response = requests.get(f'http://localhost:5180/api/scan/result/{scan_id}')
    return response.json()

# 完整流程
def scan_model_file(file_path):
    # 1. 上传文件
    upload_result = upload_model(file_path)
    scan_id = upload_result['scan_id']

    # 2. 等待扫描完成
    import time
    while True:
        status_result = requests.get(f'http://localhost:5180/api/scan/status/{scan_id}').json()
        if status_result['status'] in ['completed', 'failed']:
            break
        time.sleep(1)

    # 3. 获取结果
    result = get_scan_result(scan_id)
    return result

# 使用示例
result = scan_model_file('model.h5')
print(f"发现 {result['total_issues']} 个安全问题")
```

### JavaScript客户端

```javascript
class MalModelScanAPI {
  constructor(baseURL = 'http://localhost:5180/api') {
    this.baseURL = baseURL;
  }

  async uploadModel(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      body: formData
    });

    return response.json();
  }

  async getScanStatus(scanId) {
    const response = await fetch(`${this.baseURL}/scan/status/${scanId}`);
    return response.json();
  }

  async getScanResult(scanId) {
    const response = await fetch(`${this.baseURL}/scan/result/${scanId}`);
    return response.json();
  }

  async scanModel(file) {
    // 1. 上传文件
    const uploadResult = await this.uploadModel(file);
    const scanId = uploadResult.scan_id;

    // 2. 轮询扫描状态
    while (true) {
      const status = await this.getScanStatus(scanId);
      if (status.status === 'completed') {
        break;
      }
      if (status.status === 'failed') {
        throw new Error('Scan failed');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 3. 获取结果
    return this.getScanResult(scanId);
  }
}

// 使用示例
const api = new MalModelScanAPI();

document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const result = await api.scanModel(file);
      console.log('扫描结果:', result);
    } catch (error) {
      console.error('扫描失败:', error);
    }
  }
});
```

### cURL批量脚本

```bash
#!/bin/bash

# 批量扫描脚本
API_BASE="http://localhost:5180/api"
MODEL_DIR="./models"

for model in "$MODEL_DIR"/*.{h5,pb,pkl,pt,pth}; do
  if [ -f "$model" ]; then
    echo "扫描: $model"

    # 上传文件
    UPLOAD_RESULT=$(curl -s -X POST "$API_BASE/upload" -F "file=@$model")
    SCAN_ID=$(echo "$UPLOAD_RESULT" | jq -r '.scan_id')

    if [ -n "$SCAN_ID" ] && [ "$SCAN_ID" != "null" ]; then
      echo "  扫描ID: $SCAN_ID"

      # 等待扫描完成
      while true; do
        STATUS=$(curl -s "$API_BASE/scan/status/$SCAN_ID" | jq -r '.status')
        if [ "$STATUS" = "completed" ]; then
          break
        elif [ "$STATUS" = "failed" ]; then
          echo "  扫描失败"
          break
        fi
        sleep 2
      done

      # 获取结果
      RESULT=$(curl -s "$API_BASE/scan/result/$SCAN_ID")
      ISSUES_COUNT=$(echo "$RESULT" | jq -r '.total_issues')
      echo "  发现问题: $ISSUES_COUNT 个"

      # 保存结果
      echo "$RESULT" > "${model%.pb}_result.json"
    fi

    echo "---"
  fi
done
```

## 🔒 安全考虑

### CORS配置

默认允许的源：
```bash
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

生产环境配置：
```bash
CORS_ORIGINS=https://yourdomain.com
```

### 文件上传限制

- 最大文件大小：100MB（可配置）
- 支持的文件格式：`.h5`, `.hdf5`, `.pb`, `.pkl`, `.pickle`, `.pt`, `.pth`, `.onnx`, `.tflite`, `.zip`

### 速率限制

可根据需要实施API速率限制，防止滥用。

## 📊 性能优化

### 批量处理

对于批量扫描，建议：
1. 并行上传多个小文件
2. 避免同时上传大文件
3. 使用适当的轮询间隔

### 缓存策略

- 扫描结果持久化存储
- 静态资源使用CDN
- API响应使用适当缓存头

---

更多详细信息请参考[用户指南](../user-guide/)或[部署指南](../deployment/)。