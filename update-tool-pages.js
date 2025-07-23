// 批量更新工具页面脚本 - 移除硬编码组件，添加组件管理器
const fs = require('fs');
const path = require('path');

// 获取所有HTML文件
function getAllHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && item.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// 更新单个HTML文件
function updateHtmlFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 1. 移除硬编码的导航栏HTML（如果存在）
        const navbarRegex = /<header[^>]*>[\s\S]*?<\/header>/gi;
        if (navbarRegex.test(content)) {
            content = content.replace(navbarRegex, '<div id="navbar-container"></div>');
            modified = true;
            console.log(`  - 移除导航栏HTML: ${path.basename(filePath)}`);
        }
        
        // 2. 移除硬编码的页脚HTML（如果存在）
        const footerRegex = /<footer[^>]*>[\s\S]*?<\/footer>/gi;
        if (footerRegex.test(content)) {
            content = content.replace(footerRegex, '<div id="footer-container"></div>');
            modified = true;
            console.log(`  - 移除页脚HTML: ${path.basename(filePath)}`);
        }
        
        // 3. 移除硬编码的工具分类HTML（如果存在）
        const categoriesRegex = /<aside[^>]*class="[^"]*sidebar-left[^"]*"[^>]*>[\s\S]*?<\/aside>/gi;
        if (categoriesRegex.test(content)) {
            content = content.replace(categoriesRegex, '<div id="tool-categories-container"></div>');
            modified = true;
            console.log(`  - 移除工具分类HTML: ${path.basename(filePath)}`);
        }
        
        // 4. 确保页脚容器存在
        if (!content.includes('footer-container')) {
            // 在</body>标签前添加页脚容器
            const bodyEndRegex = /<\/body>/i;
            if (bodyEndRegex.test(content)) {
                content = content.replace(bodyEndRegex, `    <!-- 页脚容器 -->\n    <div id="footer-container"></div>\n\n</body>`);
                modified = true;
                console.log(`  - 添加页脚容器: ${path.basename(filePath)}`);
            }
        }
        
        // 5. 添加组件管理器脚本引用（如果不存在）
        if (!content.includes('component-manager.js')) {
            const scriptTag = '<script src="../components/component-manager.js"></script>';
            const bodyEndRegex = /<\/body>/i;
            if (bodyEndRegex.test(content)) {
                content = content.replace(bodyEndRegex, `    ${scriptTag}\n</body>`);
                modified = true;
                console.log(`  - 添加组件管理器脚本: ${path.basename(filePath)}`);
            }
        }
        
        // 6. 移除重复的组件初始化代码
        const duplicateInitRegex = /<script>[\s\S]*?\/\/\s*初始化组件管理器[\s\S]*?<\/script>/gi;
        if (duplicateInitRegex.test(content)) {
            // 保留component-manager.js脚本引用，移除重复的初始化代码
            content = content.replace(duplicateInitRegex, '');
            modified = true;
            console.log(`  - 移除重复的组件初始化代码: ${path.basename(filePath)}`);
        }
        
        // 7. 移除旧的组件脚本引用
        const oldScriptPatterns = [
            /<script[^>]*src="[^"]*navbar\.js"[^>]*><\/script>/gi,
            /<script[^>]*src="[^"]*footer\.js"[^>]*><\/script>/gi,
            /<script[^>]*src="[^"]*tool-categories\.js"[^>]*><\/script>/gi,
            /<script[^>]*src="[^"]*category-manager\.js"[^>]*><\/script>/gi
        ];
        
        oldScriptPatterns.forEach((pattern, index) => {
            const scriptNames = ['navbar.js', 'footer.js', 'tool-categories.js', 'category-manager.js'];
            if (pattern.test(content)) {
                content = content.replace(pattern, '');
                modified = true;
                console.log(`  - 移除旧脚本引用 ${scriptNames[index]}: ${path.basename(filePath)}`);
            }
        });
        
        // 8. 移除旧的组件初始化代码
        const oldInitPatterns = [
            /new FooterComponent\(\);?/gi,
            /new NavbarComponent\(\);?/gi,
            /new ToolCategories\(\);?/gi,
            /window\.toolCategories\s*=\s*new\s+ToolCategories\(\);?/gi
        ];
        
        oldInitPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                content = content.replace(pattern, '');
                modified = true;
                console.log(`  - 移除旧的组件初始化代码: ${path.basename(filePath)}`);
            }
        });
        
        // 保存文件
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 更新完成: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`⏭️  无需更新: ${path.basename(filePath)}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ 更新失败 ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

// 主函数
function main() {
    console.log('🚀 开始批量更新工具页面...');
    
    const toolsDir = path.join(__dirname, 'tools');
    
    if (!fs.existsSync(toolsDir)) {
        console.error('❌ tools 目录不存在');
        return;
    }
    
    const htmlFiles = getAllHtmlFiles(toolsDir);
    console.log(`📁 找到 ${htmlFiles.length} 个HTML文件`);
    
    let updatedCount = 0;
    
    htmlFiles.forEach(filePath => {
        console.log(`\n📄 处理文件: ${path.basename(filePath)}`);
        if (updateHtmlFile(filePath)) {
            updatedCount++;
        }
    });
    
    console.log(`\n🎉 批量更新完成!`);
    console.log(`📊 总计: ${htmlFiles.length} 个文件，更新: ${updatedCount} 个文件`);
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = { updateHtmlFile, getAllHtmlFiles };