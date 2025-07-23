// 工具分类组件
class ToolCategoriesComponent {
    constructor() {
        this.categories = [
            { id: 'all', name: '全部工具', icon: '🔧' },
            { id: 'utility', name: '实用工具', icon: '🛠️' },
            { id: 'coding', name: '编程开发', icon: '💻' },
            { id: 'document', name: '文档处理', icon: '📄' },
            { id: 'image', name: '设计工具', icon: '🎨' },
            { id: 'finance', name: '金融理财', icon: '💰' },
            { id: 'health', name: '健康生活', icon: '🏥' },
            { id: 'lifestyle', name: '生活服务', icon: '🏠' },
            { id: 'entertainment', name: '娱乐休闲', icon: '🎮' },
            { id: 'security', name: '安全工具', icon: '🔒' },
            { id: 'social', name: '社交媒体', icon: '📱' }
        ];
        this.tools = [];
        this.currentCategory = 'all';
        this.onCategoryChange = null;
    }

    async loadTools() {
        try {
            // 如果全局已有工具数据，直接使用
            if (window.toolsData) {
                this.tools = window.toolsData;
                this.updateToolCounts();
                return;
            }
            
            // 否则从JSON文件加载
            const currentPath = window.location.pathname;
            const isInToolsFolder = currentPath.includes('/tools/');
            const toolsJsonPath = isInToolsFolder ? '../tools.json' : './tools.json';
            
            const response = await fetch(toolsJsonPath);
            this.tools = await response.json();
            // 加载完成后更新分类计数
            this.updateToolCounts();
        } catch (error) {
            console.error('加载工具数据失败:', error);
        }
    }
    
    // 更新工具计数
    updateToolCounts() {
        const categoryCounts = {};
        
        // 初始化所有分类计数为0
        this.categories.forEach(category => {
            categoryCounts[category.id] = 0;
        });
        
        // 统计每个分类的工具数量
        if (this.tools && this.tools.length > 0) {
            this.tools.forEach(tool => {
                if (tool.categories && Array.isArray(tool.categories)) {
                    // 支持多分类的工具
                    tool.categories.forEach(category => {
                        if (categoryCounts.hasOwnProperty(category)) {
                            categoryCounts[category]++;
                        }
                    });
                } else if (tool.category && categoryCounts.hasOwnProperty(tool.category)) {
                    // 单分类的工具
                    categoryCounts[tool.category]++;
                }
            });
        }
        
        // 更新全部工具计数
        categoryCounts.all = this.tools ? this.tools.length : 0;
        
        // 更新分类计数显示
        this.updateCategoryCounts(categoryCounts);
    }

    getToolsByCategory(categoryId) {
        if (categoryId === 'all') {
            return this.tools;
        }
        return this.tools.filter(tool => {
            if (tool.categories && Array.isArray(tool.categories)) {
                return tool.categories.includes(categoryId);
            }
            return tool.category === categoryId;
        });
    }

    getCategoryCount(categoryId) {
        return this.getToolsByCategory(categoryId).length;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }

        const sidebarHtml = `
            <div class="tool-categories-sidebar">
                <div class="categories-header">
                    <h3>🔧 工具分类</h3>
                </div>
                <div class="categories-list">
                    ${this.categories.map(category => {
                        const count = this.getCategoryCount(category.id);
                        const isActive = this.currentCategory === category.id;
                        const isEmpty = count === 0 && category.id !== 'all';
                        return `
                            <div class="category-item ${isActive ? 'active' : ''} ${isEmpty ? 'empty' : ''}" 
                                 data-category="${category.id}">
                                <span class="category-icon">${category.icon}</span>
                                <span class="category-name">${category.name}</span>
                                <span class="category-count">${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="categories-footer">
                    <a href="../index.html" class="back-home-btn">
                        <span class="back-icon">🏠</span>
                        <span>返回首页</span>
                    </a>
                </div>
            </div>
        `;
        
        container.innerHTML = sidebarHtml;
        
        // 添加样式
        this.addStyles();
        
        // 加载工具数据并更新计数
        this.loadTools();
        
        // 延迟绑定事件，确保DOM元素已创建
        setTimeout(() => {
            this.bindEvents();
        }, 100);
        
        // 检查是否有待处理的分类计数数据
        if (window.pendingCategoryCounts) {
            this.updateCategoryCounts(window.pendingCategoryCounts);
            window.pendingCategoryCounts = null;
        }
    }

    // 添加样式方法
    addStyles() {
        const styleId = 'tool-categories-styles';
        if (document.getElementById(styleId)) {
            return;
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = this.getStyles().replace('<style>', '').replace('</style>', '');
        document.head.appendChild(style);
    }

    // 绑定事件
    bindEvents() {
        // 绑定分类点击事件
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const categoryId = item.getAttribute('data-category');
                if (categoryId) {
                    this.selectCategory(categoryId);
                }
            });
        });
    }

    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        this.updateActiveCategory();
        
        // 触发分类变更事件
        if (this.onCategoryChange) {
            this.onCategoryChange(categoryId, this.getToolsByCategory(categoryId));
        }
        
        // 如果在首页，触发工具筛选
        if (window.pageManager && typeof window.pageManager.filterToolsByCategory === 'function') {
            window.pageManager.filterToolsByCategory(categoryId);
        } else {
            console.log('PageManager not available, waiting for initialization...');
            // 如果PageManager还没初始化，等待一下再试
            let retryCount = 0;
            const maxRetries = 10;
            const retryInterval = setInterval(() => {
                retryCount++;
                if (window.pageManager && typeof window.pageManager.filterToolsByCategory === 'function') {
                    window.pageManager.filterToolsByCategory(categoryId);
                    clearInterval(retryInterval);
                    console.log('PageManager found, filtering tools by category:', categoryId);
                } else if (retryCount >= maxRetries) {
                    clearInterval(retryInterval);
                    console.error('PageManager not found after maximum retries');
                }
            }, 100);
        }
        
        // 发送自定义事件
        const event = new CustomEvent('categoryChanged', {
            detail: { categoryId, tools: this.getToolsByCategory(categoryId) }
        });
        document.dispatchEvent(event);
    }

    updateActiveCategory() {
        // 更新活跃状态
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = document.querySelector(`[data-category="${this.currentCategory}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            console.log('Updated active category to:', this.currentCategory);
        } else {
            console.warn('Could not find category item for:', this.currentCategory);
        }
    }

    // 更新分类计数
    updateCategoryCounts(counts) {
        // 更新全部工具计数
        const allCategoryElement = document.querySelector('[data-category="all"] .category-count');
        if (allCategoryElement && counts.all !== undefined) {
            allCategoryElement.textContent = counts.all;
        }
        
        // 更新各分类计数
        Object.keys(counts).forEach(category => {
            if (category !== 'all') {
                const categoryElement = document.querySelector(`[data-category="${category}"] .category-count`);
                if (categoryElement) {
                    categoryElement.textContent = counts[category];
                }
                
                // 更新分类项的透明度
                const categoryItem = document.querySelector(`[data-category="${category}"]`);
                if (categoryItem) {
                    if (counts[category] === 0) {
                        categoryItem.style.opacity = '0.5';
                    } else {
                        categoryItem.style.opacity = '1';
                    }
                }
            }
        });
    }

    getStyles() {
        return `
            <style>
                .tool-categories-sidebar {
                    width: 250px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    height: fit-content;
                    position: sticky;
                    top: 20px;
                }

                .categories-header {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e2e8f0;
                }

                .categories-header h3 {
                    color: #4f46e5;
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin: 0;
                }

                .categories-list {
                    margin-bottom: 20px;
                }

                .category-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 15px;
                    margin-bottom: 8px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }

                .category-item:hover {
                    background: #f8fafc;
                    border-color: #e2e8f0;
                }

                .category-item.active {
                    background: #4f46e5;
                    color: white;
                    border-color: #4f46e5;
                }

                .category-item.empty {
                    opacity: 0.5;
                }

                .category-icon {
                    font-size: 1.2rem;
                    margin-right: 10px;
                    width: 20px;
                    text-align: center;
                }

                .category-name {
                    flex: 1;
                    font-weight: 500;
                }

                .category-count {
                    background: rgba(0, 0, 0, 0.1);
                    color: #64748b;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .category-item.active .category-count {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .categories-footer {
                    padding-top: 15px;
                    border-top: 1px solid #e2e8f0;
                }

                .back-home-btn {
                    display: flex;
                    align-items: center;
                    padding: 10px 15px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    text-decoration: none;
                    color: #64748b;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .back-home-btn:hover {
                    background: #e2e8f0;
                    color: #4f46e5;
                }

                .back-icon {
                    margin-right: 8px;
                    font-size: 1.1rem;
                }

                @media (max-width: 768px) {
                    .tool-categories-sidebar {
                        width: 100%;
                        margin-bottom: 20px;
                        position: static;
                    }
                }
            </style>
        `;
    }

}

// 全局实例
window.toolCategories = new ToolCategoriesComponent();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolCategoriesComponent;
} else {
    window.ToolCategoriesComponent = ToolCategoriesComponent;
}