# 小路工具箱 - 快速部署指南

## 🚀 部署概览

小路工具箱现已支持 **Cloudflare Pages** 和 **Netlify** 两种部署方式，提供高性能的全球 CDN 加速。

## ⚡ 快速开始

### 1. 本地测试

```bash
# 测试构建
npm run build

# 完整部署测试
npm run test:deploy
```

### 2. Cloudflare Pages 部署

#### 控制台部署
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → **创建项目** → **连接到 Git**
3. 选择你的仓库
4. 配置构建设置：
   - **框架预设**: 无
   - **构建命令**: `npm run build`
   - **构建输出目录**: `.`
   - **根目录**: `/`
   - **Node.js 版本**: `18.19.0`

#### CLI 部署
```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署项目
npm run deploy:cloudflare
```

### 3. Netlify 部署

#### 控制台部署
1. 登录 [Netlify](https://app.netlify.com/)
2. 点击 **New site from Git**
3. 选择你的仓库
4. 配置构建设置：
   - **构建命令**: `npm run build`
   - **发布目录**: `.`
   - **Node.js 版本**: `18.19.0`

#### CLI 部署
```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录 Netlify
netlify login

# 部署项目
npm run deploy:netlify
```

## 🤖 自动部署 (GitHub Actions)

项目已配置 GitHub Actions，推送代码时自动部署到两个平台：

1. 设置仓库 Secrets：
   - `CLOUDFLARE_API_TOKEN`: Cloudflare API 令牌
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户 ID
   - `NETLIFY_AUTH_TOKEN`: Netlify 认证令牌
   - `NETLIFY_SITE_ID`: Netlify 站点 ID

2. 推送代码即可触发自动部署

## 📁 项目结构

```
xiaolu-tool/
├── tools/              # 工具页面
├── css/                # 样式文件
├── js/                 # JavaScript 文件
├── images/             # 图片资源
├── scripts/            # 构建和部署脚本
├── .github/workflows/  # GitHub Actions
├── wrangler.toml       # Cloudflare Pages 配置
├── netlify.toml        # Netlify 配置
├── .npmrc              # NPM 配置
└── package.json        # 项目配置
```

## 🔧 配置文件说明

### wrangler.toml (Cloudflare Pages)
```toml
name = "xiaolu-tool"
compatibility_date = "2024-01-01"

[env.production]
name = "xiaolu-tool"

[build]
command = "npm run build"
watch_dir = "."

[vars]
NODE_ENV = "production"
NODE_VERSION = "18.19.0"
NPM_VERSION = "10"
```

### netlify.toml (Netlify)
```toml
[build]
command = "npm run build"
publish = "."

[build.environment]
NODE_VERSION = "18.19.0"
NPM_VERSION = "10"

[[headers]]
for = "/*"
[headers.values]
X-Frame-Options = "DENY"
X-Content-Type-Options = "nosniff"
```

## 🛠️ 可用脚本

```bash
npm run inject-components  # 注入组件
npm run build             # 构建项目
npm run dev               # 开发模式
npm run preview           # 预览构建结果
npm run deploy:cloudflare # 部署到 Cloudflare Pages
npm run deploy:netlify    # 部署到 Netlify
npm run test:build        # 测试构建
npm run test:deploy       # 完整部署测试
```

## 🔍 故障排除

### 常见问题

1. **构建失败**
   ```bash
   npm run test:deploy  # 运行诊断
   ```

2. **Node.js 版本问题**
   - 确保使用 Node.js 18.19.0 或更高版本
   - 检查 `.nvmrc` 文件

3. **依赖安装问题**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 部署检查清单

- [ ] 本地构建成功 (`npm run build`)
- [ ] 部署测试通过 (`npm run test:deploy`)
- [ ] 配置文件存在 (`wrangler.toml`, `netlify.toml`)
- [ ] GitHub Secrets 已设置（自动部署）
- [ ] 仓库已推送到 Git

## 📊 性能优化

- ✅ 静态资源 CDN 加速
- ✅ Gzip/Brotli 压缩
- ✅ 缓存策略优化
- ✅ 安全头配置
- ✅ 404 页面处理

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Netlify 文档](https://docs.netlify.com/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [详细部署指南](./DEPLOYMENT.md)

## 💡 提示

- 两个平台都支持自定义域名
- Cloudflare Pages 提供更好的全球性能
- Netlify 提供更丰富的功能和插件
- 建议同时部署到两个平台作为备份

---

🎉 **恭喜！** 你的小路工具箱现在可以部署到全球 CDN 了！