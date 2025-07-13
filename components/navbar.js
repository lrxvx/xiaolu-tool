// 统一导航栏组件
class NavbarComponent {
    constructor() {
        this.init();
    }

    init() {
        this.createNavbar();
        this.bindEvents();
    }

    createNavbar() {
        // 创建导航栏HTML结构
        const navbarHTML = `
            <header class="navbar-header">
                <nav class="navbar">
                    <a href="../index.html" class="logo">
                        <div class="logo-icon">
                            <i class="fas fa-tools"></i>
                        </div>
                        <div class="logo-text">内容创作者<span>工具箱</span></div>
                    </a>
                    
                    <div class="nav-links">
                        <a href="../index.html">首页</a>
                        <a href="../index.html#tools">所有工具</a>
                        <a href="#">关于</a>
                        <a href="#">联系我们</a>
                    </div>
                    
                    <button class="mobile-menu-btn">
                        <i class="fas fa-bars"></i>
                    </button>
                </nav>
            </header>
        `;

        // 插入到页面顶部
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    }

    bindEvents() {
        // 移动端菜单切换
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('mobile-active');
            });
        }
    }

    // 获取导航栏样式
    static getStyles() {
        return `
            /* 导航栏样式 */
            .navbar-header {
                background: rgba(255, 255, 255, 0.95);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                position: sticky;
                top: 0;
                z-index: 100;
                padding: 0 5%;
                backdrop-filter: blur(10px);
            }
            
            .navbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.2rem 0;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .logo {
                display: flex;
                align-items: center;
                gap: 12px;
                text-decoration: none;
            }
            
            .logo-icon {
                background: linear-gradient(135deg, #4361ee, #3f37c9);
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
                color: #212529;
            }
            
            .logo-text span {
                color: #4361ee;
            }
            
            .nav-links {
                display: flex;
                gap: 2rem;
            }
            
            .nav-links a {
                text-decoration: none;
                color: #6c757d;
                font-weight: 500;
                transition: all 0.3s ease;
                position: relative;
                padding: 0.5rem 0;
            }
            
            .nav-links a:hover, 
            .nav-links a.active {
                color: #4361ee;
            }
            
            .nav-links a::after {
                content: '';
                position: absolute;
                width: 0;
                height: 2px;
                bottom: 0;
                left: 0;
                background-color: #4361ee;
                transition: all 0.3s ease;
            }
            
            .nav-links a:hover::after, 
            .nav-links a.active::after {
                width: 100%;
            }
            
            .mobile-menu-btn {
                display: none;
                background: none;
                border: none;
                color: #212529;
                font-size: 1.5rem;
                cursor: pointer;
            }
            
            /* 移动端样式 */
            @media (max-width: 768px) {
                .navbar {
                    padding: 1rem 0;
                }
                
                .nav-links {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    flex-direction: column;
                    padding: 1rem 5%;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }
                
                .nav-links.mobile-active {
                    display: flex;
                }
                
                .mobile-menu-btn {
                    display: block;
                }
                
                .logo-text {
                    font-size: 1.2rem;
                }
                
                .logo-icon {
                    width: 36px;
                    height: 36px;
                    font-size: 1.2rem;
                }
            }
        `;
    }
}

// 自动初始化导航栏
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // 添加Font Awesome图标库
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
        
        // 添加导航栏样式
        const style = document.createElement('style');
        style.textContent = NavbarComponent.getStyles();
        document.head.appendChild(style);
        
        // 初始化导航栏
        new NavbarComponent();
    });
}

// 导出组件（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarComponent;
}