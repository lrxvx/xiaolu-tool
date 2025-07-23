const fs = require('fs');
const path = require('path');

// 获取tools目录下的所有HTML文件
const toolsDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolsDir).filter(file => file.endsWith('.html'));

console.log(`🔍 找到 ${files.length} 个HTML文件`);

let updatedCount = 0;

files.forEach(file => {
    const filePath = path.join(toolsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n📄 处理文件: ${file}`);
    
    // 检查是否已经有容器
    const hasNavbarContainer = content.includes('id="navbar-container"');
    const hasCategoriesContainer = content.includes('id="tool-categories-container"');
    
    if (hasNavbarContainer && hasCategoriesContainer) {
        console.log('⏭️  容器已存在，跳过');
        return;
    }
    
    let modified = false;
    
    // 在<body>标签后添加容器
    if (content.includes('<body>')) {
        // 查找<body>标签的位置
        const bodyMatch = content.match(/<body[^>]*>/i);
        if (bodyMatch) {
            const bodyTag = bodyMatch[0];
            const bodyIndex = content.indexOf(bodyTag) + bodyTag.length;
            
            // 检查是否已经有导航栏容器
            if (!hasNavbarContainer) {
                const navbarContainer = '\n    <!-- 导航栏 -->\n    <div id="navbar-container"></div>';
                content = content.slice(0, bodyIndex) + navbarContainer + content.slice(bodyIndex);
                console.log('  - 添加导航栏容器');
                modified = true;
            }
            
            // 检查是否已经有工具分类容器
            if (!hasCategoriesContainer) {
                const categoriesContainer = '\n    \n    <!-- 工具分类侧边栏 -->\n    <div id="tool-categories-container"></div>';
                // 重新查找body标签位置（因为可能已经插入了导航栏容器）
                const newBodyMatch = content.match(/<body[^>]*>/i);
                if (newBodyMatch) {
                    const newBodyTag = newBodyMatch[0];
                    const newBodyIndex = content.indexOf(newBodyTag) + newBodyTag.length;
                    
                    // 如果已经有导航栏容器，在其后添加
                    if (hasNavbarContainer || modified) {
                        const navbarContainerEnd = content.indexOf('</div>', newBodyIndex) + 6;
                        content = content.slice(0, navbarContainerEnd) + categoriesContainer + content.slice(navbarContainerEnd);
                    } else {
                        content = content.slice(0, newBodyIndex) + categoriesContainer + content.slice(newBodyIndex);
                    }
                    console.log('  - 添加工具分类容器');
                    modified = true;
                }
            }
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ 更新完成');
        updatedCount++;
    } else {
        console.log('⏭️  无需更新');
    }
});

console.log(`\n🎉 批量更新完成!`);
console.log(`📊 总计: ${files.length} 个文件，更新: ${updatedCount} 个文件`);