const fs = require('fs');
const path = require('path');

// 工具页面的JavaScript功能模板
const toolScripts = {
    'regex-tester.html': `
    <script>
        // 正则表达式测试器功能
        document.addEventListener('DOMContentLoaded', function() {
            const regexInput = document.getElementById('regexInput');
            const testInput = document.getElementById('testInput');
            const flagsCheckboxes = document.querySelectorAll('input[name="flags"]');
            const testButton = document.getElementById('testButton');
            const resultsDiv = document.getElementById('results');

            if (testButton) {
                testButton.addEventListener('click', testRegex);
            }

            // 实时测试
            if (regexInput && testInput) {
                regexInput.addEventListener('input', testRegex);
                testInput.addEventListener('input', testRegex);
            }

            flagsCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', testRegex);
            });
        });

        function testRegex() {
            const regexInput = document.getElementById('regexInput');
            const testInput = document.getElementById('testInput');
            const resultsDiv = document.getElementById('results');
            
            if (!regexInput || !testInput || !resultsDiv) return;

            const pattern = regexInput.value;
            const testText = testInput.value;
            const flags = getSelectedFlags();

            if (!pattern) {
                resultsDiv.innerHTML = '<p>请输入正则表达式</p>';
                return;
            }

            try {
                const regex = new RegExp(pattern, flags);
                const matches = testText.match(regex);
                const globalMatches = testText.matchAll(new RegExp(pattern, flags + 'g'));
                
                let result = '<h3>测试结果</h3>';
                
                if (matches) {
                    result += '<p class="success">✅ 匹配成功</p>';
                    result += '<h4>匹配结果：</h4>';
                    result += '<ul>';
                    for (const match of globalMatches) {
                        result += '<li>' + match[0] + '</li>';
                    }
                    result += '</ul>';
                } else {
                    result += '<p class="error">❌ 无匹配结果</p>';
                }
                
                resultsDiv.innerHTML = result;
            } catch (error) {
                resultsDiv.innerHTML = '<p class="error">❌ 正则表达式错误: ' + error.message + '</p>';
            }
        }

        function getSelectedFlags() {
            const flagsCheckboxes = document.querySelectorAll('input[name="flags"]:checked');
            return Array.from(flagsCheckboxes).map(cb => cb.value).join('');
        }
    </script>`,

    'base64-encoder.html': `
    <script>
        // Base64编码解码器功能
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Base64编码解码器已加载');
        });

        function encodeBase64() {
            const input = document.getElementById('textInput').value;
            if (!input) {
                alert('请输入要编码的文本');
                return;
            }
            
            try {
                const encoded = btoa(unescape(encodeURIComponent(input)));
                document.getElementById('base64Output').value = encoded;
                document.getElementById('encodeResult').style.display = 'block';
            } catch (error) {
                alert('编码失败: ' + error.message);
            }
        }

        function decodeBase64() {
            const input = document.getElementById('base64Input').value;
            if (!input) {
                alert('请输入要解码的Base64字符串');
                return;
            }
            
            try {
                const decoded = decodeURIComponent(escape(atob(input)));
                document.getElementById('textOutput').value = decoded;
                document.getElementById('decodeResult').style.display = 'block';
            } catch (error) {
                alert('解码失败: ' + error.message);
            }
        }

        function copyResult(elementId) {
            const element = document.getElementById(elementId);
            element.select();
            document.execCommand('copy');
            alert('已复制到剪贴板');
        }

        function clearInput(elementId) {
            document.getElementById(elementId).value = '';
        }
    </script>`,

    'color-converter.html': `
    <script>
        // 颜色转换器功能
        document.addEventListener('DOMContentLoaded', function() {
            const colorPicker = document.getElementById('colorPicker');
            if (colorPicker) {
                colorPicker.addEventListener('input', updateColorValues);
                updateColorValues(); // 初始化
            }
        });

        function updateColorValues() {
            const colorPicker = document.getElementById('colorPicker');
            const hex = colorPicker.value;
            
            // 转换为RGB
            const rgb = hexToRgb(hex);
            if (rgb) {
                document.getElementById('hexValue').textContent = hex.toUpperCase();
                document.getElementById('rgbValue').textContent = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
                
                // 转换为HSL
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                document.getElementById('hslValue').textContent = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
                
                // 更新预览
                document.getElementById('colorPreview').style.backgroundColor = hex;
            }
        }

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        function rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            
            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                l: Math.round(l * 100)
            };
        }

        function copyColor(format) {
            let value;
            switch (format) {
                case 'hex':
                    value = document.getElementById('hexValue').textContent;
                    break;
                case 'rgb':
                    value = document.getElementById('rgbValue').textContent;
                    break;
                case 'hsl':
                    value = document.getElementById('hslValue').textContent;
                    break;
            }
            
            navigator.clipboard.writeText(value).then(() => {
                alert('已复制到剪贴板: ' + value);
            });
        }
    </script>`
};

// 读取tools目录下的所有HTML文件
const toolsDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolsDir).filter(file => file.endsWith('.html'));

let processedCount = 0;
let updatedCount = 0;

files.forEach(file => {
    const filePath = path.join(toolsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    processedCount++;
    
    // 检查是否已经有JavaScript代码（除了component-manager.js）
    const hasScript = content.includes('<script>') && !content.includes('component-manager.js');
    
    if (!hasScript) {
        // 如果有对应的脚本模板，添加它
        if (toolScripts[file]) {
            const scriptToAdd = toolScripts[file];
            const insertPosition = content.lastIndexOf('<script src="../components/component-manager.js"></script>');
            
            if (insertPosition !== -1) {
                content = content.slice(0, insertPosition) + scriptToAdd + '\n    ' + content.slice(insertPosition);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('✅ 已为 ' + file + ' 添加JavaScript功能');
                updatedCount++;
            }
        } else {
            // 添加基础的JavaScript模板
            const basicScript = '\n    <script>\n        // ' + file.replace('.html', '') + '功能\n        document.addEventListener(\'DOMContentLoaded\', function() {\n            console.log(\'' + file.replace('.html', '') + '已加载\');\n            // 在这里添加具体的功能代码\n        });\n    </script>';
            
            const insertPosition = content.lastIndexOf('<script src="../components/component-manager.js"></script>');
            
            if (insertPosition !== -1) {
                content = content.slice(0, insertPosition) + basicScript + '\n    ' + content.slice(insertPosition);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('📝 已为 ' + file + ' 添加基础JavaScript模板');
                updatedCount++;
            }
        }
    } else {
        console.log('⏭️  ' + file + ' 已有JavaScript代码，跳过');
    }
});

console.log('\n🎉 处理完成！');
console.log('📊 总共处理了 ' + processedCount + ' 个文件');
console.log('✅ 更新了 ' + updatedCount + ' 个文件');
console.log('⏭️  跳过了 ' + (processedCount - updatedCount) + ' 个文件');