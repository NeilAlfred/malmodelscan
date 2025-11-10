# MalModelScan 快速部署决策指南

## 🤔 快速决策：选择适合你的部署方案

### 第一步：评估你的需求

#### 回答以下问题：

1. **你的使用场景是？**
   - 🎓 个人学习/演示项目 → 推荐 **GitHub Pages**
   - 🏢 企业内部应用 → 推荐 **自托管服务器**
   - 🧪 学术研究项目 → 推荐 **GitHub Pages**
   - 💼 商业产品 → 推荐 **自托管服务器**

2. **你的技术背景是？**
   - 🆕 新手/前端开发 → 推荐 **GitHub Pages**
   - 🔧 熟悉服务器运维 → 推荐 **自托管服务器**
   - 🎯 希望专注业务逻辑 → 推荐 **GitHub Pages**
   - 🛠️ 喜欢完全控制 → 推荐 **自托管服务器**

3. **你的预算和资源是？**
   - 💰 预算有限/免费优先 → 推荐 **GitHub Pages**
   - 💸 有服务器预算 → 推荐 **自托管服务器**
   - 🕒 时间紧张/快速上线 → 推荐 **GitHub Pages**
   - 🕰️ 有充足时间投入 → 推荐 **自托管服务器**

4. **你的数据安全要求是？**
   - 🔒 数据可以公开 → 推荐 **GitHub Pages**
   - 🏢 需要数据隐私 → 推荐 **自托管服务器**
   - 🔐 需要内网访问 → 必须 **自托管服务器**
   - 🌐 面向公众用户 → 推荐 **GitHub Pages**

### 第二步：查看推荐方案

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| **学生项目** | GitHub Pages | 免费、简单、学习友好 |
| **开源项目** | GitHub Pages | 与 GitHub 生态集成 |
| **企业内部工具** | 自托管服务器 | 数据安全、可定制 |
| **商业产品** | 自托管服务器 | 完全控制、可扩展 |
| **MVP/原型** | GitHub Pages | 快速验证、低成本 |
| **内网部署** | 自托管服务器 | 必须选择此方案 |
| **公网服务** | 两者皆可 | 看流量和预算 |

### 第三步：快速开始

#### 🚀 方案一：GitHub Pages 部署（5分钟上手）

```bash
# 1. 准备代码仓库
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. 配置前端环境变量
# 编辑 frontend/.env.production
# 将 VITE_API_BASE_URL 改为你的云服务地址

# 3. 部署前端
cd frontend
npm run deploy

# 4. 配置 GitHub Pages
# 访问 GitHub → Settings → Pages → Source: gh-pages

# 5. 部署后端（选择云服务）
# 参考 DEPLOYMENT.md 中的云服务指南
```

**预计时间**: 30分钟到 2小时

#### 🏠 方案二：自托管服务器部署（1-4小时）

```bash
# 1. 准备服务器（Linux 推荐）
# 购买云服务器或使用本地服务器
# 推荐配置：2核4GB，Ubuntu 22.04

# 2. 一键安装
curl -sSL https://raw.githubusercontent.com/yourusername/malmodel-scan/main/scripts/setup.sh | bash

# 3. 配置服务器
sudo bash /opt/malmodel-scan/scripts/setup-server.sh

# 4. 启动服务
sudo systemctl start malmodel-scan-backend
sudo systemctl start nginx

# 5. 配置域名和SSL（可选）
# 参考 DEPLOYMENT.md 中的 SSL 配置部分
```

**预计时间**: 1-4小时（包含学习时间）

## 📚 详细文档导航

| 需求 | 文档 | 章节 |
|------|------|------|
| **新手入门** | README.md | 快速开始 |
| **完整安装** | INSTALL.md | 系统要求 → 环境配置 |
| **GitHub Pages** | DEPLOYMENT.md | 方案一完整指南 |
| **自托管服务器** | DEPLOYMENT.md | 方案二完整指南 |
| **开发指南** | CLAUDE.md | 架构和开发 |
| **项目概览** | PROJECT_OVERVIEW.md | 项目结构说明 |

## 🆘 常见问题

### Q: 我可以后续切换部署方案吗？
**A**: 可以！两种方案的应用代码完全相同，只需要：
- 方案一 → 方案二：按照自托管指南部署后端，修改前端配置
- 方案二 → 方案一：构建前端，部署到 GitHub Pages

### Q: 哪种方案性能更好？
**A**:
- **小流量**: 两者性能相近
- **大流量**: 自托管服务器性能更好，因为可以独立扩容后端

### Q: 哪种方案更安全？
**A**:
- **GitHub Pages**: GitHub 负责安全，适合公开数据
- **自托管服务器**: 自己负责安全，适合敏感数据

### Q: 我可以混合使用吗？
**A**: 可以！你可以：
- 前端部署到 GitHub Pages
- 后端自托管在服务器上
- 前端部署到服务器，后端使用云服务

## 🎯 快速命令参考

### GitHub Pages 部署命令
```bash
# 部署前端
npm run deploy

# 查看部署状态
curl https://yourusername.github.io/malmodel-scan/health
```

### 自托管服务器部署命令
```bash
# 一键安装
./scripts/setup.sh

# 检查服务状态
sudo systemctl status malmodel-scan-backend
sudo systemctl status nginx

# 重启服务
sudo systemctl restart malmodel-scan-backend
```

## 🔗 有用的链接

- **项目主页**: [GitHub Repository](https://github.com/yourusername/malmodel-scan)
- **完整文档**: [项目文档](README.md)
- **安装指南**: [详细安装](INSTALL.md)
- **部署指南**: [部署文档](DEPLOYMENT.md)
- **开发者指南**: [CLAUDE.md](CLAUDE.md)

---

**💡 提示**: 如果你还是不确定，建议先尝试 **GitHub Pages 方案**，因为它完全免费且部署简单，可以让你快速验证项目是否适合你的需求。如果后续需要更高级的功能，可以随时切换到自托管方案。

**🎉 选择最适合你的方案，开始部署吧！**