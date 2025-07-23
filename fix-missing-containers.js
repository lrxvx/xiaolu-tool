const fs = require('fs');
const path = require('path');

// 需要修复的工具页面列表
const toolsToFix = [
    'zodiac-calculator.html',
    'relative-calculator.html', 
    'pdf-converter.html',
    'id-location-query.html',
    'base64-encoder.html',
    'unit-converter.html',
    'template.html',
    'file-compressor.html',
    'json-processor.html',
    'fireworks-simulator.html',
    'anime-to-sketch.html',
    'grid-image-splitter.html',
    'festival-countdown.html',
    'idle-calculator.html',
    'example-tool.html',
    'poster-batch-processor.html',
    'daily-quote-card.html',
    'markdown-editor.html',
    'image-text-extractor.html',
    'xiaohongshu-diary-card.html',
    'excel-visualizer.html',
    'file-encryptor.html',
    'chinese-converter.html',
    'timezone-calculator.html',
    'pdf-watermark.html',
    'image-to-pdf.html',
    'emoji-symbols.html',
    'image-format-converter.html',
    'house-car-countdown.html',
    'watermark-remover.html',
    'content-converter.html',
    'wealth-freedom-calculator.html'
];

const toolsDir = path.join(__dirname, 'tools');

function fixToolPage(filename) {
    const filePath = path.join(toolsDir, filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`文件不存在: ${filename}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否已经有导航栏容器
    if (content.includes('<div id="navbar-container"></div>')) {
        console.log(`${filename} 已经包含导航栏容器，跳过`);
        return;
    }
    
    // 检查是否缺少body标签
    const hasBodyTag = content.includes('<body>');
    
    if (!hasBodyTag) {
        // 如果没有body标签，需要添加完整的body结构
        
        // 找到</head>标签的位置
        const headEndIndex = content.indexOf('</head>');
        if (headEndIndex === -1) {
            console.log(`${filename} 没有找到</head>标签`);
            return;
        }
        
        // 在</head>后添加body开始标签和导航栏容器
        const beforeBody = content.substring(0, headEndIndex + 7); // 包含</head>
        const afterHead = content.substring(headEndIndex + 7);
        
        // 构建新的body内容
        const bodyContent = `
<body>
    <!-- 导航栏容器 -->
    <div id="navbar-container"></div>
    
${afterHead}`;
        
        content = beforeBody + bodyContent;
        
        // 确保有</body>和</html>标签
        if (!content.includes('</body>')) {
            // 在最后的</html>前添加</body>
            content = content.replace('</html>', '</body>\n</html>');
        }
    } else {
        // 如果有body标签，只需要在body开始后添加导航栏容器
        const bodyStartMatch = content.match(/<body[^>]*>/);
        if (bodyStartMatch) {
            const bodyStartEnd = bodyStartMatch.index + bodyStartMatch[0].length;
            const beforeNavbar = content.substring(0, bodyStartEnd);
            const afterBodyStart = content.substring(bodyStartEnd);
            
            content = beforeNavbar + `
    <!-- 导航栏容器 -->
    <div id="navbar-container"></div>
    ` + afterBodyStart;
        }
    }
    
    // 写入修复后的内容
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已修复: ${filename}`);
}

// 批量修复所有工具页面
console.log('开始批量修复工具页面...');
toolsToFix.forEach(filename => {
    try {
        fixToolPage(filename);
    } catch (error) {
        console.error(`修复 ${filename} 时出错:`, error.message);
    }
});

console.log('\n批量修复完成！');
console.log(`总共处理了 ${toolsToFix.length} 个文件`);