// 统一页脚组件
class FooterComponent {
    constructor() {
        this.init();
    }

    init() {
        this.createFooter();
    }

    createFooter() {
        // 创建页脚HTML结构
        const footerHTML = `
            <footer class="footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>关于工具箱</h3>
                        <p>为内容创作者提供高效、实用的在线工具集合，提升创作效率，释放创意潜能。</p>
                        <div class="social-links">
                            <a href="#" class="social-link"><i class="fab fa-github"></i></a>
                            <a href="#" class="social-link"><i class="fab fa-weixin"></i></a>
                            <a href="#" class="social-link"><i class="fas fa-envelope"></i></a>
                        </div>
                    </div>
                    
                    <div class="footer-section">
                        <h3>工具分类</h3>
                        <ul class="footer-links">
                            <li><a href="../index.html#tools">图像处理</a></li>
                            <li><a href="../index.html#tools">文本工具</a></li>
                            <li><a href="../index.html#tools">编码工具</a></li>
                            <li><a href="../index.html#tools">计算工具</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h3>联系我们</h3>
                        <ul class="footer-links">
                            <li>微信号：xiaoluv12</li>
                            <li><a href="https://t.zsxq.com/17wTksRxX" target="_blank">知识星球</a></li>
                            <li><a href="https://mp.weixin.qq.com/s/rmEHqGeNgRIQ0_Jzqx0jiA" target="_blank">公众号</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h3>友情链接</h3>
                        <ul class="footer-links">
                            <li><a href="https://t.zsxq.com/17wTksRxX" target="_blank">知识星球社群</a></li>
                            <li><a href="#">开发者博客</a></li>
                            <li><a href="#">技术文档</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <div class="footer-bottom-content">
                        <p>&copy; 2024 内容创作者工具箱. 保留所有权利.</p>
                        <p>由 <a href="https://t.zsxq.com/17wTksRxX" target="_blank" style="color: #4361ee;">小路</a> 用心打造</p>
                    </div>
                </div>
            </footer>
        `;

        // 插入到页面底部
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    // 获取页脚样式
    static getStyles() {
        return `
            /* 页脚样式 */
            .footer {
                background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
                color: white;
                margin-top: auto;
                position: relative;
                width: 100%;
                box-sizing: border-box;
            }
            
            .footer-content {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 2rem;
                padding: 3rem 5%;
                max-width: 1400px;
                margin: 0 auto;
                box-sizing: border-box;
            }
            
            .footer-section {
                min-width: 0;
                box-sizing: border-box;
            }
            
            .footer-section h3 {
                font-size: 1.2rem;
                margin-bottom: 1rem;
                color: #4361ee;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .footer-section p {
                color: #a0aec0;
                line-height: 1.6;
                margin-bottom: 1rem;
                word-wrap: break-word;
                hyphens: auto;
            }
            
            .footer-links {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .footer-links li {
                margin-bottom: 0.5rem;
                word-wrap: break-word;
            }
            
            .footer-links a {
                color: #a0aec0;
                text-decoration: none;
                transition: all 0.3s ease;
                display: inline-block;
                word-wrap: break-word;
            }
            
            .footer-links a:hover {
                color: #4361ee;
                transform: translateX(3px);
            }
            
            .social-links {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
                flex-wrap: wrap;
            }
            
            .social-link {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(67, 97, 238, 0.1);
                color: #4361ee;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                text-decoration: none;
                flex-shrink: 0;
            }
            
            .social-link:hover {
                background-color: #4361ee;
                color: white;
                transform: translateY(-2px);
            }
            
            .footer-bottom {
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding: 1.5rem 5%;
                background-color: rgba(0, 0, 0, 0.2);
            }
            
            .footer-bottom-content {
                max-width: 1400px;
                margin: 0 auto;
                text-align: center;
                color: #a0aec0;
            }
            
            .footer-bottom-content p {
                margin-bottom: 0.5rem;
                font-size: 0.9rem;
            }
            
            /* 平板端样式 */
            @media (max-width: 1024px) {
                .footer-content {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 2rem;
                    padding: 2.5rem 5%;
                }
            }
            
            /* 移动端样式 */
            @media (max-width: 768px) {
                .footer-content {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    padding: 2rem 5%;
                    text-align: center;
                }
                
                .footer-section h3 {
                    white-space: normal;
                }
                
                .social-links {
                    justify-content: center;
                }
                
                .footer-bottom {
                    padding: 1rem 5%;
                }
            }
            
            /* 超小屏幕样式 */
            @media (max-width: 480px) {
                .footer-content {
                    padding: 1.5rem 3%;
                    gap: 1rem;
                }
                
                .footer-section h3 {
                    font-size: 1.1rem;
                }
                
                .footer-section p {
                    font-size: 0.9rem;
                }
                
                .footer-links a {
                    font-size: 0.9rem;
                }
                
                .social-link {
                    width: 36px;
                    height: 36px;
                }
            }
        `;
    }
}

// 自动初始化页脚
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // 添加页脚样式
        const style = document.createElement('style');
        style.textContent = FooterComponent.getStyles();
        document.head.appendChild(style);
        
        // 初始化页脚
        new FooterComponent();
    });
}

// 导出组件（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FooterComponent;
}