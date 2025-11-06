# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MalModelScan** is a security tool for detecting malicious code and suspicious behavior in machine learning models. The project combines two specialized scanners:

- **TensorDetect**: TensorFlow model scanner with detailed operation analysis
- **ModelScan**: General-purpose scanner for other ML formats (PyTorch, Pickle, Keras, etc.)

The system provides both command-line and web-based interfaces for comprehensive model security analysis.

## Architecture

The project uses a dual-scanner architecture with automatic format detection:

1. **Entry Point**: `main.py` - Main orchestrator that determines which scanner to use based on model format
2. **TensorDetect Module** (`TensorDetect/`): TensorFlow-specific security analysis with operator/ability detection
3. **ModelScan Module** (`modelscan/`): General scanning framework with extensible pipeline
4. **Frontend** (`frontend/`): Vue 3 + TypeScript web interface with real-time scanning
5. **Backend** (`backend/`): FastAPI web service for async file processing and API access
6. **TensorFlow Dependencies** (`tensorflow/`): Bundled slim TF dependencies for standalone execution
7. **Demo Models** (`demo_models/`): Test cases including malicious examples
8. **Scripts** (`scripts/`): Utility scripts for building, deployment, and service management

### Core Components

- `TDmodel.py`: Model type detection and format handling
- `TDscan.py`: Core TensorFlow scanning logic with malicious operation detection
- `TDsettings.py`: Configuration lists of malicious TensorFlow operations
- `TDissue.py`: Issue classification with severity levels and ability enumeration
- `modelscan/scanners/`: Format-specific scanners (H5, Keras, SavedModel, Pickle)
- `modelscan/middlewares/`: Extensible processing pipeline
- `modelscan/reports.py`: Reporting mechanisms (console, JSON)
- `backend/main.py`: FastAPI server with async background scanning
- `frontend/src/components/`: Vue components for file upload, scan results, and history

## Development Commands

### Local Development Setup
```bash
# Quick start with all services
./scripts/start-local.sh

# Core scanner setup
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt

# Frontend development
cd frontend
npm install
npm run dev    # Development server at http://localhost:5173

# Backend API development
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload  # API server at http://localhost:5180
```

### Building and Deployment
```bash
# Create standalone executable
./scripts/package.sh

# Or manually:
pyinstaller --onefile main.py

# Frontend build
cd frontend
npm run build
npm run deploy  # Deploy to GitHub Pages

# Service management
./scripts/start.sh        # Start both frontend and backend
./scripts/stop.sh         # Stop all services
./scripts/restart.sh      # Restart services
```

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

## Testing and Development

### Test Models
Available in `demo_models/` directory:
- `lambda_savedmodel/`: Sample model with Lambda operations
- `tensorabuse_savedmodel/`: Model with potentially abusive operations
- `data/`: Sample data files for testing

### Development Workflow
```bash
# Test specific model formats
python main.py -m demo_models/tensorabuse_savedmodel/saved_model.pb

# Test web interface locally
./scripts/start-local.sh

# Access API documentation
open http://localhost:5180/docs
```

## Data Flow and Integration

### Scan Processing Flow
1. **File Upload** → Backend validates and saves temporarily
2. **Format Detection** → Routes to TensorDetect or ModelScan
3. **Background Processing** → Async scanning with status updates
4. **Result Processing** → Extracts operators, abilities, and security details
5. **Frontend Display** → Real-time result presentation with detailed fields

### Operator and Ability Extraction
- **TensorDetect**: Parses TensorFlow operation metadata
- **Regex Extraction**: Extracts operator names from operation descriptions
- **Ability Mapping**: Maps operations to security capabilities
- **Frontend Display**: Shows Chinese labels (算子, 能力) with technical details

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

## Build Artifacts and Deployment

- `build/` and `dist/`: PyInstaller build output for standalone executable
- `frontend/dist/`: Built Vue.js application for deployment
- `.venv/` and `backend/venv/`: Python virtual environments (should not be committed)
- `uploads/`: Temporary file storage (auto-cleaned, should not be committed)