# 小路工具箱 - 多平台部署指南

本项目支持 **Cloudflare Pages** 和 **Netlify** 两种部署方式，可以根据需要选择合适的平台。

## 🚀 部署平台对比

| 特性 | Cloudflare Pages | Netlify |
|------|------------------|----------|
| **免费额度** | 无限制 | 100GB 带宽/月 |
| **全球CDN** | ✅ 优秀 | ✅ 良好 |
| **构建速度** | ✅ 快速 | ✅ 快速 |
| **自定义域名** | ✅ 免费 | ✅ 免费 |
| **HTTPS** | ✅ 自动 | ✅ 自动 |
| **边缘函数** | ✅ Workers | ✅ Edge Functions |
| **表单处理** | ❌ 需要Workers | ✅ 内置 |
| **分析统计** | ✅ 免费 | ✅ 基础免费 |

## 📋 部署前准备

### 1. 环境要求
- Node.js >= 18.19.0
- npm >= 10.0.0
- Git 仓库

### 2. 本地测试
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 本地预览
npm run preview
```

## 🌐 Cloudflare Pages 部署

### 方式一：控制台部署（推荐）

1. **连接 Git 仓库**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Pages" 页面
   - 点击 "Create a project"
   - 连接你的 GitHub/GitLab 仓库

2. **配置构建设置**
   ```
   框架预设: 无 (None)
   构建命令: npm run build
   构建输出目录: .
   根目录: /
   Node.js 版本: 18.19.0
   ```

3. **环境变量（可选）**
   ```
   NODE_ENV=production
   NODE_VERSION=18.19.0
   ```

### 方式二：Wrangler CLI 部署

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署项目**
   ```bash
   npm run deploy:cloudflare
   wrangler pages deploy . --project-name=xiaolu-tool
   ```

### 方式三：GitHub Actions 自动部署

1. **设置 Secrets**
   在 GitHub 仓库设置中添加：
   ```
   CLOUDFLARE_API_TOKEN=your_api_token
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   ```

2. **推送代码**
   ```bash
   git push origin main
   ```

## 🎯 Netlify 部署

### 方式一：控制台部署（推荐）

1. **连接 Git 仓库**
   - 登录 [Netlify](https://app.netlify.com/)
   - 点击 "New site from Git"
   - 选择你的 Git 提供商并授权
   - 选择仓库

2. **配置构建设置**
   ```
   构建命令: npm run build
   发布目录: .
   ```

3. **高级设置**
   - Node.js 版本: 18.19.0
   - 包管理器: npm

### 方式二：Netlify CLI 部署

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录 Netlify**
   ```bash
   netlify login
   ```

3. **初始化项目**
   ```bash
   netlify init
   ```

4. **部署项目**
   ```bash
   npm run deploy:netlify
   netlify deploy --prod
   ```

### 方式三：GitHub Actions 自动部署

1. **设置 Secrets**
   在 GitHub 仓库设置中添加：
   ```
   NETLIFY_AUTH_TOKEN=your_auth_token
   NETLIFY_SITE_ID=your_site_id
   ```

2. **推送代码**
   ```bash
   git push origin main
   ```

## 🔧 配置文件说明

### wrangler.toml (Cloudflare Pages)
```toml
name = "xiaolu-tool"
compatibility_date = "2024-07-15"

[env.production]
name = "xiaolu-tool"

pages_build_output_dir = "."

[build]
command = "npm run build"
watch_dir = "."
```

### netlify.toml (Netlify)
```toml
[build]
  command = "npm run build"
  publish = "."
  
[build.environment]
  NODE_VERSION = "18.19.0"
  NPM_VERSION = "10.0.0"
```

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理缓存
   npm cache clean --force
   
   # 重新安装依赖
   rm -rf node_modules package-lock.json
   npm install
   
   # 测试构建
   npm run test:build
   ```

2. **Node.js 版本问题**
   - 确保使用 Node.js 18.19.0 或更高版本
   - 在部署平台设置正确的 Node.js 版本

3. **路径问题**
   - 检查构建输出目录配置
   - 确保所有资源路径正确

### 调试技巧

1. **本地调试**
   ```bash
   # 启动开发服务器
   npm run dev
   
   # 构建并预览
   npm run preview
   ```

2. **查看构建日志**
   - Cloudflare Pages: 在 Dashboard 的 "Functions" > "Pages" 中查看
   - Netlify: 在站点设置的 "Deploys" 中查看

## 📊 性能优化

### 1. 缓存策略
- 静态资源（CSS/JS/图片）：1年缓存
- HTML文件：1小时缓存
- API响应：根据需要设置

### 2. 压缩优化
- 启用 Gzip/Brotli 压缩
- 优化图片格式和大小
- 压缩 CSS 和 JavaScript

### 3. CDN 配置
- 使用全球 CDN 加速
- 配置合适的缓存规则
- 启用 HTTP/2 和 HTTP/3

## 🔒 安全配置

### 安全头部
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

### HTTPS 配置
- 强制 HTTPS 重定向
- 配置 HSTS 头部
- 使用安全的 TLS 配置

## 📈 监控和分析
### Cloudflare Analytics

- 访问量统计
- 性能指标
- 安全事件监控

### Cloudflare Web Analytics（已配置）
网站已集成 Cloudflare Web Analytics：
```html
<!-- Cloudflare Web Analytics -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" 
        data-cf-beacon='{"token": "7ce07c493a0f4d95ad110a2118022829"}'></script>
```

**查看分析数据：**
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的域名
3. 点击左侧菜单 "Analytics & Logs" > "Web Analytics"
4. 查看实时访问数据、页面浏览量、访客来源等

**功能特点：**
- 实时数据分析
- 隐私友好（不使用 cookies）
- 轻量级脚本
- 详细的访客行为分析

### Netlify Analytics
- 页面浏览量
- 独立访客
- 热门页面分析

## 🆘 获取帮助

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Netlify 文档](https://docs.netlify.com/)
- [项目 Issues](https://github.com/xiaolu/xiaolu-tool/issues)

---

选择适合你需求的部署方式，开始使用小路工具箱吧！ 🚀