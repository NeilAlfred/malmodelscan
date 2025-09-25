python -m venv .venv
# Linux / macOS
source .venv/bin/activate

# Windows
# .venv\Scripts\activate
pip install -r requirements.txt
pip install pyinstaller
pyinstaller --onefile main.py