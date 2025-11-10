#!/bin/bash

# MalModelScan 项目自动安装脚本
# 作者: MalModelScan Team
# 版本: 1.0

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 显示欢迎信息
show_welcome() {
    echo "=============================================="
    echo "    MalModelScan 自动安装脚本 v1.0"
    echo "=============================================="
    echo ""
    echo "这个脚本将自动安装和配置 MalModelScan 项目"
    echo ""
    read -p "按 Enter 键继续，或 Ctrl+C 退出..."
    echo ""
}

# 检查系统要求
check_requirements() {
    log_info "检查系统要求..."

    # 检查 Python
    if command_exists python3; then
        log_success "Python: $(python3 --version)"
    else
        log_error "未找到 Python 3"
        log_info "请安装 Python: https://www.python.org/downloads/"
        exit 1
    fi

    # 检查 Node.js
    if command_exists node; then
        log_success "Node.js: $(node --version)"
    else
        log_error "未找到 Node.js"
        log_info "请安装 Node.js: https://nodejs.org/"
        exit 1
    fi

    # 检查 npm
    if command_exists npm; then
        log_success "npm: $(npm --version)"
    else
        log_error "未找到 npm"
        exit 1
    fi

    echo ""
}

# 设置 Python 环境
setup_python() {
    log_info "设置 Python 环境..."

    # 创建虚拟环境
    if [ ! -d ".venv" ]; then
        log_info "创建 Python 虚拟环境..."
        python3 -m venv .venv
        log_success "虚拟环境创建成功"
    else
        log_info "虚拟环境已存在"
    fi

    # 激活虚拟环境
    log_info "激活虚拟环境..."
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        source .venv/Scripts/activate
    else
        # Linux/macOS
        source .venv/bin/activate
    fi

    # 升级 pip
    log_info "升级 pip..."
    pip install --upgrade pip setuptools wheel

    # 安装依赖
    log_info "安装 Python 依赖..."
    pip install -r requirements.txt

    log_success "Python 环境设置完成"
    echo ""
}

# 设置 Node.js 环境
setup_nodejs() {
    log_info "设置 Node.js 环境..."

    cd frontend

    # 检查是否存在 node_modules
    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        npm install
    else
        log_info "前端依赖已存在，检查更新..."
        npm install
    fi

    cd ..
    log_success "Node.js 环境设置完成"
    echo ""
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."

    # 检查前端环境变量
    if [ ! -f "frontend/.env.development" ]; then
        log_warning "前端开发环境配置文件不存在，创建默认配置..."
        cat > frontend/.env.development << EOF
VITE_API_BASE_URL=http://127.0.0.1:5180
VITE_APP_TITLE=MalModelScan (开发环境)
VITE_APP_VERSION=1.0.0-dev
EOF
    fi

    if [ ! -f "frontend/.env.production" ]; then
        log_warning "前端生产环境配置文件不存在，创建默认配置..."
        cat > frontend/.env.production << EOF
VITE_API_BASE_URL=https://your-backend-service.onrender.com
VITE_APP_TITLE=MalModelScan
VITE_APP_VERSION=1.0.0
EOF
    fi

    # 检查后端环境变量
    if [ ! -f "backend/.env" ]; then
        log_warning "后端环境配置文件不存在，创建默认配置..."
        cat > backend/.env << EOF
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAX_FILE_SIZE=104857600
PYTHONPATH=${PWD}:${PWD}/tensorflow
EOF
    fi

    log_success "环境变量配置完成"
    echo ""
}

# 验证安装
verify_installation() {
    log_info "验证安装..."

    # 验证 Python 环境
    log_info "验证 Python 依赖..."
    python -c "
import sys
sys.path.append('tensorflow')
try:
    import tensorflow as tf
    print('✅ TensorFlow 导入成功')
except ImportError as e:
    print(f'❌ TensorFlow 导入失败: {e}')
    sys.exit(1)

try:
    import h5py
    print('✅ h5py 导入成功')
except ImportError as e:
    print(f'❌ h5py 导入失败: {e}')
    sys.exit(1)

print('✅ Python 依赖验证通过')
"

    # 验证前端构建
    log_info "验证前端构建..."
    cd frontend
    npm run build:prod > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        log_success "前端构建成功"
    else
        log_error "前端构建失败"
        exit 1
    fi
    cd ..

    log_success "安装验证完成"
    echo ""
}

# 显示完成信息
show_completion() {
    log_success "🎉 MalModelScan 安装完成！"
    echo ""
    echo "=============================================="
    echo "            启动指南"
    echo "=============================================="
    echo ""
    echo "1. 启动完整应用（推荐）："
    echo "   ./scripts/start-local.sh"
    echo ""
    echo "2. 分别启动服务："
    echo "   # 后端："
    echo "   cd backend && source ../.venv/bin/activate"
    echo "   uvicorn main:app --host 127.0.0.1 --port 5180 --reload"
    echo ""
    echo "   # 前端："
    echo "   cd frontend && npm run dev"
    echo ""
    echo "3. 访问地址："
    echo "   前端：http://localhost:5173"
    echo "   后端：http://127.0.0.1:5180"
    echo "   API文档：http://127.0.0.1:5180/docs"
    echo ""
    echo "4. 查看文档："
    echo "   README.md - 项目介绍"
    echo "   INSTALL.md - 详细安装指南"
    echo "   CLAUDE.md - 开发者指南"
    echo ""
    echo "=============================================="
}

# 主函数
main() {
    show_welcome
    check_requirements
    setup_python
    setup_nodejs
    setup_environment
    verify_installation
    show_completion

    echo ""
    log_info "安装脚本执行完成！现在可以启动 MalModelScan 了。"
}

# 错误处理
trap 'log_error "安装过程中发生错误，请检查上面的错误信息"; exit 1' ERR

# 运行主函数
main "$@" 