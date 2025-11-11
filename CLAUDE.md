# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MalModelScan** is a security tool for detecting malicious code and suspicious behavior in machine learning models. The project combines two specialized scanners:

- **TensorDetect**: TensorFlow model scanner with detailed operation analysis
- **ModelScan**: General-purpose scanner for other ML formats (PyTorch, Pickle, Keras, etc.)

The system provides both command-line and web-based interfaces for comprehensive model security analysis.

## Architecture

The project uses a dual-scanner architecture with automatic format detection:

- **Entry Point**: `main.py` - Main orchestrator that determines which scanner to use based on model format
- **TensorDetect Module** (`TensorDetect/`): TensorFlow-specific security analysis with operator/ability detection
- **ModelScan Module** (`modelscan/`): General scanning framework with extensible pipeline
- **Frontend** (`frontend/`): Vue 3 + TypeScript web interface with real-time scanning
- **Backend** (`backend/`): FastAPI web service for async file processing and API access
- **TensorFlow Dependencies** (`tensorflow/`): Bundled slim TF dependencies for standalone execution
- **Demo Models** (`demo_models/`): Test cases including malicious examples
- **Scripts** (`scripts/`): Utility scripts for building, deployment, and service management

### Core Components

- `TDmodel.py`: Model type detection and format handling
- `TDscan.py`: Core TensorFlow scanning logic with malicious operation detection
- `TDissue.py`: Issue classification with severity levels and ability enumeration
- `TDsettings.py`: Configuration lists of malicious TensorFlow operations
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