// 页脚组件
class FooterComponent {
    constructor() {
        this.currentYear = new Date().getFullYear();
    }

    // 获取页脚HTML
    getHTML() {
        return `
            <footer>
                <div class="footer-content">
                    <div class="footer-column">
                        <h3>关于我们</h3>
                        <p>内容创作者工具箱是一个为内容创作者、自媒体运营者和数字营销人员提供高效工具的平台。</p>
                        <div class="footer-social">
                            <a href="#" class="social-icon"><i class="fab fa-weixin"></i></a>
                            <a href="#" class="social-icon"><i class="fab fa-weibo"></i></a>
                            <a href="#" class="social-icon"><i class="fab fa-github"></i></a>
                        </div>
                    </div>
                    
                    <div class="footer-column">
                        <h3>相关链接</h3>
                        <ul class="footer-links">
                            <li><a href="https://res.xiaolux.com" target="_blank">副业资源导航</a></li>
                            <li><a href="https://blog.xiaolux.com" target="_blank">副业指南博客</a></li>
                            <li><a href="https://xiaolux.com" target="_blank">关于我</a></li>
                            <li><a href="guide.html">使用指南</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h3>热门工具</h3>
                        <ul class="footer-links">
                            <li><a href="tools/json-processor.html">JSON处理器</a></li>
                            <li><a href="tools/base64-encoder.html">Base64编码解码</a></li>
                            <li><a href="tools/image-converter.html">图片转换器</a></li>
                            <li><a href="tools/text-converter.html">文本转换器</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h3>联系方式</h3>
                        <ul class="footer-links">
                            <li><i class="fab fa-weixin"></i> 微信：xiaoluv12</li>
                            <li><a href="https://mp.weixin.qq.com/s/rmEHqGeNgRIQ0_Jzqx0jiA" target="_blank"><i class="fas fa-newspaper"></i> 公众号：小路成长笔记</a></li>
                            <li><a href="https://t.zsxq.com/17wTksRxX" target="_blank"><i class="fas fa-star"></i> 小路知识星球</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="copyright">
                    <p>&copy; ${this.currentYear} 内容创作者工具箱. 保留所有权利.</p>
                </div>
            </footer>
        `;
    }

    // 获取页脚CSS样式
    getCSS() {
        return `
            /* 页脚样式 */
            footer {
                background-color: white;
                padding: 3rem 5%;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
                margin-top: auto;
            }
            
            .footer-content {
                max-width: 1400px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
            }
            
            .footer-column h3 {
                font-size: 1.2rem;
                margin-bottom: 1.5rem;
                color: var(--dark);
            }
            
            .footer-links {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .footer-links li {
                margin-bottom: 0.8rem;
            }
            
            .footer-links a {
                text-decoration: none;
                color: var(--gray);
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .footer-links a:hover {
                color: var(--primary);
            }
            
            .footer-links i {
                width: 16px;
                text-align: center;
            }
            
            .footer-social {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .social-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(67, 97, 238, 0.1);
                color: var(--primary);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
                text-decoration: none;
            }
            
            .social-icon:hover {
                background-color: var(--primary);
                color: white;
                transform: translateY(-2px);
            }
            
            .copyright {
                text-align: center;
                padding-top: 2rem;
                margin-top: 2rem;
                border-top: 1px solid rgba(0, 0, 0, 0.05);
                color: var(--gray);
            }
            
            .copyright p {
                margin: 0;
                font-size: 0.9rem;
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                footer {
                    padding: 2rem 5%;
                }
                
                .footer-content {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                
                .footer-column h3 {
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                }
                
                .footer-social {
                    justify-content: center;
                }
            }
        `;
    }

    // 渲染页脚
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
    }

    // 添加样式到页面
    addStyles() {
        const styleId = 'footer-styles';
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
        // 页脚链接点击事件
        const footerLinks = document.querySelectorAll('.footer-links a[href^="#"]');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') {
                    e.preventDefault();
                    console.log('Footer link clicked:', link.textContent);
                }
            });
        });

        // 社交媒体链接点击事件
        const socialLinks = document.querySelectorAll('.social-icon');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') {
                    e.preventDefault();
                    const iconClass = link.querySelector('i').className;
                    console.log('Social link clicked:', iconClass);
                }
            });
        });
    }

    // 更新年份
    updateYear() {
        this.currentYear = new Date().getFullYear();
        const copyrightElement = document.querySelector('.copyright p');
        if (copyrightElement) {
            copyrightElement.textContent = `© ${this.currentYear} 内容创作者工具箱. 保留所有权利.`;
        }
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FooterComponent;
} else {
    window.FooterComponent = FooterComponent;
}