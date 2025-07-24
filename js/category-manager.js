/**
 * 现代化工具分类管理器
 * 提供高性能的分类筛选、搜索和UI交互功能
 * @version 3.0
 */

class ToolCategoryManager {
    constructor(options = {}) {
        // 配置选项
        this.config = {
            categoriesUrl: 'categories.json',
            toolsUrl: 'tools.json',
            filterContainer: '#category-filter',
            toolsContainer: '#tools-container',
            searchInput: '#search-input',
            debounceDelay: 150,
            animationDuration: 100,
            ...options
        };

        // 数据存储
        this.data = {
            categories: [],
            tools: [],
            filteredTools: []
        };

        // 状态管理
        this.state = {
            selectedCategories: new Set(),
            searchQuery: '',
            isMultiSelect: false,
            isLoading: false,
            isInitialized: false
        };

        // 缓存DOM元素
        this.elements = {};

        // 事件处理器
        this.handlers = {
            search: this.debounce(this.handleSearch.bind(this), this.config.debounceDelay),
            categoryClick: this.handleCategoryClick.bind(this),
            clearFilter: this.handleClearFilter.bind(this),
            toggleMultiSelect: this.handleToggleMultiSelect.bind(this)
        };

        // 初始化
        this.init();
    }

    /**
     * 初始化管理器
     */
    async init() {
        try {
            this.state.isLoading = true;
            console.log('🚀 ToolCategoryManager 初始化开始...');

            // 缓存DOM元素
            this.cacheElements();

            // 并行加载数据
            await Promise.all([
                this.loadCategories(),
                this.loadTools()
            ]);

            // 渲染UI
            this.render();

            // 绑定事件
            this.bindEvents();

            // 初始筛选
            this.applyFilters();

            this.state.isLoading = false;
            this.state.isInitialized = true;
            
            console.log('✅ ToolCategoryManager 初始化完成');
            this.dispatchEvent('initialized', { manager: this });

        } catch (error) {
            this.state.isLoading = false;
            console.error('❌ ToolCategoryManager 初始化失败:', error);
            this.showError('初始化失败，请刷新页面重试');
            throw error;
        }
    }

    /**
     * 缓存DOM元素
     */
    cacheElements() {
        this.elements = {
            filterContainer: document.querySelector(this.config.filterContainer),
            toolsContainer: document.querySelector(this.config.toolsContainer),
            searchInput: document.querySelector(this.config.searchInput)
        };

        // 验证必需元素
        if (!this.elements.filterContainer) {
            throw new Error(`分类筛选容器未找到: ${this.config.filterContainer}`);
        }
        if (!this.elements.toolsContainer) {
            throw new Error(`工具容器未找到: ${this.config.toolsContainer}`);
        }
    }

    /**
     * 加载分类数据
     */
    async loadCategories() {
        try {
            console.log('📂 加载分类数据...');
            const response = await fetch(this.config.categoriesUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.data.categories = await response.json();
            console.log(`✅ 分类数据加载成功: ${this.data.categories.length} 个分类`);
            
        } catch (error) {
            console.error('❌ 分类数据加载失败:', error);
            this.data.categories = [];
            throw error;
        }
    }

    /**
     * 加载工具数据
     */
    async loadTools() {
        try {
            console.log('🔧 加载工具数据...');
            const response = await fetch(this.config.toolsUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.data.tools = await response.json();
            this.data.filteredTools = [...this.data.tools];
            console.log(`✅ 工具数据加载成功: ${this.data.tools.length} 个工具`);
            
        } catch (error) {
            console.error('❌ 工具数据加载失败:', error);
            this.data.tools = [];
            this.data.filteredTools = [];
            throw error;
        }
    }

    /**
     * 渲染UI
     */
    render() {
        this.renderCategoryFilter();
        this.updateToolsVisibility();
    }

    /**
     * 渲染分类筛选器
     */
    renderCategoryFilter() {
        if (!this.elements.filterContainer) return;

        const hasActiveFilters = this.state.selectedCategories.size > 0;
        
        const filterHTML = `
            <div class="category-filter-wrapper">
                <div class="filter-header">
                    <h3><i class="fas fa-filter"></i> 工具分类</h3>
                    <div class="filter-controls">
                        <button class="btn-multi-select ${this.state.isMultiSelect ? 'active' : ''}" 
                                onclick="toolCategoryManager.handlers.toggleMultiSelect()">
                            <i class="fas fa-layer-group"></i>
                            ${this.state.isMultiSelect ? '多选模式' : '单选模式'}
                        </button>
                        ${hasActiveFilters ? `
                            <button class="btn-clear-filter" onclick="toolCategoryManager.handlers.clearFilter()">
                                <i class="fas fa-times"></i> 清除筛选
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="category-stats">
                    <span class="stats-text">
                        显示 <strong>${this.data.filteredTools.length}</strong> / ${this.data.tools.length} 个工具
                        ${hasActiveFilters ? `（已筛选 ${this.state.selectedCategories.size} 个分类）` : ''}
                    </span>
                </div>
                
                <div class="category-grid">
                    ${this.renderAllCategoryItem()}
                    ${this.data.categories.map(category => this.renderCategoryItem(category)).join('')}
                </div>
            </div>
        `;

        this.elements.filterContainer.innerHTML = filterHTML;
        
        // 添加动画效果
        this.animateCategoryItems();
    }

    /**
     * 渲染"全部工具"分类项
     */
    renderAllCategoryItem() {
        const isActive = this.state.selectedCategories.size === 0;
        const count = this.data.tools.length;
        
        return `
            <div class="category-item all-category ${isActive ? 'active' : ''}" 
                 data-category="all" 
                 onclick="toolCategoryManager.handlers.categoryClick('all')">
                <div class="category-icon">
                    <i class="fas fa-th-large"></i>
                </div>
                <div class="category-info">
                    <div class="category-name">全部工具</div>
                    <div class="category-count">${count}</div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染单个分类项
     */
    renderCategoryItem(category) {
        const isActive = this.state.selectedCategories.has(category.id);
        const count = this.getToolCountByCategory(category.id);
        
        return `
            <div class="category-item ${isActive ? 'active' : ''}" 
                 data-category="${category.id}" 
                 style="--category-color: ${category.color}"
                 onclick="toolCategoryManager.handlers.categoryClick('${category.id}')">
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <div class="category-count">${count}</div>
                </div>
            </div>
        `;
    }

    /**
     * 获取分类下的工具数量
     */
    getToolCountByCategory(categoryId) {
        return this.data.tools.filter(tool => 
            tool.categories && tool.categories.includes(categoryId)
        ).length;
    }

    /**
     * 添加分类项动画
     */
    animateCategoryItems() {
        const items = this.elements.filterContainer.querySelectorAll('.category-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 20}ms`;
            item.classList.add('animate-in');
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 搜索事件
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.handlers.search(e.target.value);
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.elements.searchInput?.focus();
            }
            if (e.key === 'Escape') {
                this.handlers.clearFilter();
            }
        });
    }

    /**
     * 处理分类点击
     */
    handleCategoryClick(categoryId) {
        if (categoryId === 'all') {
            this.state.selectedCategories.clear();
        } else {
            if (this.state.isMultiSelect) {
                if (this.state.selectedCategories.has(categoryId)) {
                    this.state.selectedCategories.delete(categoryId);
                } else {
                    this.state.selectedCategories.add(categoryId);
                }
            } else {
                this.state.selectedCategories.clear();
                this.state.selectedCategories.add(categoryId);
            }
        }

        this.applyFilters();
        this.updateCategoryStates();
        this.updateToolsVisibility();
        this.updateStats();
        
        // 触发事件
        this.dispatchEvent('categoryChanged', {
            selectedCategories: Array.from(this.state.selectedCategories),
            filteredCount: this.data.filteredTools.length
        });
    }

    /**
     * 处理搜索
     */
    handleSearch(query) {
        this.state.searchQuery = query.toLowerCase().trim();
        this.applyFilters();
        this.updateToolsVisibility();
        
        // 更新统计信息
        this.updateStats();
        
        // 触发事件
        this.dispatchEvent('searchChanged', {
            query: this.state.searchQuery,
            filteredCount: this.data.filteredTools.length
        });
    }

    /**
     * 清除筛选
     */
    handleClearFilter() {
        this.state.selectedCategories.clear();
        this.state.searchQuery = '';
        
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }
        
        this.applyFilters();
        this.updateCategoryStates();
        this.updateToolsVisibility();
        this.updateStats();
        
        // 触发事件
        this.dispatchEvent('filtersCleared', {
            filteredCount: this.data.filteredTools.length
        });
    }

    /**
     * 切换多选模式
     */
    handleToggleMultiSelect() {
        this.state.isMultiSelect = !this.state.isMultiSelect;
        
        // 如果切换到单选模式且有多个选中项，只保留第一个
        if (!this.state.isMultiSelect && this.state.selectedCategories.size > 1) {
            const firstCategory = Array.from(this.state.selectedCategories)[0];
            this.state.selectedCategories.clear();
            this.state.selectedCategories.add(firstCategory);
            this.applyFilters();
            this.updateToolsVisibility();
        }
        
        this.updateMultiSelectButton();
        this.updateCategoryStates();
        this.updateStats();
        
        // 触发事件
        this.dispatchEvent('multiSelectToggled', {
            isMultiSelect: this.state.isMultiSelect
        });
    }

    /**
     * 应用筛选条件
     */
    applyFilters() {
        this.data.filteredTools = this.data.tools.filter(tool => {
            // 分类筛选
            const categoryMatch = this.state.selectedCategories.size === 0 || 
                (tool.categories && tool.categories.some(cat => this.state.selectedCategories.has(cat)));
            
            // 搜索筛选
            const searchMatch = !this.state.searchQuery || 
                tool.name.toLowerCase().includes(this.state.searchQuery) ||
                tool.description.toLowerCase().includes(this.state.searchQuery) ||
                tool.shortDesc.toLowerCase().includes(this.state.searchQuery) ||
                (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(this.state.searchQuery)));
            
            return categoryMatch && searchMatch;
        });
    }

    /**
     * 更新工具可见性
     */
    updateToolsVisibility() {
        if (!this.elements.toolsContainer) return;
        
        const toolCards = this.elements.toolsContainer.querySelectorAll('.tool-card');
        const filteredToolIds = new Set(this.data.filteredTools.map(tool => tool.id));
        
        toolCards.forEach(card => {
            const toolId = card.getAttribute('data-tool-id');
            const shouldShow = filteredToolIds.has(toolId);
            
            if (shouldShow) {
                card.style.display = 'block';
                card.classList.remove('hidden');
            } else {
                card.style.display = 'none';
                card.classList.add('hidden');
            }
        });
    }

    /**
     * 更新分类状态（只更新active类，不重新渲染）
     */
    updateCategoryStates() {
        const categoryItems = this.elements.filterContainer?.querySelectorAll('.category-item');
        if (!categoryItems) return;
        
        categoryItems.forEach(item => {
            const categoryId = item.getAttribute('data-category');
            const isActive = categoryId === 'all' 
                ? this.state.selectedCategories.size === 0
                : this.state.selectedCategories.has(categoryId);
            
            if (isActive) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * 更新多选按钮状态
     */
    updateMultiSelectButton() {
        const multiSelectBtn = this.elements.filterContainer?.querySelector('.multi-select-btn');
        if (multiSelectBtn) {
            if (this.state.isMultiSelect) {
                multiSelectBtn.classList.add('active');
            } else {
                multiSelectBtn.classList.remove('active');
            }
            multiSelectBtn.innerHTML = `
                <i class="fas fa-layer-group"></i>
                ${this.state.isMultiSelect ? '多选模式' : '单选模式'}
            `;
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const statsElement = this.elements.filterContainer?.querySelector('.stats-text');
        if (statsElement) {
            const hasActiveFilters = this.state.selectedCategories.size > 0 || this.state.searchQuery;
            statsElement.innerHTML = `
                显示 <strong>${this.data.filteredTools.length}</strong> / ${this.data.tools.length} 个工具
                ${hasActiveFilters ? `（已筛选）` : ''}
            `;
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        if (this.elements.filterContainer) {
            this.elements.filterContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${message}</span>
                </div>
            `;
        }
    }

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 触发自定义事件
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(`toolCategory:${eventName}`, {
            detail,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * 获取当前状态
     */
    getState() {
        return {
            ...this.state,
            selectedCategories: Array.from(this.state.selectedCategories),
            filteredToolsCount: this.data.filteredTools.length,
            totalToolsCount: this.data.tools.length
        };
    }

    /**
     * 销毁管理器
     */
    destroy() {
        // 清理事件监听器
        if (this.elements.searchInput) {
            this.elements.searchInput.removeEventListener('input', this.handlers.search);
        }
        
        // 清理数据
        this.data = { categories: [], tools: [], filteredTools: [] };
        this.state = {
            selectedCategories: new Set(),
            searchQuery: '',
            isMultiSelect: false,
            isLoading: false,
            isInitialized: false
        };
        
        console.log('🗑️ ToolCategoryManager 已销毁');
    }
}

// 全局实例
let toolCategoryManager;

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待其他脚本加载完成
    setTimeout(() => {
        try {
            toolCategoryManager = new ToolCategoryManager();
            window.toolCategoryManager = toolCategoryManager;
            console.log('🎉 全局 ToolCategoryManager 实例已创建');
        } catch (error) {
            console.error('❌ 全局 ToolCategoryManager 创建失败:', error);
        }
    }, 500);
});

// 导出到全局
window.ToolCategoryManager = ToolCategoryManager;