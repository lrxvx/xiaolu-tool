const fs = require('fs');
const path = require('path');

// 工具页面目录
const toolsDir = path.join(__dirname, '../tools');

// 需要添加的脚本引用
const scriptToAdd = '    <script src="../components/tool-categories.js"></script>';

// 需要添加的CSS样式
const cssToAdd = `
        .main-layout {
            display: flex;
            gap: 30px;
            align-items: flex-start;
        }

        .content-area {
            flex: 1;
            min-width: 0;
        }`;

// 获取所有HTML文件
function getAllHtmlFiles() {
    const files = fs.readdirSync(toolsDir);
    return files.filter(file => file.endsWith('.html') && file !== 'template.html');
}

// 更新单个文件
function updateFile(filename) {
    const filePath = path.join(toolsDir, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否已经添加了工具分类组件
    if (content.includes('tool-categories.js')) {
        console.log(`${filename} 已经包含工具分类组件，跳过`);
        return;
    }
    
    // 1. 添加脚本引用
    const footerScriptPattern = /<script src="..\/components\/footer\.js"><\/script>/;
    if (footerScriptPattern.test(content)) {
        content = content.replace(footerScriptPattern, 
            '<script src="../components/footer.js"></script>\n' + scriptToAdd);
    }
    
    // 2. 添加CSS样式
    const containerStylePattern = /(\.container\s*\{[^}]*\})/;
    if (containerStylePattern.test(content)) {
        content = content.replace(containerStylePattern, '$1' + cssToAdd);
    }
    
    // 3. 修改body结构
    const bodyStartPattern = /<body>\s*<div class="container">/;
    if (bodyStartPattern.test(content)) {
        content = content.replace(bodyStartPattern, 
            '<body>\n    <div class="container">\n        <div class="main-layout">\n            <!-- 左侧工具分类导航 -->\n            <div id="tool-categories-container"></div>\n            \n            <!-- 主要内容区域 -->\n            <div class="content-area">');
    }
    
    // 4. 在</body>前添加关闭标签
    const bodyEndPattern = /<\/body>/;
    if (bodyEndPattern.test(content)) {
        content = content.replace(bodyEndPattern, 
            '            </div>\n        </div>\n    </div>\n</body>');
    }
    
    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`${filename} 更新完成`);
}

// 主函数
function main() {
    console.log('开始批量更新工具页面...');
    
    const htmlFiles = getAllHtmlFiles();
    console.log(`找到 ${htmlFiles.length} 个工具页面`);
    
    htmlFiles.forEach(file => {
        try {
            updateFile(file);
        } catch (error) {
            console.error(`更新 ${file} 时出错:`, error.message);
        }
    });
    
    console.log('批量更新完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { main, updateFile };