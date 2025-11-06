from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import sys
import uuid
import json
import asyncio
import tempfile
import shutil
from datetime import datetime
from pathlib import Path

# Add parent directory to path to import scanner modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from TensorDetect import TDmodel, TDscan
from modelscan.modelscan import ModelScan
from modelscan.settings import DEFAULT_SETTINGS

app = FastAPI(
    title="MalModelScan API",
    description="Machine Learning Model Security Scanner API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data storage (in production, use a proper database)
SCAN_HISTORY = []
SCAN_STATUS = {}  # scan_id -> status tracking

# Data models
class ScanResponse(BaseModel):
    scan_id: str
    status: str
    message: str

class ScanResult(BaseModel):
    scan_id: str
    filename: str
    model_type: str
    scanner_used: str
    total_issues: int
    issues_by_severity: Dict[str, int]
    scan_time: datetime
    issues: List[Dict[str, Any]]

class ScanStatus(BaseModel):
    scan_id: str
    status: str
    progress: Optional[int] = None
    message: Optional[str] = None

class ScanHistory(BaseModel):
    scans: List[ScanResult]
    total_count: int

# Utility functions
def extract_op_from_description(description: str) -> str:
    """Extract TensorFlow operation name from issue description"""
    import re

    # Priority 1: Look for patterns like op: {'name': 'Save', 'op': 'Save', ...}
    op_name_match = re.search(r"op:\s*\{'[^']*name':\s*'([^']+)'", description)
    if op_name_match:
        return op_name_match.group(1)

    # Priority 2: Look for patterns like 'name': 'Save' within op context
    op_context_match = re.search(r"op:\s*\{[^}]*'name':\s*'([^']+)'", description)
    if op_context_match:
        return op_context_match.group(1)

    # Priority 3: Look for patterns like 'op': 'DebugIdentityV3'
    op_match = re.search(r"'op':\s*'([^']+)'", description)
    if op_match:
        return op_match.group(1)

    # Priority 4: Look for patterns like op: DebugIdentityV3 (not quoted)
    op_match2 = re.search(r"op:\s*'([^']+)'", description)
    if op_match2:
        return op_match2.group(1)

    # Priority 5: Look for patterns like {'name': 'DebugIdentityV3', 'op': 'DebugIdentityV3', ...}
    name_match = re.search(r"'name':\s*'([^']+)'", description)
    if name_match:
        return name_match.group(1)

    # Priority 6: Look for operators that are mentioned directly in text
    # Pattern for "Operator: OpName" or similar
    operator_match = re.search(r"Operator:\s*(\w+)", description)
    if operator_match:
        return operator_match.group(1)

    return "Unknown"

def get_scan_history_path():
    """Get path to scan history file"""
    backend_dir = Path(__file__).parent
    return backend_dir / "scan_history.json"

def load_scan_history():
    """Load scan history from file"""
    history_file = get_scan_history_path()
    if history_file.exists():
        try:
            with open(history_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading scan history: {e}")
    return []

def save_scan_history():
    """Save scan history to file"""
    history_file = get_scan_history_path()
    try:
        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump(SCAN_HISTORY, f, ensure_ascii=False, indent=2, default=str)
    except Exception as e:
        print(f"Error saving scan history: {e}")

def get_upload_dir():
    """Get or create upload directory"""
    backend_dir = Path(__file__).parent
    upload_dir = backend_dir / "uploads"
    upload_dir.mkdir(exist_ok=True)
    return upload_dir

# Scan functions
async def scan_model_file(scan_id: str, file_path: str, filename: str):
    """Scan a model file and update status"""
    # Store original file path for reporting
    original_filename = filename
    try:
        # Update status
        SCAN_STATUS[scan_id] = {"status": "scanning", "progress": 25, "message": "Starting model scan..."}

        # Determine model type and scan
        mod = TDmodel.Model(file_path)
        scan_result = {
            "scan_id": scan_id,
            "filename": filename,
            "model_type": "unknown",
            "scanner_used": "unknown",
            "total_issues": 0,
            "issues_by_severity": {},
            "scan_time": datetime.now().isoformat(),
            "issues": []
        }

        SCAN_STATUS[scan_id] = {"status": "scanning", "progress": 50, "message": "Analyzing model format..."}

        if mod.model_type != TDmodel.ModelType.NOT_TF:
            # TensorFlow model detected
            print("TensorFlow format is detected, using TensorDetect...")
            scan_result["model_type"] = f"TensorFlow ({'H5' if mod.model_type == TDmodel.ModelType.TF_H5 else 'SavedModel'})"
            scan_result["scanner_used"] = "TensorDetect"

            SCAN_STATUS[scan_id] = {"status": "scanning", "progress": 75, "message": "Scanning with TensorDetect..."}

            if mod.model_type == TDmodel.ModelType.TF_H5:
                sc = TDscan.H5Scan(mod)
            elif mod.model_type == TDmodel.ModelType.TF_SM:
                sc = TDscan.SavedModelScan(mod)

            sc.scan()

            # Extract issues
            for issue in sc.issues:
                issue_data = {
                    "severity": issue.severity.value if hasattr(issue.severity, 'value') else str(issue.severity),
                    "description": issue.details if hasattr(issue, 'details') else str(issue),
                    "operator": issue.category.value if hasattr(issue.category, 'value') else str(issue.category),
                    "location": original_filename,  # Use original filename as location
                    "ability": issue.ability.value if hasattr(issue, 'ability') and hasattr(issue.ability, 'value') else str(getattr(issue, 'ability', 'Unknown')),
                    "op": extract_op_from_description(issue.details) if hasattr(issue, 'details') else "Unknown"
                }
                scan_result["issues"].append(issue_data)

            scan_result["total_issues"] = len(sc.issues)

        else:
            # Not TensorFlow model, use ModelScan
            print("Not a TensorFlow format, using ModelScan...")
            scan_result["model_type"] = "Non-TensorFlow"
            scan_result["scanner_used"] = "ModelScan"

            SCAN_STATUS[scan_id] = {"status": "scanning", "progress": 75, "message": "Scanning with ModelScan..."}

            scanner = ModelScan(settings=DEFAULT_SETTINGS)
            results = scanner.scan(file_path)

            # Extract issues
            if scanner.issues.all_issues:
                for issue in scanner.issues.all_issues:
                    scan_result["issues"].append({
                        "severity": getattr(issue, 'severity', 'unknown'),
                        "description": getattr(issue, 'description', str(issue)),
                        "operator": getattr(issue, 'operator', 'unknown'),
                        "location": getattr(issue, 'location', 'unknown')
                    })

                scan_result["total_issues"] = len(scanner.issues.all_issues)

                # Group by severity
                issues_by_severity = scanner.issues.group_by_severity()
                scan_result["issues_by_severity"] = {
                    severity: len(issues) for severity, issues in issues_by_severity.items()
                }

        # Update final status
        SCAN_STATUS[scan_id] = {"status": "completed", "progress": 100, "message": "Scan completed successfully"}

        # Add to history
        SCAN_HISTORY.append(scan_result)
        save_scan_history()

        # Clean up uploaded file
        try:
            os.unlink(file_path)
        except:
            pass

    except Exception as e:
        # Update status with error
        SCAN_STATUS[scan_id] = {"status": "failed", "progress": 0, "message": f"Scan failed: {str(e)}"}

        # Clean up uploaded file
        try:
            os.unlink(file_path)
        except:
            pass

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "MalModelScan API is running", "version": "1.0.0"}

@app.post("/api/upload", response_model=ScanResponse)
async def upload_model(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Upload a model file for scanning"""

    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Check file extension
    allowed_extensions = ['.h5', '.hdf5', '.pb', '.pkl', '.pickle', '.pt', '.pth', '.onnx', '.tflite']
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed formats: {', '.join(allowed_extensions)}"
        )

    # Generate scan ID
    scan_id = str(uuid.uuid4())

    try:
        # Save uploaded file
        upload_dir = get_upload_dir()
        file_path = upload_dir / f"{scan_id}_{file.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Initialize scan status
        SCAN_STATUS[scan_id] = {"status": "queued", "progress": 0, "message": "File uploaded, scan queued..."}

        # Start background scan
        background_tasks.add_task(scan_model_file, scan_id, str(file_path), file.filename)

        return ScanResponse(
            scan_id=scan_id,
            status="queued",
            message="File uploaded successfully. Scan started in background."
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@app.get("/api/scan/status/{scan_id}", response_model=ScanStatus)
async def get_scan_status(scan_id: str):
    """Get the status of a running scan"""
    if scan_id not in SCAN_STATUS:
        raise HTTPException(status_code=404, detail="Scan ID not found")

    status_data = SCAN_STATUS[scan_id]
    return ScanStatus(
        scan_id=scan_id,
        status=status_data["status"],
        progress=status_data.get("progress"),
        message=status_data.get("message")
    )

@app.get("/api/scan/result/{scan_id}", response_model=ScanResult)
async def get_scan_result(scan_id: str):
    """Get the result of a completed scan"""
    # Find scan in history
    for scan in SCAN_HISTORY:
        if scan["scan_id"] == scan_id:
            return ScanResult(**scan)

    raise HTTPException(status_code=404, detail="Scan result not found")

@app.get("/api/scans/history", response_model=ScanHistory)
async def get_scan_history():
    """Get all scan history"""
    return ScanHistory(
        scans=SCAN_HISTORY,
        total_count=len(SCAN_HISTORY)
    )

@app.delete("/api/scans/history")
async def clear_scan_history():
    """Clear all scan history"""
    global SCAN_HISTORY
    SCAN_HISTORY = []
    save_scan_history()
    return {"message": "Scan history cleared successfully"}

@app.get("/api/scans/active")
async def get_active_scans():
    """Get all currently active scans"""
    active_scans = []
    for scan_id, status_data in SCAN_STATUS.items():
        if status_data["status"] in ["queued", "scanning"]:
            active_scans.append({
                "scan_id": scan_id,
                "status": status_data["status"],
                "progress": status_data.get("progress", 0),
                "message": status_data.get("message", "")
            })

    return {"active_scans": active_scans, "count": len(active_scans)}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Load scan history on startup"""
    global SCAN_HISTORY
    SCAN_HISTORY = load_scan_history()
    print("MalModelScan API started successfully")
    print("API Documentation available at: http://127.0.0.1:5180/docs")

@app.on_event("shutdown")
async def shutdown_event():
    """Save scan history on shutdown"""
    save_scan_history()
    print("MalModelScan API shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5180, log_level="info")