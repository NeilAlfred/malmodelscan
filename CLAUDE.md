# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MalModelScan** is a security tool for detecting malicious code and suspicious behavior in machine learning models. The project combines two specialized scanners:

- **TensorDetect**: TensorFlow model scanner with detailed operation analysis
- **ModelScan**: General-purpose scanner for other ML formats (PyTorch, Pickle, Keras, etc.)

The system provides both command-line and web-based interfaces for comprehensive model security analysis.

## Architecture

The project uses a dual-scanner architecture with automatic format detection and specialized processing pipelines:

### Scanning Pipeline Flow

1. **Format Detection** (`TDmodel.py`): Analyzes file extensions and structure to determine model type
2. **Scanner Routing**: Automatically selects appropriate scanner based on detected format
3. **Deep Analysis**: Scanner extracts operations, metadata, and security-relevant patterns
4. **Issue Classification**: Maps findings to security capabilities and severity levels
5. **Results Processing**: Formats output with operator names and ability classifications

### System Components

#### 1. Entry Points and Routing
- **`main.py`**: CLI orchestrator for direct model analysis
- **`backend/main.py`**: FastAPI web service with async background processing
- **Format Detection Logic**: `TDmodel.Model` class determines TensorFlow vs non-TensorFlow formats

#### 2. TensorDetect Module (TensorFlow Specialist)
- **`TDmodel.py`**: Model type detection with ZIP extraction and format validation
  - `ModelType.TF_H5`: TensorFlow HDF5 files (.h5, .hdf5)
  - `ModelType.TF_SM`: TensorFlow SavedModel (directories with saved_model.pb)
  - `ModelType.NOT_TF`: Routes to general ModelScan pipeline
- **`TDscan.py`**: TensorFlow-specific scanning with operation extraction
  - `H5Scan`: HDF5 format parsing and TF graph analysis
  - `SavedModelScan`: Protocol buffer parsing and signature analysis
- **`TDissue.py`**: Issue classification system with severity and ability mapping
- **`TDsettings.py`**: Configuration of malicious TensorFlow operations and patterns

#### 3. ModelScan Module (General ML Scanner)
- **`modelscan/modelscan.py`**: Main scanning orchestration class
- **`modelscan/scanners/`**: Format-specific scanner implementations
  - `h5/scan.py`: HDF5 model scanning
  - `keras/scan.py`: Keras model analysis
  - `pickle/scan.py`: Pickle deserialization security
  - `saved_model/scan.py`: General SavedModel scanning
- **`modelscan/middlewares/`**: Processing pipeline with extensible middleware
- **`modelscan/issues.py`**: Issue collection and severity classification

#### 4. Web Application Layer
- **Backend (`backend/main.py`)**: FastAPI async service with:
  - File upload handling with ZIP extraction
  - Background task processing for large models
  - Real-time status polling and progress tracking
  - Scan history persistence (JSON storage)
  - CORS-enabled API with OpenAPI documentation
- **Frontend (`frontend/`)**: Vue 3 + TypeScript interface:
  - Drag-and-drop file upload with validation
  - Real-time scan progress monitoring
  - Detailed results display with Chinese localization
  - Scan history management and comparison

#### 5. Dependencies and Infrastructure
- **`tensorflow/`**: Slim TensorFlow dependencies for standalone execution
- **`demo_models/`**: Test cases including malicious operation examples
  - `tensorabuse_savedmodel/`: TensorFlow models with abusive operations
  - `lambda_savedmodel/`: Models with Lambda function operations
  - `data/`: Various format test files (pkl, bin, etc.)

### Key Architectural Patterns

#### Dual-Scanner Decision Logic
```python
# From main.py - Core routing decision
if mod.model_type != TDmodel.ModelType.NOT_TF:
    # Use TensorDetect for TensorFlow models (detailed analysis)
    print("TensorFlow format is detected, using TensorDetect...")
    # H5 or SavedModel specific scanning
else:
    # Use ModelScan for other formats (general security)
    print("Not a TensorFlow format, using ModelScan...")
    scanner = ModelScan(settings=DEFAULT_SETTINGS)
```

#### Operator and Ability Extraction
- **TensorFlow Models**: Extract specific operation names (`DebugIdentityV3`, `FixedLengthRecordDatasetV2`)
- **Security Abilities**: Map operations to capabilities (`Network access`, `Arbitrary file read`)
- **Regex Parsing**: `extract_op_from_description()` function in backend/main.py for operator name extraction

#### Async Processing Pipeline
1. File upload → temporary storage
2. Background scan task → status updates
3. Result processing → structured JSON output
4. History persistence → database-free storage

## Development Commands

### Development Environment Setup
```bash
# Core scanner environment (for CLI development)
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt

# Verify TensorFlow slim dependencies work
python -c "import sys; sys.path.append('tensorflow'); import tensorflow as tf; print('TF OK')"
```

### Local Development Modes

#### CLI-Only Development (Scanner Logic)
```bash
# Direct model analysis - no web server required
source .venv/bin/activate
python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb

# Test different formats
python main.py -m demo_models/lambda_savedmodel/
python main.py -m demo_models/data/example.pkl
```

#### Web Application Development (Full Stack)
```bash
# Quick start - both frontend and backend
./scripts/start-local.sh

# Manual setup for development
# Terminal 1: Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 5180 --reload

# Terminal 2: Frontend
cd frontend
npm install
npm run dev  # Development server at http://localhost:5173
```

#### Backend-Only Development (API Development)
```bash
./scripts/start.sh
# API docs at http://127.0.0.1:5180/docs
```

### Testing Commands
```bash
# Test individual scanners
python -c "
from TensorDetect import TDmodel, TDscan
model = TDmodel.Model('demo_models/tensorabuse_savedmodel/saved_model.pb')
scan = TDscan.SavedModelScan(model)
scan.scan()
scan.print_issues()
"

# Test modelscan pipeline
python -c "
from modelscan.modelscan import ModelScan
from modelscan.settings import DEFAULT_SETTINGS
scanner = ModelScan(settings=DEFAULT_SETTINGS)
results = scanner.scan('demo_models/data/example.pkl')
scanner.generate_report()
"
```

### Building and Deployment

#### CLI Executable Packaging
```bash
# Create standalone executable (for distribution)
./scripts/package.sh

# Manual packaging process:
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install pyinstaller
pyinstaller --onefile main.py

# Output: dist/main (standalone executable with bundled tensorflow/)
```

#### Web Application Deployment

##### Development Deployment
```bash
# Local development with both services
./scripts/start-local.sh

# Individual service management
./scripts/start.sh        # Backend only
./scripts/stop.sh         # Stop services
./scripts/restart.sh      # Restart services
```

##### Production Build
```bash
# Frontend production build
cd frontend
npm run build  # Creates frontend/dist/

# Backend production setup
cd backend
# Set production environment variables
export ENVIRONMENT=production
export PYTHONPATH="/path/to/malmodel_scan:/path/to/malmodel_scan/tensorflow"
uvicorn main:app --host 0.0.0.0 --port 5180 --workers 4

# Or use production startup script
uvicorn main:app --host 0.0.0.0 --port 5180 --workers 4 --log-level info
```

##### Static Frontend Deployment
```bash
# Deploy to GitHub Pages (from frontend directory)
cd frontend
npm run deploy

# Manual deployment
npm run build
# Upload frontend/dist/ contents to web server
```

#### Environment Configuration

##### Development Environment
```bash
# Required for both CLI and web development
export PYTHONPATH="$(pwd):$(pwd)/tensorflow:$PYTHONPATH"

# Backend specific
cd backend
export ENVIRONMENT=development
export DEBUG=true
source venv/bin/activate
uvicorn main:app --reload
```

##### Production Environment
```bash
# Set production variables
export ENVIRONMENT=production
export DEBUG=false
export CORS_ORIGINS="https://yourdomain.com"
export MAX_FILE_SIZE=100MB
export UPLOAD_DIR=/var/tmp/malmodel_scan

# Security settings
export RATE_LIMIT_ENABLED=true
export SANITIZE_UPLOADS=true
```

#### Docker Deployment (Optional)
```dockerfile
# Dockerfile example for backend
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5180
ENV PYTHONPATH=/app:/app/tensorflow
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5180"]
```

#### Deployment Architecture Patterns

##### Single-Server Deployment
- **Backend**: FastAPI with uvicorn (port 5180)
- **Frontend**: Static files served by nginx or CDN
- **Storage**: Local filesystem with periodic cleanup
- **Database**: JSON file storage (for scan history)

##### Load-Balanced Deployment
- **Multiple Backend Instances**: Behind load balancer
- **Shared Storage**: NFS or cloud storage for uploads
- **External Database**: PostgreSQL or MongoDB for scan history
- **Redis**: For session management and caching

#### Monitoring and Maintenance
```bash
# Health checks
curl http://127.0.0.1:5180/health

# Monitor disk usage (uploads directory)
du -sh backend/uploads/

# Clean up old uploads (add to cron)
find backend/uploads/ -type f -mtime +1 -delete

# Monitor memory usage
ps aux | grep uvicorn

# Log monitoring
tail -f backend/logs/app.log  # if configured
```

#### Security Considerations for Production
1. **File Upload Security**: Validate file types, scan for malware, limit sizes
2. **Network Security**: Use HTTPS, configure firewall rules
3. **Access Control**: Add authentication middleware to API
4. **Data Privacy**: Regular cleanup of uploaded files, encrypt sensitive data
5. **Rate Limiting**: Implement API rate limiting to prevent abuse

### Usage Examples

#### Command-Line Interface (Direct Model Analysis)
```bash
# Direct model scanning - no web server required
python main.py -m /path/to/model.h5                           # TensorFlow H5
python main.py -m /path/to/saved_model/                       # TensorFlow SavedModel directory
python main.py -m /path/to/saved_model.pb                     # TensorFlow SavedModel protobuf
python main.py -m /path/to/model.pkl                          # Pickle serialized model
python main.py -m /path/to/model.pt                           # PyTorch model
python main.py -m /path/to/model.pth                          # PyTorch checkpoint
python main.py -m /path/to/model.bin                          # Binary model format
python main.py -m /path/to/model.onnx                         # ONNX model
python main.py -m /path/to/model.tflite                       # TensorFlow Lite

# Using demo models for testing
python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb
python main.py -m demo_models/lambda_savedmodel/
python main.py -m demo_models/data/example.pkl

# Command-line options
python main.py --help                                        # Show all options
python main.py -m model.h5 --verbose                          # Verbose output
python main.py -m model.pt --output json                      # JSON output format
python main.py -m model.pkl --output report.txt              # Save to file
```

#### Web Interface
```bash
# Start full web application
./scripts/start-local.sh  # Starts frontend at http://localhost:5173
                         # Starts backend API at http://localhost:5180

# Or start services separately
./scripts/start.sh         # Backend API only
# In another terminal:
cd frontend && npm run dev  # Frontend development server
```

#### API Usage
```bash
# Health check
curl http://localhost:5180/health

# Upload and scan model via API
curl -X POST "http://localhost:5180/api/upload" \
  -F "file=@/path/to/model.h5"

# Check scan status
curl http://localhost:5180/api/scan/status/{scan_id}

# Get scan results
curl http://localhost:5180/api/scan/result/{scan_id}

# View scan history
curl http://localhost:5180/api/scans/history
```

## Model Format Detection and Support

The tool automatically detects model formats and routes to appropriate scanner:

### TensorFlow Models (TensorDetect Scanner)
- **Supported Formats**: `.h5`, `.hdf5`, `.pb` (SavedModel)
- **Detailed Analysis**: Extracts TensorFlow operations and security abilities
- **Operator Detection**: Shows specific TF operations (e.g., `DebugIdentityV3`, `FixedLengthRecordDatasetV2`)
- **Ability Classification**: categorizes security risks (e.g., "Network access", "Arbitrary file read")

### General ML Models (ModelScan Scanner)
- **Supported Formats**: `.pkl`, `.pickle`, `.pt`, `.pth`, `.onnx`, `.tflite`, `.bin`
- **General Security**: Focuses on common ML security patterns
- **Cross-Platform**: Works with PyTorch, ONNX, TensorFlow Lite, and serialized models

## Security Focus and Detection Capabilities

This is a defensive security tool that identifies:

### TensorFlow-Specific Threats (TensorDetect)
- Malicious TensorFlow operations with operator names
- Network access capabilities and data leakage risks
- File system access and arbitrary file operations
- Debugging operations that could expose sensitive data
- Suspicious distributed computing operations

### General ML Security Threats (ModelScan)
- Unsafe deserialization patterns
- Code injection in pickle files
- Suspicious imports and module loading
- File access beyond expected model paths
- Potential backdoors or model tampering

### Output Fields
- **算子 (Operator)**: Specific operation name from the model
- **能力 (Ability)**: Security capability classification
- **Severity**: Critical, High, Medium, Low risk levels
- **Location**: File or component where issue was found
- **Description**: Detailed security assessment

## Key Dependencies

### Core Scanner
- `tomlkit`: Configuration parsing
- `numpy`: Numerical computing
- `h5py`: HDF5 format handling for TensorFlow models
- `rich`: Enhanced console output
- `tensorflow`: ML framework (bundled dependencies in `tensorflow/`)

### Frontend (Vue 3 + TypeScript)
- `vue@^3.5.23`: Reactive UI framework
- `vue-router@^4.5.0`: Client-side routing
- `pinia@^2.3.0`: State management
- `@vueuse/core@^11.3.0`: Vue composition utilities
- `vite@^7.0.6`: Build tool and dev server
- `tailwindcss@^4.1.11`: Utility-first CSS framework

### Backend (FastAPI)
- `fastapi==0.115.6`: Modern web framework
- `uvicorn==0.34.0`: ASGI server
- `python-multipart==0.0.17`: File upload support
- `aiofiles==24.1.0`: Async file operations

## Web Interface Development

### Frontend Architecture
- **Vue 3 Composition API** with TypeScript for type safety
- **TailwindCSS** for responsive, utility-first styling
- **Vite** for fast development and optimized builds
- **Real-time Updates**: WebSocket-like polling for scan progress
- **File Upload**: Drag-and-drop interface with progress tracking

### Key Vue Components
- `FileUpload.vue`: File selection and upload with validation
- `ScanResults.vue`: Results display with operator/ability details
- `Home.vue`: Main scanning interface with file info display
- `History.vue`: Scan history and result management

### Backend API Features
- **FastAPI** with automatic OpenAPI documentation at `/docs`
- **Async Processing**: Background scanning with status polling
- **File Management**: Temporary upload handling with cleanup
- **CORS Support**: Enabled for frontend development
- **Health Checks**: `/health` endpoint for service monitoring

## Testing and Debugging

### Test Models and Scenarios
Available in `demo_models/` directory:
- `lambda_savedmodel/`: TensorFlow model with Lambda operations for testing function extraction
- `tensorabuse_savedmodel/`: Model with potentially abusive operations (`DebugIdentityV3`, `FixedLengthRecordDatasetV2`)
- `data/`: Various format test files (.pkl, .bin) for general ModelScan testing

### Development Testing Commands

#### Scanner Unit Testing
```bash
# Test TensorFlow format detection
python -c "
from TensorDetect import TDmodel
model = TDmodel.Model('demo_models/tensorabuse_savedmodel/saved_model.pb')
print(f'Model type: {model.model_type}')
"

# Test operation extraction
python -c "
from TensorDetect import TDmodel, TDscan
model = TDmodel.Model('demo_models/tensorabuse_savedmodel/saved_model.pb')
scan = TDscan.SavedModelScan(model)
scan.scan()
for issue in scan.issues:
    print(f'Severity: {issue.severity}, Operator: {issue.category}, Ability: {issue.ability}')
"

# Test backend API directly
python -c "
import sys; sys.path.append('backend')
from main import scan_model_file, extract_op_from_description
# Test operator extraction regex
test_desc = \"op: {'name': 'DebugIdentityV3', 'op': 'DebugIdentityV3'}\"
print(f'Extracted op: {extract_op_from_description(test_desc)}')
"
```

#### Integration Testing
```bash
# Full pipeline test with different formats
echo "Testing TensorFlow SavedModel..."
python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb

echo "Testing TensorFlow H5..."
python main.py -m demo_models/lambda_savedmodel/

echo "Testing Pickle format..."
python main.py -m demo_models/data/example.pkl

# Web interface testing
./scripts/start-local.sh
# Test upload with drag-and-drop, verify real-time updates
```

### Debugging Strategies

#### Scanner Development Debugging
```bash
# Enable verbose logging in scanners
export PYTHONPATH="${PYTHONPATH}:$(pwd):$(pwd)/tensorflow"

# Debug TensorDetect operation parsing
python -c "
from TensorDetect import TDmodel, TDscan
import logging
logging.basicConfig(level=logging.DEBUG)

model = TDmodel.Model('demo_models/tensorabuse_savedmodel/saved_model.pb')
scan = TDscan.SavedModelScan(model)
scan.scan()
print(f'Total issues found: {len(scan.issues)}')
"

# Debug ModelScan pipeline
python -c "
from modelscan.modelscan import ModelScan
from modelscan.settings import DEFAULT_SETTINGS
import logging
logging.basicConfig(level=logging.DEBUG)

scanner = ModelScan(settings=DEFAULT_SETTINGS)
results = scanner.scan('demo_models/data/example.pkl')
print(f'Issues by severity: {scanner.issues.group_by_severity()}')
"
```

#### Backend API Debugging
```bash
# Start backend with debug logging
cd backend
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 5180 --reload --log-level debug

# Test API endpoints manually
curl -X GET "http://127.0.0.1:5180/health"
curl -X GET "http://127.0.0.1:5180/api/scans/history"

# Test file upload with verbose output
curl -v -X POST "http://127.0.0.1:5180/api/upload" \
  -F "file=@demo_models/tensorabuse_savedmodel/saved_model.pb"
```

#### Frontend Debugging
```bash
cd frontend
npm run dev  # Opens browser with Vue devtools

# Check browser console for:
# - Upload progress events
# - Scan status polling results
# - Result rendering issues
# - Network request errors
```

### Performance Testing
```bash
# Test with larger models (add your own test files)
time python main.py -m /path/to/large_model.h5

# Stress test web API
for i in {1..5}; do
  curl -X POST "http://127.0.0.1:5180/api/upload" \
    -F "file=@demo_models/tensorabuse_savedmodel/saved_model.pb" &
done
wait

# Monitor memory usage during scans
python -c "
import psutil
import time
from TensorDetect import TDmodel, TDscan

process = psutil.Process()
print(f'Initial memory: {process.memory_info().rss / 1024 / 1024:.1f} MB')

model = TDmodel.Model('demo_models/tensorabuse_savedmodel/saved_model.pb')
scan = TDscan.SavedModelScan(model)
scan.scan()

print(f'After scan memory: {process.memory_info().rss / 1024 / 1024:.1f} MB')
"
```

## API and Frontend Integration Patterns

### Backend API Architecture

#### Core API Endpoints
```python
# File Upload and Processing
POST /api/upload
- Input: File upload via multipart/form-data
- Process: Validate file → Save temporarily → Start background scan
- Response: ScanResponse with scan_id and initial status

GET /api/scan/status/{scan_id}
- Purpose: Real-time status polling for scan progress
- Response: ScanStatus with progress percentage and message
- Usage: Frontend polls every 1-2 seconds during active scans

GET /api/scan/result/{scan_id}
- Purpose: Retrieve detailed scan results
- Response: ScanResult with issues, severity breakdown, metadata
- Cache: Results stored indefinitely in scan history

GET /api/scans/history
- Purpose: Retrieve all completed scans
- Response: ScanHistory with array of ScanResult objects
- Features: Pagination, filtering, sorting capabilities
```

#### Data Models and Serialization
```python
# Pydantic models for API consistency
class ScanResult(BaseModel):
    scan_id: str
    filename: str
    model_type: str  # "TensorFlow (H5)" or "TensorFlow (SavedModel)" or "Non-TensorFlow"
    scanner_used: str  # "TensorDetect" or "ModelScan"
    total_issues: int
    issues_by_severity: Dict[str, int]
    scan_time: datetime
    issues: List[Dict[str, Any]]  # Detailed issue information

class Issue(BaseModel):
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    description: str
    operator: str  # TensorFlow operation name or generic identifier
    ability: str   # Security capability (e.g., "Network access")
    location: str  # File path or model component
    op: str       # Extracted operation name from regex parsing
```

#### Background Task Processing
```python
async def scan_model_file(scan_id: str, file_path: str, filename: str):
    """Async background scan with status updates"""
    try:
        # Status: Starting scan
        SCAN_STATUS[scan_id] = {"status": "scanning", "progress": 25, "message": "Starting model scan..."}

        # Format detection and routing
        mod = TDmodel.Model(file_path)
        if mod.model_type != TDmodel.ModelType.NOT_TF:
            # TensorFlow scanning path
            scanner = TDscan.H5Scan(mod) if mod.model_type == TDmodel.ModelType.TF_H5 else TDscan.SavedModelScan(mod)
            SCAN_STATUS[scan_id] = {"status": "scanning", "progress": 75, "message": "Scanning with TensorDetect..."}
        else:
            # General model scanning path
            scanner = ModelScan(settings=DEFAULT_SETTINGS)
            SCAN_STATUS[scan_id] = {"status": "scanning", "progress": 75, "message": "Scanning with ModelScan..."}

        # Execute scan and process results
        scanner.scan()
        result = process_scan_results(scanner, filename, scan_id)

        # Final status and cleanup
        SCAN_STATUS[scan_id] = {"status": "completed", "progress": 100, "message": "Scan completed successfully"}
        SCAN_HISTORY.append(result)
        save_scan_history()
        cleanup_temp_file(file_path)

    except Exception as e:
        SCAN_STATUS[scan_id] = {"status": "failed", "progress": 0, "message": f"Scan failed: {str(e)}"}
        cleanup_temp_file(file_path)
```

### Frontend Integration Patterns

#### Vue 3 Composition API Services
```typescript
// frontend/src/services/scanService.ts
export class ScanService {
  private baseURL = 'http://127.0.0.1:5180'

  async uploadModel(file: File): Promise<ScanResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    return response.json()
  }

  async pollScanStatus(scanId: string): Promise<ScanStatus> {
    const response = await fetch(`${this.baseURL}/api/scan/status/${scanId}`)
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`)
    }
    return response.json()
  }

  async getScanResult(scanId: string): Promise<ScanResult> {
    const response = await fetch(`${this.baseURL}/api/scan/result/${scanId}`)
    if (!response.ok) {
      throw new Error(`Result retrieval failed: ${response.statusText}`)
    }
    return response.json()
  }

  async getScanHistory(): Promise<ScanHistory> {
    const response = await fetch(`${this.baseURL}/api/scans/history`)
    return response.json()
  }
}
```

#### Real-time Progress Monitoring
```vue
<!-- frontend/src/components/ScanProgress.vue -->
<template>
  <div class="scan-progress">
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: `${scanStatus.progress}%` }"
      ></div>
    </div>
    <p class="status-message">{{ scanStatus.message }}</p>
    <div v-if="scanStatus.status === 'completed'" class="success-indicator">
      ✓ Scan completed
    </div>
    <div v-else-if="scanStatus.status === 'failed'" class="error-indicator">
      ✗ Scan failed: {{ scanStatus.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { ScanStatus } from '@/types/scan'
import { ScanService } from '@/services/scanService'

const props = defineProps<{
  scanId: string
}>()

const scanStatus = ref<ScanStatus>({
  scan_id: props.scanId,
  status: 'queued',
  progress: 0,
  message: 'Scan queued...'
})

let pollInterval: number | null = null

const pollStatus = async () => {
  try {
    const status = await new ScanService().pollScanStatus(props.scanId)
    scanStatus.value = status

    if (status.status === 'completed' || status.status === 'failed') {
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
    }
  } catch (error) {
    console.error('Error polling scan status:', error)
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }
}

onMounted(() => {
  pollInterval = setInterval(pollStatus, 2000) // Poll every 2 seconds
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>
```

#### Results Display with Localization
```vue
<!-- frontend/src/components/ScanResults.vue -->
<template>
  <div class="scan-results">
    <div class="results-header">
      <h2>扫描结果</h2>
      <div class="severity-summary">
        <span v-for="(count, severity) in result.issues_by_severity"
              :key="severity"
              :class="`severity-${severity.toLowerCase()}`">
          {{ getSeverityLabel(severity) }}: {{ count }}
        </span>
      </div>
    </div>

    <div class="issues-list">
      <div v-for="issue in result.issues" :key="issue.operator" class="issue-card">
        <div class="issue-header">
          <span class="operator-label">算子: {{ issue.operator }}</span>
          <span :class="`severity-badge ${issue.severity.toLowerCase()}`">
            {{ getSeverityLabel(issue.severity) }}
          </span>
        </div>

        <div class="issue-details">
          <p><strong>能力:</strong> {{ translateAbility(issue.ability) }}</p>
          <p><strong>位置:</strong> {{ issue.location }}</p>
          <p><strong>描述:</strong> {{ issue.description }}</p>
          <p v-if="issue.op"><strong>操作:</strong> {{ issue.op }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScanResult } from '@/types/scan'

const props = defineProps<{
  result: ScanResult
}>()

const getSeverityLabel = (severity: string): string => {
  const labels: Record<string, string> = {
    'CRITICAL': '严重',
    'HIGH': '高',
    'MEDIUM': '中',
    'LOW': '低'
  }
  return labels[severity] || severity
}

const translateAbility = (ability: string): string => {
  const translations: Record<string, string> = {
    'Network access': '网络访问',
    'Arbitrary file read': '任意文件读取',
    'File system access': '文件系统访问',
    'Data leakage': '数据泄露',
    'Debug operations': '调试操作'
  }
  return translations[ability] || ability
}
</script>
```

### State Management with Pinia
```typescript
// frontend/src/stores/scanStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScanResult, ScanStatus } from '@/types/scan'
import { ScanService } from '@/services/scanService'

export const useScanStore = defineStore('scan', () => {
  // State
  const currentScan = ref<ScanResult | null>(null)
  const scanHistory = ref<ScanResult[]>([])
  const activeScans = ref<Map<string, ScanStatus>>(new Map())
  const isLoading = ref(false)

  // Computed
  const recentScans = computed(() =>
    scanHistory.value.slice().reverse().slice(0, 10)
  )

  const totalIssuesBySeverity = computed(() => {
    const totals: Record<string, number> = {}
    scanHistory.value.forEach(scan => {
      Object.entries(scan.issues_by_severity).forEach(([severity, count]) => {
        totals[severity] = (totals[severity] || 0) + count
      })
    })
    return totals
  })

  // Actions
  async function uploadAndScan(file: File) {
    isLoading.value = true
    try {
      const response = await new ScanService().uploadModel(file)
      activeScans.value.set(response.scan_id, {
        scan_id: response.scan_id,
        status: 'queued',
        progress: 0,
        message: response.message
      })
      return response.scan_id
    } finally {
      isLoading.value = false
    }
  }

  async function loadScanHistory() {
    try {
      const history = await new ScanService().getScanHistory()
      scanHistory.value = history.scans
    } catch (error) {
      console.error('Failed to load scan history:', error)
    }
  }

  function updateScanStatus(status: ScanStatus) {
    activeScans.value.set(status.scan_id, status)

    if (status.status === 'completed') {
      // Move from active to history
      activeScans.value.delete(status.scan_id)
      loadScanHistory() // Refresh history
    }
  }

  return {
    // State
    currentScan,
    scanHistory,
    activeScans,
    isLoading,

    // Computed
    recentScans,
    totalIssuesBySeverity,

    // Actions
    uploadAndScan,
    loadScanHistory,
    updateScanStatus
  }
})
```

### File Upload Integration
```vue
<!-- frontend/src/components/FileUpload.vue -->
<template>
  <div class="file-upload"
       @drop="handleDrop"
       @dragover.prevent
       @dragenter.prevent>

    <div class="upload-area" :class="{ 'drag-over': isDragOver }">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileSelect"
        :accept="allowedExtensions"
        class="file-input"
      />

      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <p class="upload-text">
          拖拽模型文件到此处或
          <button @click="$refs.fileInput.click()" class="browse-button">
            浏览文件
          </button>
        </p>
        <p class="supported-formats">
          支持格式: {{ allowedExtensions.join(', ') }}
        </p>
      </div>
    </div>

    <div v-if="selectedFile" class="file-preview">
      <div class="file-info">
        <span class="file-name">{{ selectedFile.name }}</span>
        <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
      </div>
      <button @click="uploadFile" :disabled="isUploading" class="upload-button">
        {{ isUploading ? '上传中...' : '开始扫描' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useScanStore } from '@/stores/scanStore'

const emit = defineEmits<{
  uploadSuccess: [scanId: string]
  uploadError: [error: Error]
}>()

const scanStore = useScanStore()

const allowedExtensions = ['.h5', '.hdf5', '.pb', '.pkl', '.pickle', '.pt', '.pth', '.onnx', '.tflite', '.zip']
const isDragOver = ref(false)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement>()

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    validateAndSelectFile(files[0])
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    validateAndSelectFile(files[0])
  }
}

const validateAndSelectFile = (file: File) => {
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(fileExt)) {
    emit('uploadError', new Error(`不支持的文件格式: ${fileExt}`))
    return
  }

  if (file.size > 100 * 1024 * 1024) { // 100MB limit
    emit('uploadError', new Error('文件大小超过限制 (100MB)'))
    return
  }

  selectedFile.value = file
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  isUploading.value = true
  try {
    const scanId = await scanStore.uploadAndScan(selectedFile.value)
    emit('uploadSuccess', scanId)
    selectedFile.value = null
  } catch (error) {
    emit('uploadError', error as Error)
  } finally {
    isUploading.value = false
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
```

### Data Flow and Integration

#### Complete Scan Processing Flow
1. **File Upload** → Frontend validates file → Backend saves temporarily → Returns scan_id
2. **Status Polling** → Frontend polls `/api/scan/status/{scan_id}` every 2 seconds → Updates progress bar
3. **Background Processing** → Backend detects format → Routes to appropriate scanner → Updates status
4. **Result Processing** → Scanner extracts operators → Maps to security abilities → Generates structured issues
5. **Frontend Display** → Real-time progress → Detailed results with Chinese localization → History management

#### Operator and Ability Extraction Pipeline
- **TensorDetect**: Parses TensorFlow GraphDef for operation metadata
- **Regex Extraction**: `extract_op_from_description()` function with multiple regex patterns
- **Ability Mapping**: TDsettings.py maps operations to security capabilities
- **Frontend Localization**: Chinese labels (算子, 能力) with technical details preserved

## Code Structure and Extensibility

### Adding New Model Format Support

#### Step 1: Extend Format Detection
```python
# In TensorDetect/TDmodel.py
class ModelType(Enum):
    TF_H5 = "Tensorflow h5 model"
    TF_SM = "Tensorflow saved model"
    NOT_TF = "Not a Tensorflow format"
    # Add new format
    NEW_FORMAT = "New ML format"

class Model:
    def __init__(self, path):
        # ... existing logic ...
        elif path.endswith(".new_ext"):
            self.model_type = ModelType.NEW_FORMAT
        # ... rest of detection logic ...
```

#### Step 2: Create New Scanner
```python
# In modelscan/scanners/new_format/scan.py
from modelscan.scanners.scan import ScanBase
from modelscan.issues import Issue, IssueSeverity, IssueCategory

class NewFormatScan(ScanBase):
    def scan(self) -> List[Issue]:
        """Implement format-specific scanning logic"""
        issues = []

        # Parse model file
        # Extract operations/metadata
        # Identify security issues

        return issues
```

#### Step 3: Register Scanner
```python
# In modelscan/modelscan.py
def _load_scanners(self):
    # ... existing scanner loading ...
    if "new_format" in self._settings.get("scan_exts", []):
        from modelscan.scanners.new_format.scan import NewFormatScan
        self._scanners_to_run.append(NewFormatScan(...))
```

### Modifying Detection Rules

#### TensorFlow Operation Rules
```python
# In TensorDetect/TDsettings.py
# Add new malicious operations
MALICIOUS_OPERATIONS = {
    "DebugIdentityV3": {
        "ability": "Network access",
        "severity": "HIGH",
        "description": "Can leak model data"
    },
    "YourNewOperation": {
        "ability": "Custom ability",
        "severity": "CRITICAL",
        "description": "Custom description"
    }
}
```

#### General Security Rules
```python
# In modelscan/settings.py
DEFAULT_SETTINGS = {
    "scan_exts": [".pkl", ".h5", ".pb", ".new_format"],
    "dangerous_imports": ["os", "subprocess", "socket"],
    "max_file_size": 100 * 1024 * 1024,  # 100MB
    # Add new settings
}
```

### Issue Classification System

#### Creating New Issue Types
```python
# In TensorDetect/TDissue.py
class IssueCategory(Enum):
    DEBUG_OPS = "Debug operations"
    FILE_ACCESS = "File access"
    NETWORK_ACCESS = "Network access"
    # Add new category
    CUSTOM_CATEGORY = "Custom category"

class IssueSeverity(Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class Issue:
    def __init__(self, severity, category, ability, details):
        self.severity = severity
        self.category = category
        self.ability = ability
        self.details = details
```

### Frontend Component Development

#### Adding New Result Display Components
```vue
<!-- In frontend/src/components/NewResultView.vue -->
<template>
  <div class="new-result-view">
    <h3>Custom Analysis Results</h3>
    <div v-for="result in customResults" :key="result.id">
      <!-- Custom result rendering -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ScanResult } from '@/types/scan'

interface CustomResult {
  id: string
  metric: string
  value: number
}

const props = defineProps<{
  scanResult: ScanResult
}>()

const customResults = computed(() => {
  // Transform scanResult.issues to custom format
  return props.scanResult.issues.map(issue => ({
    id: issue.operator,
    metric: issue.ability,
    value: parseSeverity(issue.severity)
  }))
})
</script>
```

#### Adding New API Services
```typescript
// In frontend/src/services/scanService.ts
export class ScanService {
  private baseURL = 'http://127.0.0.1:5180'

  async uploadCustomScan(file: File, options: CustomScanOptions): Promise<ScanResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(options))

    return fetch(`${this.baseURL}/api/upload-custom`, {
      method: 'POST',
      body: formData
    }).then(res => res.json())
  }
}
```

### Backend API Extension

#### Adding New Endpoints
```python
# In backend/main.py
@app.post("/api/scan/custom")
async def custom_scan(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    options: str = Form(...)
):
    """Custom scan endpoint with additional options"""
    try:
        scan_options = json.loads(options)
        scan_id = str(uuid.uuid4())

        # Process with custom options
        background_tasks.add_task(
            scan_model_file_with_options,
            scan_id,
            file_path,
            file.filename,
            scan_options
        )

        return ScanResponse(
            scan_id=scan_id,
            status="queued",
            message="Custom scan started"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Middleware Development

#### Creating Custom Middleware
```python
# In modelscan/middlewares/custom_middleware.py
from modelscan.middlewares.middleware import MiddlewareBase

class CustomAnalysisMiddleware(MiddlewareBase):
    def process(self, model_path: str, settings: dict) -> dict:
        """Custom analysis before scanning"""
        # Pre-scan analysis
        metadata = self.extract_metadata(model_path)

        # Add custom validation
        if not self.validate_model(model_path):
            raise ModelScanError("Invalid model format")

        return {
            "metadata": metadata,
            "validated": True
        }
```

### Configuration Management

#### Environment-Specific Settings
```python
# Create config.py
import os
from typing import Dict, Any

class Config:
    def __init__(self):
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        self.max_file_size = int(os.getenv("MAX_FILE_SIZE", "104857600"))  # 100MB

    def get_scanner_settings(self) -> Dict[str, Any]:
        if self.environment == "production":
            return {
                "strict_mode": True,
                "max_file_size": self.max_file_size,
                "allowed_extensions": [".h5", ".pb", ".pkl"]
            }
        else:
            return {
                "strict_mode": False,
                "max_file_size": self.max_file_size * 2,
                "allowed_extensions": [".h5", ".pb", ".pkl", ".pt", ".onnx"]
            }

config = Config()
```

### Testing New Components

#### Unit Tests for Scanners
```python
# In tests/test_new_scanner.py
import pytest
from modelscan.scanners.new_format.scan import NewFormatScan

def test_new_format_scan():
    scanner = NewFormatScan("test_files/sample.new")
    issues = scanner.scan()

    assert len(issues) > 0
    assert any(issue.severity == IssueSeverity.HIGH for issue in issues)

def test_malicious_pattern_detection():
    # Test specific malicious patterns
    pass
```

#### Frontend Component Tests
```typescript
// In tests/components/NewResultView.test.ts
import { mount } from '@vue/test-utils'
import NewResultView from '@/components/NewResultView.vue'
import type { ScanResult } from '@/types/scan'

describe('NewResultView', () => {
  it('displays custom results correctly', () => {
    const mockResult: ScanResult = {
      scan_id: 'test',
      issues: [
        { operator: 'TestOp', ability: 'TestAbility', severity: 'HIGH' }
      ]
    }

    const wrapper = mount(NewResultView, {
      props: { scanResult: mockResult }
    })

    expect(wrapper.text()).toContain('TestOp')
  })
})
```

## Known Issues and Development Notes

### Format Support Status
- ✅ **SavedModel (.pb)**: Full operator/ability detection working
- 🚧 **Pickle (.pkl)**: Basic scanning, needs enhanced operator extraction
- 🚧 **H5 (.h5)**: Basic scanning, needs TensorFlow operation parsing
- 🚧 **PyTorch (.pt/.pth)**: Basic scanning, needs operation-level analysis
- 🚧 **Binary (.bin)**: Basic scanning, needs format-specific parsing

### Performance Considerations
- **Async Processing**: Large models scanned in background to avoid timeouts
- **Memory Management**: Temporary files cleaned up after scanning
- **Rate Limiting**: Consider implementing for production deployment

### Development Priorities
1. **Enhanced Operation Extraction**: Improve operator extraction for non-TensorFlow formats
2. **Real-time Progress**: Implement WebSocket or SSE for better progress tracking
3. **Caching**: Add result caching for repeated scans of same files
4. **Authentication**: Add user authentication and authorization for API

## Build Artifacts and Deployment

- `build/` and `dist/`: PyInstaller build output for standalone executable
- `frontend/dist/`: Built Vue.js application for deployment
- `.venv/` and `backend/venv/`: Python virtual environments (should not be committed)
- `uploads/`: Temporary file storage (auto-cleaned, should not be committed)