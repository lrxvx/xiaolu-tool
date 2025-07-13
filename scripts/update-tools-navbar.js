// 批量更新工具页面导航栏和页脚的脚本
const fs = require('fs');
const path = require('path');

// 工具目录路径
const toolsDir = path.join(__dirname, '../tools');

// 需要添加的组件引用
const componentScripts = `
    <!-- 导航栏和页脚组件 -->
    <script src="../components/navbar.js"></script>
    <script src="../components/footer.js"></script>`;

// 统一的导航栏HTML（用于替换现有的不一致导航栏）
const unifiedNavbar = `
    <!-- 导航栏将通过JavaScript组件自动生成 -->`;

// 统一的页脚HTML（用于替换现有的不一致页脚）
const unifiedFooter = `
    <!-- 页脚将通过JavaScript组件自动生成 -->`;

// 需要在body标签中添加的样式
const bodyFlexStyles = `
            display: flex;
            flex-direction: column;`;

// 需要在主容器中添加的样式
const containerFlexStyles = `
            flex: 1;`;

function updateToolFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 1. 添加组件脚本引用（如果不存在）
        if (!content.includes('navbar.js') || !content.includes('footer.js')) {
            // 在</head>标签前添加组件脚本
            content = content.replace('</head>', `${componentScripts}
</head>`);
            modified = true;
            console.log(`✓ 添加组件脚本到: ${path.basename(filePath)}`);
        }
        
        // 2. 确保body有flex布局
        if (!content.includes('display: flex') || !content.includes('flex-direction: column')) {
            // 查找body样式并添加flex属性
            const bodyStyleRegex = /(body\s*{[^}]*)/;
            if (bodyStyleRegex.test(content)) {
                content = content.replace(bodyStyleRegex, (match) => {
                    if (!match.includes('display: flex')) {
                        return match + bodyFlexStyles;
                    }
                    return match;
                });
                modified = true;
                console.log(`✓ 更新body样式: ${path.basename(filePath)}`);
            }
        }
        
        // 3. 移除现有的导航栏HTML和样式
        const navbarPatterns = [
            /<header[^>]*>[\s\S]*?<\/header>/gi,
            /<nav[^>]*>[\s\S]*?<\/nav>/gi
        ];
        
        navbarPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                // 移除HTML结构
                content = content.replace(pattern, (match) => {
                    // 如果在<body>标签内，则移除
                    const bodyIndex = content.indexOf('<body');
                    const matchIndex = content.indexOf(match);
                    if (bodyIndex !== -1 && matchIndex > bodyIndex) {
                        return unifiedNavbar;
                    }
                    return match;
                });
                modified = true;
                console.log(`✓ 移除旧导航栏HTML: ${path.basename(filePath)}`);
            }
        });
        
        // 移除旧的导航栏CSS样式
        const navbarStylePatterns = [
            /\/\*\s*导航栏样式\s*\*\/[\s\S]*?(?=\/\*|$)/gi,
            /header\s*{[^}]*}/gi,
            /\.navbar\s*{[^}]*}/gi,
            /\.logo\s*{[^}]*}/gi,
            /\.logo-icon\s*{[^}]*}/gi,
            /\.logo-text\s*{[^}]*}/gi,
            /\.nav-links\s*{[^}]*}/gi,
            /\.nav-links\s+a\s*{[^}]*}/gi,
            /\.nav-links\s+a:hover[^}]*}/gi,
            /\.nav-links\s+a\.active[^}]*}/gi,
            /\.nav-links\s+a::after[^}]*}/gi,
            /\.nav-links\s+a:hover::after[^}]*}/gi,
            /\.nav-links\s+a\.active::after[^}]*}/gi,
            /\.mobile-menu-btn\s*{[^}]*}/gi
        ];
        
        navbarStylePatterns.forEach(pattern => {
            if (pattern.test(content)) {
                content = content.replace(pattern, '/* 导航栏样式由组件提供 */');
                modified = true;
                console.log(`✓ 移除旧导航栏样式: ${path.basename(filePath)}`);
            }
        });
        
        // 移除响应式导航栏样式
        const responsiveNavPattern = /@media\s*\([^)]*\)\s*{[^{}]*\.nav-links[\s\S]*?}/gi;
        if (responsiveNavPattern.test(content)) {
            content = content.replace(responsiveNavPattern, (match) => {
                // 保留其他响应式样式，只移除导航栏相关的
                return match.replace(/\.nav-links[^}]*}/gi, '')
                           .replace(/\.mobile-menu-btn[^}]*}/gi, '');
            });
            modified = true;
            console.log(`✓ 清理响应式导航栏样式: ${path.basename(filePath)}`);
        }
        
        // 4. 移除现有的页脚HTML（如果存在）
        const footerPattern = /<footer[^>]*>[\s\S]*?<\/footer>/gi;
        if (footerPattern.test(content)) {
            content = content.replace(footerPattern, unifiedFooter);
            modified = true;
            console.log(`✓ 移除旧页脚: ${path.basename(filePath)}`);
        }
        
        // 5. 确保主容器有flex: 1属性
        const containerPatterns = [
            /(\.container\s*{[^}]*)/g,
            /(\.main-content\s*{[^}]*)/g,
            /(\.content\s*{[^}]*)/g
        ];
        
        containerPatterns.forEach(pattern => {
            content = content.replace(pattern, (match) => {
                if (!match.includes('flex: 1')) {
                    return match + containerFlexStyles;
                }
                return match;
            });
        });
        
        // 6. 保存文件
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 成功更新: ${path.basename(filePath)}`);
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

function updateAllTools() {
    console.log('🚀 开始批量更新工具页面...');
    
    try {
        const files = fs.readdirSync(toolsDir);
        const htmlFiles = files.filter(file => file.endsWith('.html'));
        
        let updatedCount = 0;
        let totalCount = htmlFiles.length;
        
        htmlFiles.forEach(file => {
            const filePath = path.join(toolsDir, file);
            if (updateToolFile(filePath)) {
                updatedCount++;
            }
        });
        
        console.log(`\n📊 更新完成统计:`);
        console.log(`   总文件数: ${totalCount}`);
        console.log(`   已更新: ${updatedCount}`);
        console.log(`   无需更新: ${totalCount - updatedCount}`);
        
    } catch (error) {
        console.error('❌ 批量更新失败:', error.message);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    updateAllTools();
}

module.exports = { updateAllTools, updateToolFile };