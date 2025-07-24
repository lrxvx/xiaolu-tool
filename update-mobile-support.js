// 批量为工具页面添加移动端支持的脚本

const fs = require('fs');
const path = require('path');

// 工具目录
const toolsDir = path.join(__dirname, 'tools');

// 需要添加的CSS引用
const responsiveCssLink = '<link rel="stylesheet" href="../css/responsive.css">';

// 需要添加的JavaScript引用
const mobileJsScript = '<script src="../js/mobile-navigation.js"></script>';

// 获取所有HTML文件
function getAllHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    return files.filter(file => file.endsWith('.html'));
}

// 更新单个文件
function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // 检查是否已经包含响应式CSS
        if (!content.includes('../css/responsive.css')) {
            // 在第一个<style>标签前添加CSS引用
            const styleIndex = content.indexOf('<style>');
            if (styleIndex !== -1) {
                content = content.slice(0, styleIndex) + 
                         responsiveCssLink + '\n    ' + 
                         content.slice(styleIndex);
                updated = true;
                console.log(`✅ 已为 ${path.basename(filePath)} 添加响应式CSS`);
            } else {
                // 如果没有<style>标签，在</head>前添加
                const headEndIndex = content.indexOf('</head>');
                if (headEndIndex !== -1) {
                    content = content.slice(0, headEndIndex) + 
                             '    ' + responsiveCssLink + '\n' + 
                             content.slice(headEndIndex);
                    updated = true;
                    console.log(`✅ 已为 ${path.basename(filePath)} 添加响应式CSS (在</head>前)`);
                }
            }
        }

        // 检查是否已经包含移动端JavaScript
        if (!content.includes('../js/mobile-navigation.js')) {
            // 在</body>前添加JavaScript引用
            const bodyEndIndex = content.lastIndexOf('</body>');
            if (bodyEndIndex !== -1) {
                content = content.slice(0, bodyEndIndex) + 
                         '    ' + mobileJsScript + '\n' + 
                         content.slice(bodyEndIndex);
                updated = true;
                console.log(`✅ 已为 ${path.basename(filePath)} 添加移动端JavaScript`);
            }
        }

        // 如果有更新，写回文件
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`🎉 ${path.basename(filePath)} 更新完成`);
        } else {
            console.log(`ℹ️  ${path.basename(filePath)} 已经包含移动端支持，跳过`);
        }

    } catch (error) {
        console.error(`❌ 更新 ${path.basename(filePath)} 时出错:`, error.message);
    }
}

// 更新viewport meta标签
function updateViewportMeta(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查是否已有viewport meta标签
        const viewportRegex = /<meta\s+name=["']viewport["'][^>]*>/i;
        const hasViewport = viewportRegex.test(content);
        
        if (!hasViewport) {
            // 在charset meta标签后添加viewport
            const charsetIndex = content.indexOf('<meta charset="UTF-8">');
            if (charsetIndex !== -1) {
                const insertIndex = content.indexOf('>', charsetIndex) + 1;
                const viewportMeta = '\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">';
                content = content.slice(0, insertIndex) + viewportMeta + content.slice(insertIndex);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ 已为 ${path.basename(filePath)} 添加viewport meta标签`);
            }
        }
    } catch (error) {
        console.error(`❌ 更新viewport meta标签时出错:`, error.message);
    }
}

// 主函数
function main() {
    console.log('🚀 开始为工具页面添加移动端支持...');
    console.log('=' .repeat(50));

    // 检查目录是否存在
    if (!fs.existsSync(toolsDir)) {
        console.error('❌ tools目录不存在');
        return;
    }

    // 检查CSS文件是否存在
    const cssPath = path.join(__dirname, 'css', 'responsive.css');
    if (!fs.existsSync(cssPath)) {
        console.error('❌ responsive.css文件不存在');
        return;
    }

    // 检查JavaScript文件是否存在
    const jsPath = path.join(__dirname, 'js', 'mobile-navigation.js');
    if (!fs.existsSync(jsPath)) {
        console.error('❌ mobile-navigation.js文件不存在');
        return;
    }

    // 获取所有HTML文件
    const htmlFiles = getAllHtmlFiles(toolsDir);
    console.log(`📁 找到 ${htmlFiles.length} 个HTML文件`);
    console.log('');

    // 更新每个文件
    htmlFiles.forEach(file => {
        const filePath = path.join(toolsDir, file);
        console.log(`🔧 正在处理: ${file}`);
        
        // 更新viewport meta标签
        updateViewportMeta(filePath);
        
        // 更新CSS和JavaScript引用
        updateFile(filePath);
        
        console.log('');
    });

    console.log('=' .repeat(50));
    console.log('🎉 所有工具页面移动端支持更新完成！');
    console.log('');
    console.log('📱 移动端优化包括:');
    console.log('   • 响应式CSS样式');
    console.log('   • 移动端导航菜单');
    console.log('   • 触摸友好的交互');
    console.log('   • 性能优化');
    console.log('   • 图片懒加载');
    console.log('');
    console.log('🔍 建议测试以下设备尺寸:');
    console.log('   • 手机: 375px, 414px, 390px');
    console.log('   • 平板: 768px, 1024px');
    console.log('   • 桌面: 1200px, 1440px, 1920px');
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    updateFile,
    updateViewportMeta,
    getAllHtmlFiles
};