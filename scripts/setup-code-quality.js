#!/usr/bin/env node

/**
 * 代码质量设置脚本
 * 一键配置 ESLint, Prettier, Husky 等开发工具
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 开始设置代码质量工具...');

// 1. 安装开发依赖
function installDevDependencies() {
  console.log('📦 安装开发依赖...');
  
  const devDeps = [
    'eslint@^8.57.0',
    'prettier@^3.2.5',
    'husky@^9.0.11',
    'lint-staged@^15.2.2',
    'jest@^29.7.0',
    '@types/jest@^29.5.12'
  ];
  
  try {
    execSync(`npm install --save-dev ${devDeps.join(' ')}`, {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log('✅ 开发依赖安装完成');
  } catch (error) {
    console.error('❌ 开发依赖安装失败:', error.message);
    process.exit(1);
  }
}

// 2. 创建 ESLint 配置
function createESLintConfig() {
  console.log('⚙️ 创建 ESLint 配置...');
  
  const eslintConfig = {
    env: {
      browser: true,
      es2021: true,
      node: true
    },
    extends: [
      'eslint:recommended'
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  };
  
  fs.writeFileSync(
    path.join(projectRoot, '.eslintrc.json'),
    JSON.stringify(eslintConfig, null, 2)
  );
  
  console.log('✅ ESLint 配置创建完成');
}

// 3. 创建 Prettier 配置
function createPrettierConfig() {
  console.log('💅 创建 Prettier 配置...');
  
  const prettierConfig = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false
  };
  
  fs.writeFileSync(
    path.join(projectRoot, '.prettierrc'),
    JSON.stringify(prettierConfig, null, 2)
  );
  
  // 创建 .prettierignore
  const prettierIgnore = `
node_modules/
dist/
build/
coverage/
*.min.js
*.min.css
package-lock.json
`;
  
  fs.writeFileSync(
    path.join(projectRoot, '.prettierignore'),
    prettierIgnore.trim()
  );
  
  console.log('✅ Prettier 配置创建完成');
}

// 4. 创建 lint-staged 配置
function createLintStagedConfig() {
  console.log('🔧 创建 lint-staged 配置...');
  
  const lintStagedConfig = {
    '*.{js,html}': [
      'eslint --fix',
      'prettier --write'
    ],
    '*.{json,md,css}': [
      'prettier --write'
    ]
  };
  
  fs.writeFileSync(
    path.join(projectRoot, '.lintstagedrc'),
    JSON.stringify(lintStagedConfig, null, 2)
  );
  
  console.log('✅ lint-staged 配置创建完成');
}

// 5. 创建 Jest 配置
function createJestConfig() {
  console.log('🧪 创建 Jest 配置...');
  
  const jestConfig = `
module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'js/**/*.js',
    'scripts/**/*.js',
    '!**/node_modules/**',
    '!**/setup-code-quality.js'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ]
};
`;
  
  fs.writeFileSync(
    path.join(projectRoot, 'jest.config.js'),
    jestConfig.trim()
  );
  
  console.log('✅ Jest 配置创建完成');
}

// 6. 更新 package.json scripts
function updatePackageScripts() {
  console.log('📝 更新 package.json scripts...');
  
  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // 添加新的 scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'lint': 'eslint . --ext .js,.html',
    'lint:fix': 'eslint . --ext .js,.html --fix',
    'format': 'prettier --write .',
    'format:check': 'prettier --check .',
    'test': 'jest',
    'test:watch': 'jest --watch',
    'test:coverage': 'jest --coverage',
    'prepare': 'husky install',
    'quality:check': 'npm run lint && npm run format:check && npm run test'
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  
  console.log('✅ package.json scripts 更新完成');
}

// 7. 设置 Husky
function setupHusky() {
  console.log('🐕 设置 Husky Git hooks...');
  
  try {
    // 初始化 husky
    execSync('npx husky install', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    // 创建 pre-commit hook
    execSync('npx husky add .husky/pre-commit "npx lint-staged"', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    console.log('✅ Husky 设置完成');
  } catch (error) {
    console.error('❌ Husky 设置失败:', error.message);
  }
}

// 8. 创建示例测试文件
function createExampleTest() {
  console.log('📋 创建示例测试文件...');
  
  const testDir = path.join(projectRoot, '__tests__');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  const exampleTest = `
/**
 * 示例测试文件
 * 运行: npm test
 */

describe('工具箱基础功能测试', () => {
  test('应该能够正常运行', () => {
    expect(true).toBe(true);
  });
  
  test('DOM 环境应该可用', () => {
    const div = document.createElement('div');
    expect(div.tagName).toBe('DIV');
  });
});

// 可以添加更多具体的工具测试
describe('工具函数测试', () => {
  // 这里可以测试具体的工具函数
  test.todo('添加具体的工具测试');
});
`;
  
  fs.writeFileSync(
    path.join(testDir, 'example.test.js'),
    exampleTest.trim()
  );
  
  console.log('✅ 示例测试文件创建完成');
}

// 9. 创建 GitHub Actions 工作流更新
function updateGitHubActions() {
  console.log('🔄 更新 GitHub Actions 工作流...');
  
  const workflowPath = path.join(projectRoot, '.github/workflows/deploy.yml');
  
  if (fs.existsSync(workflowPath)) {
    console.log('💡 建议在 GitHub Actions 中添加以下步骤:');
    console.log(`
    - name: Run code quality checks
      run: |
        npm run lint
        npm run format:check
        npm run test
`);
  }
}

// 主函数
function main() {
  try {
    installDevDependencies();
    createESLintConfig();
    createPrettierConfig();
    createLintStagedConfig();
    createJestConfig();
    updatePackageScripts();
    setupHusky();
    createExampleTest();
    updateGitHubActions();
    
    console.log('\n🎉 代码质量工具设置完成!');
    console.log('\n📋 下一步操作:');
    console.log('1. 运行 npm run lint 检查代码');
    console.log('2. 运行 npm run format 格式化代码');
    console.log('3. 运行 npm test 执行测试');
    console.log('4. 提交代码时会自动运行质量检查');
    console.log('\n💡 更多信息请查看 CODE-QUALITY-RECOMMENDATIONS.md');
    
  } catch (error) {
    console.error('❌ 设置过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  installDevDependencies,
  createESLintConfig,
  createPrettierConfig,
  createLintStagedConfig,
  createJestConfig,
  updatePackageScripts,
  setupHusky,
  createExampleTest
};