# 统一组件系统

本目录包含了工具箱网站的统一组件，用于确保所有页面的一致性和可维护性。

## 组件列表

### 1. 导航栏组件 (navbar.js)

**功能特性：**
- 统一的导航栏样式和布局
- 响应式设计，支持移动端
- 自动添加Font Awesome图标库
- 移动端菜单切换功能

**使用方法：**
```html
<!-- 在HTML文件的<head>标签内添加 -->
<script src="../components/navbar.js"></script>
```

**样式要求：**
- 确保body元素有 `display: flex; flex-direction: column;`
- 主容器需要 `flex: 1;` 属性

### 2. 页脚组件 (footer.js)

**功能特性：**
- 统一的页脚样式和内容
- 包含联系信息和友情链接
- 响应式设计
- 社交媒体链接

**使用方法：**
```html
<!-- 在HTML文件的<head>标签内添加 -->
<script src="../components/footer.js"></script>
```

## 自动化脚本

### 批量更新脚本 (../scripts/update-tools-navbar.js)

**功能：**
- 批量更新所有工具页面
- 自动添加组件引用
- 移除旧的导航栏和页脚HTML
- 更新CSS样式以支持flex布局

**运行方法：**
```bash
cd xiaolu-tool
node scripts/update-tools-navbar.js
```

## 新工具页面开发指南

### 1. 基本HTML结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>工具名称 | 小鹿工具箱</title>
    
    <!-- SEO和元数据 -->
    <meta name="description" content="工具描述">
    <!-- 其他meta标签... -->
    
    <!-- 导航栏和页脚组件 -->
    <script src="../components/navbar.js"></script>
    <script src="../components/footer.js"></script>
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        
        .container {
            flex: 1;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        /* 其他样式... */
    </style>
</head>
<body>
    <!-- 导航栏将自动生成 -->
    
    <div class="container">
        <!-- 工具内容 -->
    </div>
    
    <!-- 页脚将自动生成 -->
</body>
</html>
```

### 2. 必需的CSS样式

```css
body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.container {
    flex: 1;
}
```

### 3. 组件自定义

如果需要自定义导航栏或页脚，可以：

1. **修改组件文件**：直接编辑 `navbar.js` 或 `footer.js`
2. **添加自定义样式**：在页面中添加额外的CSS来覆盖默认样式
3. **条件加载**：根据页面类型动态调整组件内容

## 维护说明

### 更新导航栏

1. 编辑 `navbar.js` 文件
2. 运行批量更新脚本（如果需要）
3. 测试所有工具页面

### 更新页脚

1. 编辑 `footer.js` 文件
2. 更新会自动应用到所有页面

### 添加新工具

1. 按照开发指南创建新的HTML文件
2. 确保引用了组件脚本
3. 更新 `tools.json` 文件

## 注意事项

1. **Font Awesome依赖**：导航栏组件会自动加载Font Awesome图标库
2. **路径问题**：组件脚本使用相对路径 `../components/`，确保工具文件在 `tools/` 目录下
3. **样式冲突**：避免在工具页面中定义与组件冲突的CSS类名
4. **移动端适配**：组件已包含响应式设计，无需额外处理

## 故障排除

### 导航栏不显示
- 检查脚本路径是否正确
- 确认Font Awesome是否加载成功
- 查看浏览器控制台错误信息

### 页面布局异常
- 确认body元素有flex布局
- 检查主容器是否有 `flex: 1` 属性
- 验证CSS样式是否有冲突

### 移动端菜单不工作
- 确认JavaScript没有错误
- 检查移动端样式是否正确加载

## 版本历史

- **v1.0.0** (2025-01-13): 初始版本，包含基本的导航栏和页脚组件
- 支持响应式设计
- 自动化批量更新脚本
- 统一的样式系统