// 组件管理器 - 统一管理导航栏、页脚和工具分类组件
class ComponentManager {
    constructor() {
        this.components = {
            navbar: null,
            footer: null,
            toolCategories: null
        };
        this.loadedScripts = new Set();
    }

    // 加载脚本文件
    async loadScript(src) {
        if (this.loadedScripts.has(src)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                this.loadedScripts.add(src);
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    // 获取正确的脚本路径
    getScriptPath(filename) {
        const currentPath = window.location.pathname;
        const isInToolsFolder = currentPath.includes('/tools/');
        const basePath = isInToolsFolder ? '../components/' : './components/';
        return basePath + filename;
    }



    // 初始化导航栏
    async initNavbar() {
        try {
            await this.loadScript(this.getScriptPath('navbar.js'));
            this.components.navbar = new NavbarComponent();
            this.components.navbar.render('navbar-container');
        } catch (error) {
            console.error('Failed to initialize navbar:', error);
        }
    }

    // 初始化页脚
    async initFooter() {
        try {
            await this.loadScript(this.getScriptPath('footer.js'));
            this.components.footer = new FooterComponent();
            this.components.footer.render('footer-container');
        } catch (error) {
            console.error('Failed to initialize footer:', error);
        }
    }

    // 初始化工具分类
    async initToolCategories() {
        // 检查是否存在工具分类容器
        const container = document.getElementById('tool-categories-container');
        if (!container) {
            console.log('Tool categories container not found, skipping initialization');
            return;
        }
        
        try {
            await this.loadScript(this.getScriptPath('tool-categories.js'));
            this.components.toolCategories = new ToolCategoriesComponent();
            this.components.toolCategories.render('tool-categories-container');
        } catch (error) {
            console.error('Failed to initialize tool categories:', error);
        }
    }

    // 初始化首页组件
    async initHomePage() {
        const promises = [
            this.initNavbar(),
            this.initFooter()
        ];
        
        // 只有当工具分类容器存在时才初始化
        if (document.getElementById('tool-categories-container')) {
            promises.push(this.initToolCategories());
        }
        
        await Promise.all(promises);
    }

    // 初始化工具页面组件
    async initToolPage() {
        await Promise.all([
            this.initNavbar(),
            this.initFooter()
        ]);
    }

    // 获取组件实例
    getComponent(name) {
        return this.components[name];
    }

    // 销毁组件
    destroyComponent(name) {
        if (this.components[name]) {
            if (typeof this.components[name].destroy === 'function') {
                this.components[name].destroy();
            }
            this.components[name] = null;
        }
    }

    // 销毁所有组件
    destroyAll() {
        Object.keys(this.components).forEach(name => {
            this.destroyComponent(name);
        });
    }

    // 初始化方法 - 根据页面类型自动选择初始化策略
    async init() {
        const currentPath = window.location.pathname;
        const isToolPage = currentPath.includes('/tools/') && currentPath.endsWith('.html');
        
        console.log('Current path:', currentPath, 'Is tool page:', isToolPage);
        
        if (isToolPage) {
            await this.initToolPage();
        } else {
            await this.initHomePage();
        }
    }
}

// 全局组件管理器实例
window.componentManager = new ComponentManager();

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.componentManager.init();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentManager;
}