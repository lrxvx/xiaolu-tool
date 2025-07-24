// 移动端导航交互功能

class MobileNavigation {
    constructor() {
        this.init();
    }

    init() {
        this.createMobileMenu();
        this.bindEvents();
        this.handleResize();
    }

    createMobileMenu() {
        // 检查是否已存在移动端菜单
        if (document.querySelector('.mobile-menu')) {
            return;
        }

        // 获取导航链接
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) {
            return;
        }

        // 创建移动端菜单
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `
            <button class="mobile-menu-close" aria-label="关闭菜单">
                <i class="fas fa-times"></i>
            </button>
            ${navLinks.innerHTML}
        `;

        // 添加到页面
        document.body.appendChild(mobileMenu);

        // 创建移动端菜单按钮（如果不存在）
        if (!document.querySelector('.mobile-menu-btn')) {
            const navbar = document.querySelector('.navbar');
            const navContainer = navbar?.querySelector('.nav-container') || navbar;
            
            if (navContainer) {
                const menuBtn = document.createElement('button');
                menuBtn.className = 'mobile-menu-btn';
                menuBtn.setAttribute('aria-label', '打开菜单');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                navContainer.appendChild(menuBtn);
            }
        }
    }

    bindEvents() {
        // 移动端菜单按钮点击事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-menu-btn')) {
                this.openMobileMenu();
            }

            if (e.target.closest('.mobile-menu-close')) {
                this.closeMobileMenu();
            }

            // 点击菜单链接后关闭菜单
            if (e.target.closest('.mobile-menu a')) {
                this.closeMobileMenu();
            }

            // 点击菜单外部关闭菜单
            if (e.target.classList.contains('mobile-menu')) {
                this.closeMobileMenu();
            }
        });

        // ESC键关闭菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });

        // 窗口大小改变时处理
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 触摸事件处理
        this.handleTouchEvents();
    }

    openMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // 焦点管理
            const closeBtn = mobileMenu.querySelector('.mobile-menu-close');
            if (closeBtn) {
                closeBtn.focus();
            }
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            
            // 恢复焦点到菜单按钮
            const menuBtn = document.querySelector('.mobile-menu-btn');
            if (menuBtn) {
                menuBtn.focus();
            }
        }
    }

    handleResize() {
        // 在大屏幕时自动关闭移动端菜单
        if (window.innerWidth >= 768) {
            this.closeMobileMenu();
        }
    }

    handleTouchEvents() {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        const mobileMenu = document.querySelector('.mobile-menu');
        if (!mobileMenu) return;

        mobileMenu.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });

        mobileMenu.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            
            // 如果向下滑动超过50px，关闭菜单
            if (currentY - startY > 50) {
                this.closeMobileMenu();
                isDragging = false;
            }
        }, { passive: true });

        mobileMenu.addEventListener('touchend', () => {
            isDragging = false;
        }, { passive: true });
    }
}

// 工具页面特定的移动端优化
class ToolPageMobile {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeToolLayout();
        this.handleToolInteractions();
        this.optimizeFormElements();
    }

    optimizeToolLayout() {
        // 优化工具页面布局
        const toolContainer = document.querySelector('.tool-container');
        if (toolContainer && window.innerWidth < 768) {
            toolContainer.style.padding = '1rem';
        }

        // 优化标签页
        this.optimizeTabs();
        
        // 优化按钮组
        this.optimizeButtonGroups();
    }

    optimizeTabs() {
        const tabs = document.querySelector('.tabs');
        if (!tabs) return;

        // 添加滚动指示器
        if (tabs.scrollWidth > tabs.clientWidth) {
            tabs.classList.add('scrollable');
            
            // 添加滚动指示器样式
            if (!document.querySelector('#tab-scroll-indicator-style')) {
                const style = document.createElement('style');
                style.id = 'tab-scroll-indicator-style';
                style.textContent = `
                    .tabs.scrollable::after {
                        content: '';
                        position: absolute;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        width: 20px;
                        background: linear-gradient(to right, transparent, white);
                        pointer-events: none;
                    }
                    .tabs {
                        position: relative;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        // 点击标签时滚动到可见区域
        tabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (tab) {
                tab.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            }
        });
    }

    optimizeButtonGroups() {
        const buttonGroups = document.querySelectorAll('.button-group');
        buttonGroups.forEach(group => {
            if (window.innerWidth < 576) {
                group.style.flexDirection = 'column';
                const buttons = group.querySelectorAll('.btn');
                buttons.forEach(btn => {
                    btn.style.width = '100%';
                    btn.style.marginRight = '0';
                });
            }
        });
    }

    handleToolInteractions() {
        // 优化文本区域的触摸体验
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            // 防止在移动设备上缩放
            textarea.addEventListener('focus', () => {
                if (window.innerWidth < 768) {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                    }
                }
            });

            textarea.addEventListener('blur', () => {
                if (window.innerWidth < 768) {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                    }
                }
            });
        });

        // 优化文件上传区域
        this.optimizeFileUpload();
    }

    optimizeFileUpload() {
        const uploadAreas = document.querySelectorAll('.upload-area');
        uploadAreas.forEach(area => {
            // 添加触摸反馈
            area.addEventListener('touchstart', () => {
                area.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
            }, { passive: true });

            area.addEventListener('touchend', () => {
                setTimeout(() => {
                    area.style.backgroundColor = '';
                }, 150);
            }, { passive: true });
        });
    }

    optimizeFormElements() {
        // 优化输入框在移动设备上的体验
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // 添加触摸友好的样式
            if (window.innerWidth < 768) {
                input.style.minHeight = '44px';
                input.style.fontSize = '16px'; // 防止iOS缩放
            }
        });

        // 优化滑块控件
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            if (window.innerWidth < 768) {
                slider.style.height = '8px';
                
                // 添加触摸反馈
                slider.addEventListener('input', () => {
                    slider.style.background = `linear-gradient(to right, var(--primary, #4f46e5) 0%, var(--primary, #4f46e5) ${(slider.value - slider.min) / (slider.max - slider.min) * 100}%, #e2e8f0 ${(slider.value - slider.min) / (slider.max - slider.min) * 100}%, #e2e8f0 100%)`;
                });
            }
        });
    }
}

// 响应式图片处理
class ResponsiveImages {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeImages();
        this.handleImageLoading();
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // 添加懒加载
            if ('loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            }

            // 添加错误处理
            img.addEventListener('error', () => {
                img.style.display = 'none';
            });

            // 优化图片显示
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });

            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
        });
    }

    handleImageLoading() {
        // 为图片预览添加加载状态
        const imageContainers = document.querySelectorAll('.image-item, .image-preview');
        imageContainers.forEach(container => {
            const images = container.querySelectorAll('img');
            images.forEach(img => {
                if (!img.complete) {
                    const loader = document.createElement('div');
                    loader.className = 'image-loader';
                    loader.innerHTML = '<div class="spinner"></div>';
                    loader.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 1;
                    `;
                    
                    container.style.position = 'relative';
                    container.appendChild(loader);

                    img.addEventListener('load', () => {
                        loader.remove();
                    });

                    img.addEventListener('error', () => {
                        loader.remove();
                    });
                }
            });
        });
    }
}

// 性能优化
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeScrolling();
        this.optimizeAnimations();
        this.handleVisibilityChange();
    }

    optimizeScrolling() {
        // 节流滚动事件
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 16); // 60fps
        }, { passive: true });
    }

    handleScroll() {
        // 处理滚动相关的优化
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 优化导航栏
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (scrollTop > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            }
        }
    }

    optimizeAnimations() {
        // 检查用户是否偏好减少动画
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            // 禁用动画
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    handleVisibilityChange() {
        // 页面可见性改变时的优化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时暂停动画和定时器
                this.pauseAnimations();
            } else {
                // 页面显示时恢复动画和定时器
                this.resumeAnimations();
            }
        });
    }

    pauseAnimations() {
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
}

// 初始化所有移动端优化
function initMobileOptimizations() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            startOptimizations();
        });
    } else {
        startOptimizations();
    }
}

function startOptimizations() {
    // 初始化移动端导航
    new MobileNavigation();
    
    // 如果是工具页面，初始化工具页面优化
    if (document.querySelector('.tool-container') || document.querySelector('.tool-detail-content')) {
        new ToolPageMobile();
    }
    
    // 初始化响应式图片
    new ResponsiveImages();
    
    // 初始化性能优化
    new PerformanceOptimizer();
}

// 自动初始化
initMobileOptimizations();

// 导出类供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MobileNavigation,
        ToolPageMobile,
        ResponsiveImages,
        PerformanceOptimizer
    };
}