/**
 * 工具分类管理模块
 * 提供分类筛选、显示和管理功能
 */

class CategoryManager {
    constructor() {
        this.categories = [];
        this.tools = [];
        this.selectedCategories = new Set();
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadTools();
        this.renderCategoryFilter();
        this.bindEvents();
    }

    async loadCategories() {
        try {
            const response = await fetch('categories.json');
            this.categories = await response.json();
        } catch (error) {
            console.error('加载分类数据失败:', error);
        }
    }

    async loadTools() {
        try {
            const response = await fetch('tools.json');
            this.tools = await response.json();
        } catch (error) {
            console.error('加载工具数据失败:', error);
        }
    }

    renderCategoryFilter() {
        const filterContainer = document.getElementById('category-filter');
        if (!filterContainer) return;

        const filterHTML = `
            <div class="category-filter-container">
                <div class="filter-header">
                    <h3><i class="fas fa-filter"></i> 工具分类</h3>
                    <button class="btn-clear-filter" onclick="categoryManager.clearAllFilters()">
                        <i class="fas fa-times"></i> 清除筛选
                    </button>
                </div>
                <div class="category-grid">
                    <div class="category-item all-category ${this.selectedCategories.size === 0 ? 'active' : ''}" 
                         onclick="categoryManager.selectAllCategories()">
                        <div class="category-icon">
                            <i class="fas fa-th-large"></i>
                        </div>
                        <div class="category-info">
                            <div class="category-name">全部工具</div>
                            <div class="category-count">${this.tools.length}</div>
                        </div>
                    </div>
                    ${this.categories.map(category => `
                        <div class="category-item ${this.selectedCategories.has(category.id) ? 'active' : ''}" 
                             onclick="categoryManager.toggleCategory('${category.id}')" 
                             style="--category-color: ${category.color}">
                            <div class="category-icon">
                                <i class="${category.icon}"></i>
                            </div>
                            <div class="category-info">
                                <div class="category-name">${category.name}</div>
                                <div class="category-count">${this.getToolCountByCategory(category.id)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        filterContainer.innerHTML = filterHTML;
    }

    getToolCountByCategory(categoryId) {
        return this.tools.filter(tool => 
            tool.categories && tool.categories.includes(categoryId)
        ).length;
    }

    toggleCategory(categoryId) {
        if (this.selectedCategories.has(categoryId)) {
            this.selectedCategories.delete(categoryId);
        } else {
            this.selectedCategories.add(categoryId);
        }
        this.updateDisplay();
    }

    selectAllCategories() {
        this.selectedCategories.clear();
        this.updateDisplay();
    }

    clearAllFilters() {
        this.selectedCategories.clear();
        this.updateDisplay();
    }

    updateDisplay() {
        this.renderCategoryFilter();
        this.filterTools();
        this.updateStats();
    }

    filterTools() {
        const toolsContainer = document.querySelector('.tools-grid');
        if (!toolsContainer) return;

        const filteredTools = this.getFilteredTools();
        
        // 隐藏所有工具卡片
        const allToolCards = toolsContainer.querySelectorAll('.tool-card');
        allToolCards.forEach(card => {
            card.style.display = 'none';
        });

        // 显示符合条件的工具卡片
        filteredTools.forEach(tool => {
            const toolCard = toolsContainer.querySelector(`[data-tool-id="${tool.id}"]`);
            if (toolCard) {
                toolCard.style.display = 'block';
            }
        });

        // 显示无结果提示
        this.showNoResultsMessage(filteredTools.length === 0);
    }

    getFilteredTools() {
        if (this.selectedCategories.size === 0) {
            return this.tools;
        }

        return this.tools.filter(tool => {
            if (!tool.categories) return false;
            return Array.from(this.selectedCategories).some(categoryId => 
                tool.categories.includes(categoryId)
            );
        });
    }

    showNoResultsMessage(show) {
        let noResultsDiv = document.querySelector('.no-results-message');
        
        if (show) {
            if (!noResultsDiv) {
                noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'no-results-message';
                noResultsDiv.innerHTML = `
                    <div class="no-results-content">
                        <i class="fas fa-search"></i>
                        <h3>未找到相关工具</h3>
                        <p>请尝试选择其他分类或清除筛选条件</p>
                    </div>
                `;
                document.querySelector('.tools-grid').appendChild(noResultsDiv);
            }
            noResultsDiv.style.display = 'block';
        } else {
            if (noResultsDiv) {
                noResultsDiv.style.display = 'none';
            }
        }
    }

    updateStats() {
        const statsContainer = document.querySelector('.filter-stats');
        if (!statsContainer) return;

        const filteredCount = this.getFilteredTools().length;
        const totalCount = this.tools.length;
        
        statsContainer.innerHTML = `
            <span class="stats-text">
                显示 <strong>${filteredCount}</strong> / ${totalCount} 个工具
            </span>
        `;
    }

    bindEvents() {
        // 搜索功能
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTools(e.target.value);
            });
        }
    }

    searchTools(query) {
        const toolsContainer = document.querySelector('.tools-grid');
        if (!toolsContainer) return;

        const allToolCards = toolsContainer.querySelectorAll('.tool-card');
        let visibleCount = 0;

        allToolCards.forEach(card => {
            const toolName = card.querySelector('.tool-name')?.textContent.toLowerCase() || '';
            const toolDesc = card.querySelector('.tool-description')?.textContent.toLowerCase() || '';
            const toolTags = card.querySelector('.tool-tags')?.textContent.toLowerCase() || '';
            
            const searchText = query.toLowerCase();
            const isMatch = toolName.includes(searchText) || 
                           toolDesc.includes(searchText) || 
                           toolTags.includes(searchText);

            if (isMatch && (this.selectedCategories.size === 0 || this.isToolInSelectedCategories(card))) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        this.showNoResultsMessage(visibleCount === 0);
        this.updateSearchStats(visibleCount, query);
    }

    isToolInSelectedCategories(toolCard) {
        const toolId = toolCard.getAttribute('data-tool-id');
        const tool = this.tools.find(t => t.id === toolId);
        
        if (!tool || !tool.categories) return false;
        
        return Array.from(this.selectedCategories).some(categoryId => 
            tool.categories.includes(categoryId)
        );
    }

    updateSearchStats(count, query) {
        const statsContainer = document.querySelector('.filter-stats');
        if (!statsContainer) return;

        if (query.trim()) {
            statsContainer.innerHTML = `
                <span class="stats-text">
                    搜索 "${query}" 找到 <strong>${count}</strong> 个工具
                </span>
            `;
        } else {
            this.updateStats();
        }
    }

    getCategoryById(categoryId) {
        return this.categories.find(cat => cat.id === categoryId);
    }

    getSelectedCategoriesInfo() {
        return Array.from(this.selectedCategories).map(id => this.getCategoryById(id));
    }
}

// 全局实例
let categoryManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    categoryManager = new CategoryManager();
});