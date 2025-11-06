# MalModelScan Frontend

这是 MalModelScan AI模型安全检查工具的现代化前端界面。

## 功能特性

- 🚀 **现代化界面**: 基于 Vue 3 + TypeScript + TailwindCSS 构建
- 📁 **多格式支持**: 支持 TensorFlow (.h5, .pb) 和 PyTorch (.pkl, .pt) 等主流模型格式
- 🔍 **安全扫描**: 集成 TensorDetect 和 ModelScan 双引擎扫描
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 📊 **详细报告**: 提供完整的安全风险分析和修复建议

## 技术栈

- **Vue 3.5.23** - 现代化前端框架
- **TypeScript 5.8.0** - 类型安全
- **Vite 7.0.6** - 快速构建工具
- **TailwindCSS 4.1.11** - 原子化CSS框架
- **Vue Router** - 路由管理
- **Pinia** - 状态管理

## 开发环境设置

### 安装依赖
```bash
cd frontend
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

### 部署到 GitHub Pages
```bash
npm run deploy
```

## 项目结构

```
frontend/
├── src/
│   ├── components/          # Vue组件
│   │   ├── FileUpload.vue   # 文件上传组件
│   │   ├── ScanResults.vue  # 扫描结果展示
│   │   └── LoadingSpinner.vue # 加载动画
│   ├── views/               # 页面视图
│   │   └── Home.vue         # 主页面
│   ├── services/            # 服务层
│   │   └── scanner.ts       # 扫描服务
│   ├── App.vue              # 根组件
│   ├── main.ts              # 应用入口
│   └── style.css            # 全局样式
├── public/                  # 静态资源
├── .github/workflows/       # GitHub Actions
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 部署说明

该项目配置了 GitHub Pages 自动部署，当代码推送到 main 分支时会自动触发部署流程。

1. 确保仓库启用了 GitHub Pages
2. 在仓库设置中配置 GitHub Pages 源为 gh-pages 分支
3. 推送代码到 main 分支即可自动部署

## 自定义配置

### 修改部署路径
在 `vite.config.ts` 中修改 `base` 配置：
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

### 连接真实后端API
在 `src/services/scanner.ts` 中配置 API 端点：
```typescript
const apiService = new ApiScannerService('https://your-api-domain.com/api')
```

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

本项目遵循 MIT 许可证。