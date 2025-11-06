# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MalModelScan** is a security tool for detecting malicious code and suspicious behavior in machine learning models. The project combines two specialized scanners:

- **TensorDetect**: TensorFlow model scanner (H5 and SavedModel formats)
- **ModelScan**: General-purpose scanner for other ML formats (PyTorch, Pickle, Keras, etc.)

## Architecture

The project uses a dual-scanner architecture with automatic format detection:

1. **Entry Point**: `main.py` - Main orchestrator that determines which scanner to use based on model format
2. **TensorDetect Module** (`TensorDetect/`): TensorFlow-specific security analysis
3. **ModelScan Module** (`modelscan/`): General scanning framework with extensible pipeline
4. **TensorFlow Dependencies** (`tensorflow/`): Bundled TF dependencies for standalone execution
5. **Demo Models** (`demo_models/`): Test cases including malicious examples

### Core Components

- `TDmodel.py`: Model type detection and format handling
- `TDscan.py`: Core TensorFlow scanning logic with malicious operation detection
- `TDsettings.py`: Configuration lists of malicious TensorFlow operations
- `modelscan/scanners/`: Format-specific scanners (H5, Keras, SavedModel, Pickle)
- `modelscan/middlewares/`: Extensible processing pipeline
- `modelscan/reports.py`: Reporting mechanisms (console, JSON)

## Development Commands

### Environment Setup
```bash
# Setup virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt
pip install pyinstaller  # For building executable
```

### Building
```bash
# Create standalone executable
pyinstaller --onefile main.py

# Or use the provided script
./package.sh
```

### Usage
```bash
# Scan TensorFlow models
python main.py -m /path/to/model.h5
python main.py -m /path/to/saved_model/

# Scan other ML models
python main.py -m /path/to/model.pkl
python main.py -m /path/to/model.pt
```

## Model Format Detection

The tool automatically detects model formats and routes to appropriate scanner:

- **TensorFlow formats** (H5, SavedModel) → TensorDetect
- **Other formats** (Pickle, PyTorch, Keras) → ModelScan

## Security Focus

This is a defensive security tool that identifies:
- Malicious TensorFlow operations
- Suspicious API calls
- Unsafe code patterns in ML models
- Potential backdoors or model tampering

## Key Dependencies

- `tomlkit`: Configuration parsing
- `numpy`: Numerical computing
- `h5py`: HDF5 format handling for TensorFlow models
- `rich`: Enhanced console output
- `tensorflow`: ML framework (bundled dependencies in `tensorflow/`)

## Testing

Test models are available in `demo_models/` directory:
- `lambda_savedmodel/`: Sample model with Lambda operations
- `tensorabuse_savedmodel/`: Model with potentially abusive operations
- `data/`: Sample data files

## Build Artifacts

- `build/` and `dist/`: PyInstaller build output
- `.venv/`: Python virtual environment (should not be committed)