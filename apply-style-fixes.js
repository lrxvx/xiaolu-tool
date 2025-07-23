const fs = require('fs');
const path = require('path');

// 读取修复的CSS内容
const fixStylesPath = path.join(__dirname, 'fix-styles.css');
const fixStyles = fs.readFileSync(fixStylesPath, 'utf8');

// 读取tools目录下的所有HTML文件
const toolsDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolsDir).filter(file => file.endsWith('.html'));

let processedCount = 0;
let updatedCount = 0;

console.log('🚀 开始应用样式修复...');

files.forEach(file => {
    const filePath = path.join(toolsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    processedCount++;
    
    // 检查是否已经应用了修复样式
    if (content.includes('/* 通用样式修复 - 解决工具页面布局混乱问题 */')) {
        console.log('⏭️  ' + file + ' 已应用样式修复，跳过');
        return;
    }
    
    // 查找现有的 </style> 标签
    const styleEndIndex = content.indexOf('</style>');
    
    if (styleEndIndex !== -1) {
        // 在现有样式后添加修复样式
        const beforeStyle = content.substring(0, styleEndIndex);
        const afterStyle = content.substring(styleEndIndex);
        
        const newContent = beforeStyle + '\n\n        ' + fixStyles.replace(/\n/g, '\n        ') + '\n    ' + afterStyle;
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('✅ 已为 ' + file + ' 应用样式修复');
        updatedCount++;
    } else {
        // 如果没有找到 </style> 标签，在 </head> 前添加样式
        const headEndIndex = content.indexOf('</head>');
        
        if (headEndIndex !== -1) {
            const beforeHead = content.substring(0, headEndIndex);
            const afterHead = content.substring(headEndIndex);
            
            const styleBlock = '    <style>\n        ' + fixStyles.replace(/\n/g, '\n        ') + '\n    </style>\n';
            const newContent = beforeHead + styleBlock + afterHead;
            
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('✅ 已为 ' + file + ' 添加样式修复');
            updatedCount++;
        } else {
            console.log('❌ ' + file + ' 格式异常，无法应用样式修复');
        }
    }
});

console.log('\n🎉 样式修复应用完成！');
console.log('📊 总共处理了 ' + processedCount + ' 个文件');
console.log('✅ 更新了 ' + updatedCount + ' 个文件');
console.log('⏭️  跳过了 ' + (processedCount - updatedCount) + ' 个文件');

// 额外检查：修复可能的CSS冲突
console.log('\n🔧 检查并修复CSS冲突...');

files.forEach(file => {
    const filePath = path.join(toolsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // 修复可能的CSS选择器冲突
    const conflictPatterns = [
        // 修复容器宽度问题
        { pattern: /\.container\s*\{[^}]*width:\s*100vw[^}]*\}/g, replacement: '' },
        // 修复溢出问题
        { pattern: /overflow-x:\s*scroll/g, replacement: 'overflow-x: auto' },
        // 修复固定宽度问题
        { pattern: /width:\s*100vw/g, replacement: 'width: 100%' },
        // 修复最小宽度问题
        { pattern: /min-width:\s*100vw/g, replacement: 'min-width: 100%' }
    ];
    
    conflictPatterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            hasChanges = true;
        }
    });
    
    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('🔧 已修复 ' + file + ' 的CSS冲突');
    }
});

console.log('\n✨ 所有样式问题修复完成！');
console.log('🌐 建议重新加载页面查看效果');