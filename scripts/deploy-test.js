#!/usr/bin/env node

/**
 * 部署测试脚本
 * 验证项目是否准备好部署到 Cloudflare Pages 和 Netlify
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  console.log(`${icons[type]} ${message}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`${description}: 存在`, 'success');
    return true;
  } else {
    log(`${description}: 缺失`, 'error');
    return false;
  }
}

function runCommand(command, description) {
  try {
    log(`执行: ${description}`, 'info');
    execSync(command, { stdio: 'inherit' });
    log(`${description}: 成功`, 'success');
    return true;
  } catch (error) {
    log(`${description}: 失败`, 'error');
    return false;
  }
}

function main() {
  console.log('🔍 小路工具箱 - 部署配置检查\n');
  
  let allChecksPass = true;
  
  // 1. 检查关键文件
  log('检查关键配置文件...', 'info');
  const configFiles = [
    ['package.json', 'Package 配置'],
    ['wrangler.toml', 'Cloudflare Pages 配置'],
    ['netlify.toml', 'Netlify 配置'],
    ['.npmrc', 'NPM 配置'],
    ['index.html', '主页文件'],
    ['.github/workflows/deploy.yml', 'GitHub Actions 工作流']
  ];
  
  for (const [file, desc] of configFiles) {
    if (!checkFile(file, desc)) {
      allChecksPass = false;
    }
  }
  
  // 2. 检查项目结构
  log('\n检查项目结构...', 'info');
  const directories = [
    ['tools', '工具目录'],
    ['css', '样式目录'],
    ['js', 'JavaScript 目录'],
    ['images', '图片目录']
  ];
  
  for (const [dir, desc] of directories) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const files = fs.readdirSync(dir);
      log(`${desc}: ${files.length} 个文件`, 'success');
    } else {
      log(`${desc}: 不存在或不是目录`, 'warning');
    }
  }
  
  // 3. 验证 package.json 配置
  log('\n验证 package.json 配置...', 'info');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // 检查必要的脚本
    const requiredScripts = ['build', 'deploy:cloudflare', 'deploy:netlify'];
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(`脚本 ${script}: 已配置`, 'success');
      } else {
        log(`脚本 ${script}: 缺失`, 'error');
        allChecksPass = false;
      }
    }
    
    // 检查引擎要求
    if (packageJson.engines && packageJson.engines.node) {
      log(`Node.js 版本要求: ${packageJson.engines.node}`, 'success');
    } else {
      log('Node.js 版本要求: 未设置', 'warning');
    }
    
  } catch (error) {
    log(`读取 package.json 失败: ${error.message}`, 'error');
    allChecksPass = false;
  }
  
  // 4. 测试构建过程
  log('\n测试构建过程...', 'info');
  if (!runCommand('npm run build', '项目构建')) {
    allChecksPass = false;
  }
  
  // 5. 检查构建输出
  log('\n检查构建输出...', 'info');
  if (fs.existsSync('index.html')) {
    const indexContent = fs.readFileSync('index.html', 'utf8');
    if (indexContent.includes('xiaolu-tool') || indexContent.includes('小路工具箱')) {
      log('index.html: 内容正确', 'success');
    } else {
      log('index.html: 内容可能有问题', 'warning');
    }
  }
  
  // 6. 验证配置文件内容
  log('\n验证配置文件内容...', 'info');
  
  // 检查 wrangler.toml
  if (fs.existsSync('wrangler.toml')) {
    const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
    if (wranglerConfig.includes('xiaolu-tool')) {
      log('wrangler.toml: 项目名称正确', 'success');
    } else {
      log('wrangler.toml: 项目名称需要检查', 'warning');
    }
  }
  
  // 检查 netlify.toml
  if (fs.existsSync('netlify.toml')) {
    const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
    if (netlifyConfig.includes('npm run build')) {
      log('netlify.toml: 构建命令正确', 'success');
    } else {
      log('netlify.toml: 构建命令需要检查', 'warning');
    }
  }
  
  // 7. 生成部署报告
  console.log('\n📋 部署配置总结:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 Cloudflare Pages 配置:');
  console.log('   框架预设: 无');
  console.log('   构建命令: npm run build');
  console.log('   输出目录: .');
  console.log('   Node.js 版本: 18.19.0');
  console.log('');
  console.log('🎯 Netlify 配置:');
  console.log('   构建命令: npm run build');
  console.log('   发布目录: .');
  console.log('   Node.js 版本: 18.19.0');
  console.log('');
  console.log('📁 项目类型: 静态网站');
  console.log('🔧 构建工具: 自定义脚本');
  
  if (allChecksPass) {
    console.log('\n✅ 所有检查通过！项目已准备好部署。');
    console.log('\n🚀 下一步:');
    console.log('1. 将代码推送到 Git 仓库');
    console.log('2. 在 Cloudflare Pages 或 Netlify 中连接仓库');
    console.log('3. 使用上述配置进行部署');
    console.log('4. 或者使用 GitHub Actions 自动部署');
  } else {
    console.log('\n⚠️ 发现一些问题，请检查上述错误信息。');
    console.log('\n📖 参考文档: DEPLOYMENT.md');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };