// 导航栏组件
class NavbarComponent {
    constructor() {
        this.currentPage = 'home';
    }

    // 获取导航栏HTML
    getHTML() {
        return `
            <header>
                <nav class="navbar">
                    <a href="index.html" class="logo">
                        <div class="logo-icon">
                            <i class="fas fa-tools"></i>
                        </div>
                        <div class="logo-text">内容创作者<span>工具箱</span></div>
                    </a>
                    
                    <div class="nav-center">
                        <div class="nav-links">
                            <a href="index.html" class="nav-link" data-page="home">首页</a>
                            <a href="https://res.xiaolux.com" target="_blank" class="nav-link">副业资源导航</a>
                            <a href="https://blog.xiaolux.com" target="_blank" class="nav-link">副业指南博客</a>
                            <a href="https://xiaolux.com" target="_blank" class="nav-link">关于我</a>
                            <a href="https://t.zsxq.com/17wTksRxX" target="_blank" class="nav-link">免费社群</a>
                            <a href="guide.html" target="_blank" class="nav-link">使用指南</a>
                        </div>
                        
                        <div class="search-container">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" class="search-input" placeholder="搜索工具..." id="search-input">
                        </div>
                    </div>
                    
                    <button class="mobile-menu-btn">
                        <i class="fas fa-bars"></i>
                    </button>
                </nav>
            </header>
        `;
    }

    // 获取导航栏CSS样式
    getCSS() {
        return `
            /* 导航栏样式 */
            header {
                background: rgba(255, 255, 255, 0.95);
                box-shadow: var(--shadow);
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                padding: 0 5%;
                height: 80px;
            }
            
            .navbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.2rem 0;
                max-width: 1400px;
                margin: 0 auto;
                height: 100%;
            }
            
            /* 为固定导航栏添加body padding */
            body {
                padding-top: 80px;
            }
            
            .logo {
                display: flex;
                align-items: center;
                gap: 12px;
                text-decoration: none;
            }
            
            .logo-icon {
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
                width: 42px;
                height: 42px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.4rem;
                box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
            }
            
            .logo-text {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--dark);
            }
            
            .logo-text span {
                color: var(--primary);
            }
            
            .nav-center {
                display: flex;
                align-items: center;
                gap: 2rem;
                flex: 1;
                justify-content: center;
            }
            
            .nav-links {
                display: flex;
                gap: 2rem;
            }
            
            .search-container {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .search-icon {
                position: absolute;
                left: 1rem;
                color: var(--gray);
                z-index: 1;
            }
            
            .search-input {
                padding: 0.8rem 1rem 0.8rem 2.5rem;
                border: 2px solid rgba(67, 97, 238, 0.1);
                border-radius: 25px;
                background: rgba(255, 255, 255, 0.9);
                font-size: 0.9rem;
                width: 250px;
                transition: var(--transition);
            }
            
            .search-input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
                background: white;
            }
            
            .nav-links a {
                text-decoration: none;
                color: var(--gray);
                font-weight: 500;
                transition: var(--transition);
                position: relative;
                padding: 0.5rem 0;
            }
            
            .nav-links a:hover, 
            .nav-links a.active {
                color: var(--primary);
            }
            
            .nav-links a::after {
                content: '';
                position: absolute;
                width: 0;
                height: 2px;
                bottom: 0;
                left: 50%;
                background: var(--primary);
                transition: var(--transition);
                transform: translateX(-50%);
            }
            
            .nav-links a:hover::after,
            .nav-links a.active::after {
                width: 100%;
            }
            
            .mobile-menu-btn {
                display: none;
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--dark);
                cursor: pointer;
            }
            
            @media (max-width: 768px) {
                .nav-center {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    flex-direction: column;
                    padding: 1rem;
                    box-shadow: var(--shadow);
                    gap: 1rem;
                }
                
                .nav-center.show {
                    display: flex;
                }
                
                .nav-links {
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .search-container {
                    width: 100%;
                }
                
                .search-input {
                    width: 100%;
                }
                
                .mobile-menu-btn {
                    display: block;
                }
            }
        `;
    }

    // 渲染导航栏
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }

        // 添加CSS样式
        this.addStyles();
        
        // 添加HTML
        container.innerHTML = this.getHTML();
        
        // 绑定事件
        this.bindEvents();
        
        // 设置当前页面状态
        this.setActivePage();
    }

    // 添加样式到页面
    addStyles() {
        const styleId = 'navbar-styles';
        if (document.getElementById(styleId)) {
            return; // 样式已存在
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = this.getCSS();
        document.head.appendChild(style);
    }

    // 绑定事件
    bindEvents() {
        // 移动菜单切换
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navCenter = document.querySelector('.nav-center');
        
        if (mobileMenuBtn && navCenter) {
            mobileMenuBtn.addEventListener('click', () => {
                navCenter.classList.toggle('show');
            });
        }

        // 导航链接点击事件
        const navLinkElements = document.querySelectorAll('.nav-link[data-page]');
        navLinkElements.forEach(link => {
            link.addEventListener('click', (e) => {
                const page = link.getAttribute('data-page');
                if (page && page !== 'home') {
                    e.preventDefault();
                    // 根据页面类型进行跳转
                    this.handleNavigation(page);
                }
            });
        });
        
        // 处理首页链接
        const homeLinks = document.querySelectorAll('a[href="index.html"]');
        homeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // 如果当前在工具页面，需要返回上级目录
                if (window.location.pathname.includes('/tools/')) {
                    e.preventDefault();
                    window.location.href = '../index.html';
                }
            });
        });
    }

    // 设置当前活跃页面
    setActivePage(page = null) {
        if (page) {
            this.currentPage = page;
        }

        // 移除所有活跃状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // 设置当前页面为活跃状态
        const currentLink = document.querySelector(`[data-page="${this.currentPage}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        } else if (this.currentPage === 'home') {
            // 首页特殊处理
            const homeLink = document.querySelector('a[href="index.html"].nav-link');
            if (homeLink) {
                homeLink.classList.add('active');
            }
        }
    }

    // 处理导航
    handleNavigation(page) {
        switch (page) {
            case 'tools':
                // 如果在工具页面，跳转到首页
                if (window.location.pathname.includes('/tools/')) {
                    window.location.href = '../index.html';
                } else {
                    // 在首页，滚动到工具区域
                    const toolsSection = document.querySelector('.tools-grid');
                    if (toolsSection) {
                        toolsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                break;
            case 'about':
                // 跳转到关于页面或滚动到关于区域
                const aboutSection = document.querySelector('.about-section');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    // 如果在工具页面，先跳转到首页再滚动
                    if (window.location.pathname.includes('/tools/')) {
                        window.location.href = '../index.html#about';
                    }
                }
                break;
            case 'contact':
                // 跳转到联系我们
                window.open('https://t.zsxq.com/17wTksRxX', '_blank');
                break;
            default:
                console.log(`Navigate to ${page}`);
        }
    }
    
    // 更新导航栏状态
    updateState(page) {
        this.setActivePage(page);
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarComponent;
} else {
    window.NavbarComponent = NavbarComponent;
}