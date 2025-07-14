// 自动注入导航栏和页脚组件的构建脚本
const fs = require('fs');
const path = require('path');

// 工具页面目录
const TOOLS_DIR = path.join(__dirname, '..', 'tools');

// 组件引入代码
const COMPONENTS_IMPORT = `
    <!-- 导航栏和页脚组件 -->
    <script src="../components/navbar.js"></script>
    <script src="../components/footer.js"></script>
`;

// 组件初始化代码
const COMPONENTS_INIT = `
            // 初始化导航栏和页脚组件
            const navbar = new NavbarComponent();
            const navbarStyles = document.createElement('style');
            navbarStyles.textContent = NavbarComponent.getStyles();
            document.head.appendChild(navbarStyles);

            const footer = new FooterComponent();
            const footerStyles = document.createElement('style');
            footerStyles.textContent = FooterComponent.getStyles();
            document.head.appendChild(footerStyles);
`;

// 处理单个HTML文件
function processHtmlFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查是否已经包含新版本的组件初始化代码
        if (content.includes('navbarStyles.textContent = NavbarComponent.getStyles()') && 
            content.includes('footerStyles.textContent = FooterComponent.getStyles()')) {
            console.log(`跳过 ${path.basename(filePath)} - 已包含新版本组件`);
            return;
        }
        
        // 在head标签后插入组件引入代码
        content = content.replace(/<head>([\s\S]*?)>/i, `<head>$1>${COMPONENTS_IMPORT}`);
        
        // 在DOMContentLoaded事件中添加组件初始化代码
        if (content.includes('DOMContentLoaded')) {
            content = content.replace(/document\.addEventListener\('DOMContentLoaded',\s*function\(\)\s*{/i, 
                `document.addEventListener('DOMContentLoaded', function() {${COMPONENTS_INIT}`);
        } else {
            // 如果没有DOMContentLoaded事件，在</body>前添加初始化代码
            const initScript = `
    <script>
        document.addEventListener('DOMContentLoaded', function() {${COMPONENTS_INIT}});
    </script>
`;
            content = content.replace('</body>', `${initScript}</body>`);
        }
        
        // 写入文件
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`成功处理 ${path.basename(filePath)}`);
        
    } catch (error) {
        console.error(`处理 ${path.basename(filePath)} 时出错:`, error);
    }
}

// 处理tools目录下的所有HTML文件
function processAllTools() {
    try {
        const files = fs.readdirSync(TOOLS_DIR);
        
        files.forEach(file => {
            if (path.extname(file) === '.html') {
                const filePath = path.join(TOOLS_DIR, file);
                processHtmlFile(filePath);
            }
        });
        
        console.log('所有工具页面处理完成！');
        
    } catch (error) {
        console.error('处理工具页面时出错:', error);
    }
}

// 执行脚本
processAllTools();