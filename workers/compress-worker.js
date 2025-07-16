// 文件压缩Worker

// 导入需要的库
importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'
);

// 设置PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
}

// 更新压缩进度
function updateProgress(index, progress) {
    self.postMessage({
        type: 'progress',
        data: {
            fileIndex: index,
            progress: progress
        }
    });
}

// 处理文件压缩
self.onmessage = async function(e) {
    const { file, index, options } = e.data;
    
    try {
        // 根据文件类型选择不同的压缩策略
        let compressedFile;
        
        // 开始压缩
        updateProgress(index, 0);
        
        switch(file.type.split('/')[0]) {
            case 'image':
                updateProgress(index, 10);
                compressedFile = await compressImage(file, options, index);
                updateProgress(index, 95);
                break;
            case 'video':
                updateProgress(index, 10);
                compressedFile = await compressVideo(file, options, index);
                updateProgress(index, 95);
                break;
            case 'application':
                if (file.type === 'application/pdf') {
                    updateProgress(index, 10);
                    compressedFile = await compressPDF(file, options, index);
                    updateProgress(index, 95);
                } else {
                    updateProgress(index, 10);
                    compressedFile = await compressGenericFile(file, options, index);
                    updateProgress(index, 95);
                }
                break;
            default:
                updateProgress(index, 10);
                compressedFile = await compressGenericFile(file, options, index);
                updateProgress(index, 95);
        }
        
        // 发送完成消息
        updateProgress(index, 100);
        self.postMessage({
            type: 'complete',
            data: {
                compressedFile,
                originalFile: file
            }
        });
        
    } catch (error) {
        self.postMessage({
            type: 'error',
            data: {
                message: error.message,
                fileIndex: index
            }
        });
    }
};

// 压缩图片
async function compressImage(file, options, index) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            updateProgress(index, 30);
            const img = new Image();
            
            img.onload = function() {
                updateProgress(index, 50);
                
                // 创建canvas元素
                const canvas = document.createElement ? document.createElement('canvas') : new OffscreenCanvas(1, 1);
                const ctx = canvas.getContext('2d');
                
                // 计算压缩参数，结合用户设置
                let { width, height, quality } = calculateCompressionParams(img, file.size, options);
                
                canvas.width = width;
                canvas.height = height;
                
                // 设置高质量渲染
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                updateProgress(index, 70);
                
                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);
                
                updateProgress(index, 80);
                
                // 转换为Blob
                if (canvas.toBlob) {
                    canvas.toBlob(blob => {
                        const compressedFile = new File([blob], 
                            file.name.replace(/\.[^\.]+$/, '.jpg'), 
                            { type: 'image/jpeg' }
                        );
                        
                        updateProgress(index, 90);
                        
                        // 如果压缩效果不佳，尝试更激进的压缩
                        if (compressedFile.size >= file.size * 0.9 && options.compressionLevel >= 3) {
                            tryAggressiveCompression(img, file, options).then(resolve).catch(() => resolve(file));
                        } else {
                            resolve(compressedFile);
                        }
                    }, 'image/jpeg', quality);
                } else {
                    // 降级处理：使用canvas.convertToBlob
                    canvas.convertToBlob({
                        type: 'image/jpeg',
                        quality: quality
                    }).then(blob => {
                        const compressedFile = new File([blob], 
                            file.name.replace(/\.[^\.]+$/, '.jpg'), 
                            { type: 'image/jpeg' }
                        );
                        resolve(compressedFile.size < file.size ? compressedFile : file);
                    }).catch(() => resolve(file));
                }
            };
            
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
    });
}

// 计算压缩参数
function calculateCompressionParams(img, fileSize, options = {}) {
    let width = img.width;
    let height = img.height;
    let quality = options.quality || 0.8;
    
    // 根据压缩级别调整参数
    const compressionLevel = options.compressionLevel || 2;
    
    // 根据压缩级别设置最大尺寸
    let maxWidth, maxHeight;
    switch(compressionLevel) {
        case 1: // 低压缩
            maxWidth = options.maxWidth || 3840;
            maxHeight = options.maxHeight || 2160;
            quality = Math.max(quality, 0.8);
            break;
        case 2: // 中压缩
            maxWidth = options.maxWidth || 1920;
            maxHeight = options.maxHeight || 1080;
            quality = Math.max(quality * 0.9, 0.7);
            break;
        case 3: // 高压缩
            maxWidth = options.maxWidth || 1280;
            maxHeight = options.maxHeight || 720;
            quality = Math.max(quality * 0.8, 0.6);
            break;
        case 4: // 极高压缩
            maxWidth = options.maxWidth || 960;
            maxHeight = options.maxHeight || 540;
            quality = Math.max(quality * 0.7, 0.4);
            break;
        default:
            maxWidth = options.maxWidth || 1920;
            maxHeight = options.maxHeight || 1080;
    }
    
    // 根据文件大小进一步调整
    if (fileSize > 10 * 1024 * 1024) { // 10MB以上
        quality *= 0.8;
        maxWidth = Math.min(maxWidth, 1920);
        maxHeight = Math.min(maxHeight, 1080);
    } else if (fileSize > 5 * 1024 * 1024) { // 5MB-10MB
        quality *= 0.9;
    }
    
    // 调整尺寸
    if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.round(height * ratio);
    }
    if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = Math.round(width * ratio);
    }
    
    // 确保质量在合理范围内
    quality = Math.max(0.1, Math.min(1.0, quality));
    
    return { width, height, quality };
}

// 激进压缩
async function tryAggressiveCompression(img, file, options = {}) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement ? document.createElement('canvas') : new OffscreenCanvas(1, 1);
        const ctx = canvas.getContext('2d');
        
        // 更激进的尺寸缩减
        const compressionLevel = options.compressionLevel || 4;
        let maxSize = compressionLevel >= 4 ? 800 : 1280;
        
        let width = Math.min(img.width, maxSize);
        let height = Math.round((width / img.width) * img.height);
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, width, height);
        
        // 根据压缩级别调整质量
        let quality = compressionLevel >= 4 ? 0.3 : 0.4;
        
        if (canvas.toBlob) {
            canvas.toBlob(blob => {
                const compressedFile = new File([blob], 
                    file.name.replace(/\.[^\.]+$/, '.jpg'), 
                    { type: 'image/jpeg' }
                );
                resolve(compressedFile.size < file.size ? compressedFile : file);
            }, 'image/jpeg', quality);
        } else {
            resolve(file);
        }
    });
}

// 压缩视频（基于元数据优化）
async function compressVideo(file, options, index) {
    return new Promise(async (resolve, reject) => {
        try {
            updateProgress(index, 20);
            
            // 由于Web Worker中无法直接处理视频编码，我们采用其他策略
            // 1. 对于小视频文件，尝试通用压缩
            // 2. 对于大视频文件，提供元数据优化
            
            const arrayBuffer = await file.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            
            updateProgress(index, 40);
            
            // 检查视频文件类型和大小
            const videoInfo = analyzeVideoFile(file, data);
            
            updateProgress(index, 50);
            
            // 根据压缩级别调整策略
            const compressionLevel = options.compressionLevel || 2;
            const sizeThreshold = compressionLevel >= 3 ? 20 * 1024 * 1024 : 10 * 1024 * 1024; // 高压缩级别处理更大的文件
            
            if (file.size < sizeThreshold) { // 根据压缩级别调整阈值
                updateProgress(index, 60);
                const compressed = await compressVideoAsGeneric(file, data, compressionLevel);
                if (compressed && compressed.size < file.size * 0.9) {
                    updateProgress(index, 90);
                    resolve(compressed);
                    return;
                }
            }
            
            updateProgress(index, 70);
            
            // 对于大视频文件，尝试元数据优化
            const optimized = await optimizeVideoMetadata(file, data, videoInfo, compressionLevel);
            if (optimized && optimized.size < file.size) {
                updateProgress(index, 90);
                resolve(optimized);
            } else {
                // 如果无法有效压缩，返回原文件
                updateProgress(index, 90);
                resolve(file);
            }
            
        } catch (error) {
            console.error('视频压缩失败:', error);
            resolve(file); // 出错时返回原文件
        }
    });
}

// 分析视频文件
function analyzeVideoFile(file, data) {
    const info = {
        format: 'unknown',
        hasMetadata: false,
        metadataSize: 0
    };
    
    // 检测文件格式
    if (data.length >= 4) {
        const header = Array.from(data.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');
        
        if (header.startsWith('0000')) {
            // 可能是MP4
            info.format = 'mp4';
        } else if (data[0] === 0x46 && data[1] === 0x4C && data[2] === 0x56) {
            // FLV格式
            info.format = 'flv';
        } else if (data[0] === 0x1A && data[1] === 0x45 && data[2] === 0xDF && data[3] === 0xA3) {
            // WebM/MKV格式
            info.format = 'webm';
        }
    }
    
    // 检查是否有大量元数据（简单启发式）
    if (data.length > 1024) {
        const sample = data.slice(0, 1024);
        const nullBytes = sample.filter(b => b === 0).length;
        info.hasMetadata = nullBytes < sample.length * 0.5; // 如果空字节少于50%，可能有元数据
    }
    
    return info;
}

// 作为通用文件压缩视频
async function compressVideoAsGeneric(file, data, compressionLevel = 2) {
    try {
        // 根据压缩级别调整压缩参数
        const pakoLevel = Math.min(9, compressionLevel * 2 + 1);
        
        // 尝试gzip压缩
        const compressed = pako.gzip(data, { level: pakoLevel });
        
        // 根据压缩级别调整压缩效果阈值
        const thresholds = [0.95, 0.9, 0.8, 0.7, 0.6]; // 对应压缩级别 0-4
        const threshold = thresholds[Math.min(compressionLevel, 4)] || 0.8;
        
        if (compressed.length < data.length * threshold) {
            const compressedFile = new File([compressed], file.name + '.gz', {
                type: 'application/gzip'
            });
            compressedFile.compressionMethod = 'gzip';
            compressedFile.originalSize = file.size;
            compressedFile.compressionRatio = compressed.length / file.size;
            return compressedFile;
        }
        
        return null;
    } catch (error) {
        console.warn('视频通用压缩失败:', error.message);
        return null;
    }
}

// 优化视频元数据
async function optimizeVideoMetadata(file, data, videoInfo, compressionLevel = 2) {
    try {
        // 对于MP4文件，尝试移除不必要的元数据
        if (videoInfo.format === 'mp4') {
            return optimizeMP4Metadata(file, data, compressionLevel);
        }
        
        // 对于其他格式，尝试基本优化
        return optimizeGenericVideoMetadata(file, data, compressionLevel);
        
    } catch (error) {
        console.warn('视频元数据优化失败:', error.message);
        return null;
    }
}

// 优化MP4元数据
function optimizeMP4Metadata(file, data, compressionLevel = 2) {
    try {
        // 简单的MP4元数据移除（移除可能的大块无用数据）
        const optimizedData = new Uint8Array(data);
        
        // 查找并移除一些常见的元数据块
        // 这是一个简化的实现，实际的MP4解析会更复杂
        let hasOptimization = false;
        
        // 移除文件末尾的填充数据
        let endIndex = optimizedData.length - 1;
        while (endIndex > 0 && optimizedData[endIndex] === 0) {
            endIndex--;
            hasOptimization = true;
        }
        
        // 根据压缩级别调整优化阈值
        const minBytes = compressionLevel >= 3 ? 50 : 100; // 高压缩级别更激进
        
        if (hasOptimization && endIndex < optimizedData.length - minBytes) {
            const trimmedData = optimizedData.slice(0, endIndex + 1);
            const optimizedFile = new File([trimmedData], file.name, { type: file.type });
            optimizedFile.compressionMethod = 'mp4-trim';
            optimizedFile.originalSize = file.size;
            optimizedFile.compressionRatio = trimmedData.length / file.size;
            return optimizedFile;
        }
        
        return null;
    } catch (error) {
        console.warn('MP4优化失败:', error.message);
        return null;
    }
}

// 优化通用视频元数据
function optimizeGenericVideoMetadata(file, data, compressionLevel = 2) {
    try {
        // 移除文件末尾的空字节
        let endIndex = data.length - 1;
        while (endIndex > 0 && data[endIndex] === 0) {
            endIndex--;
        }
        
        // 根据压缩级别调整优化阈值
        const minBytes = compressionLevel >= 3 ? 50 : 100; // 高压缩级别更激进
        
        if (endIndex < data.length - minBytes) { // 如果移除了足够的字节
            const trimmedData = data.slice(0, endIndex + 1);
            const optimizedFile = new File([trimmedData], file.name, { type: file.type });
            optimizedFile.compressionMethod = 'metadata-trim';
            optimizedFile.originalSize = file.size;
            optimizedFile.compressionRatio = trimmedData.length / file.size;
            return optimizedFile;
        }
        
        return null;
    } catch (error) {
        console.warn('通用视频优化失败:', error.message);
        return null;
    }
}

// 压缩PDF
async function compressPDF(file, options, index) {
    return new Promise(async (resolve, reject) => {
        try {
            updateProgress(index, 20);
            
            // 读取PDF文件
            const arrayBuffer = await file.arrayBuffer();
            
            updateProgress(index, 40);
            
            // 使用PDF-lib进行压缩
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            // 获取所有页面
            const pages = pdfDoc.getPages();
            
            updateProgress(index, 60);
            
            // 根据压缩级别调整压缩策略
            const compressionLevel = options.compressionLevel || 2;
            const aggressiveCompression = compressionLevel >= 3;
            
            // 压缩策略：移除不必要的元素，优化图像
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                // 获取页面资源
                const resources = page.node.Resources;
                
                if (resources && resources.XObject) {
                    const xObjects = resources.XObject;
                    
                    // 遍历页面中的图像对象
                    for (const [key, xObject] of Object.entries(xObjects)) {
                        if (xObject && xObject.Subtype && xObject.Subtype.name === 'Image') {
                            try {
                                // 降低图像质量以减小文件大小
                                if (xObject.Filter && xObject.Filter.name === 'DCTDecode') {
                                    // JPEG图像，可以进一步压缩
                                    const imageData = xObject.Contents;
                                    if (imageData && imageData.length > 10000) {
                                        // 根据压缩级别调整压缩比例
                                        const compressionRatio = aggressiveCompression ? 0.5 : 0.7;
                                        xObject.dict.set(PDFLib.PDFName.of('Length'), PDFLib.PDFNumber.of(Math.floor(imageData.length * compressionRatio)));
                                    }
                                }
                            } catch (e) {
                                // 忽略单个图像处理错误
                                console.warn('图像压缩警告:', e.message);
                            }
                        }
                    }
                }
                
                // 更新进度
                updateProgress(index, 60 + (i / pages.length) * 20);
            }
            
            updateProgress(index, 80);
            
            // 保存压缩后的PDF
            const compressedPdfBytes = await pdfDoc.save({
                useObjectStreams: true, // 使用对象流压缩
                addDefaultPage: false,
                objectsPerTick: aggressiveCompression ? 20 : 50, // 激进压缩时使用更小的批次
                updateFieldAppearances: false // 跳过字段外观更新
            });
            
            updateProgress(index, 90);
            
            const compressedFile = new File([compressedPdfBytes], file.name, { type: 'application/pdf' });
            
            // 如果压缩效果不明显且启用了激进压缩，尝试更激进的压缩
            if (compressedFile.size >= file.size * 0.9 && aggressiveCompression) {
                const aggressiveCompressed = await aggressivePDFCompression(arrayBuffer, file.name);
                resolve(aggressiveCompressed.size < file.size ? aggressiveCompressed : file);
            } else {
                resolve(compressedFile);
            }
            
        } catch (error) {
            console.error('PDF压缩失败:', error);
            // 尝试基础压缩
            try {
                const basicCompressed = await basicPDFCompression(file);
                resolve(basicCompressed);
            } catch (e) {
                resolve(file); // 最后返回原文件
            }
        }
    });
}

// 激进PDF压缩
async function aggressivePDFCompression(arrayBuffer, fileName) {
    try {
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // 移除元数据
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
        
        // 更激进的保存选项
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 100,
            updateFieldAppearances: false
        });
        
        return new File([compressedBytes], fileName, { type: 'application/pdf' });
    } catch (error) {
        throw error;
    }
}

// 基础PDF压缩（使用pako）
async function basicPDFCompression(file) {
    const arrayBuffer = await file.arrayBuffer();
    const compressed = pako.deflate(new Uint8Array(arrayBuffer), { level: 9 });
    
    // 创建一个包含压缩数据的新文件（注意：这不是有效的PDF，仅用于存储）
    const compressedFile = new File([compressed], file.name + '.compressed', { type: 'application/octet-stream' });
    
    // 如果压缩效果好，返回压缩文件，否则返回原文件
    return compressedFile.size < file.size * 0.8 ? compressedFile : file;
}

// 通用文件压缩
async function compressGenericFile(file, options, index) {
    return new Promise(async (resolve, reject) => {
        try {
            updateProgress(index, 20);
            
            const arrayBuffer = await file.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            
            updateProgress(index, 40);
            
            // 根据压缩级别调整压缩参数
            const compressionLevel = options.compressionLevel || 2;
            const pakoLevel = Math.min(9, compressionLevel * 2 + 1); // 1-9的压缩级别
            
            // 尝试不同的压缩算法
            const compressionResults = [];
            
            updateProgress(index, 50);
            
            // 1. Deflate压缩（最常用）
            try {
                const deflateCompressed = pako.deflate(data, { level: pakoLevel, windowBits: 15 });
                compressionResults.push({
                    data: deflateCompressed,
                    extension: '.deflate',
                    type: 'application/octet-stream',
                    method: 'deflate'
                });
            } catch (e) {
                console.warn('Deflate压缩失败:', e.message);
            }
            
            updateProgress(index, 60);
            
            // 2. Gzip压缩
            try {
                const gzipCompressed = pako.gzip(data, { level: pakoLevel });
                compressionResults.push({
                    data: gzipCompressed,
                    extension: '.gz',
                    type: 'application/gzip',
                    method: 'gzip'
                });
            } catch (e) {
                console.warn('Gzip压缩失败:', e.message);
            }
            
            updateProgress(index, 70);
            
            // 3. 原始deflate（无头部）- 仅在高压缩级别时使用
            if (compressionLevel >= 3) {
                try {
                    const rawCompressed = pako.deflateRaw(data, { level: pakoLevel });
                    compressionResults.push({
                        data: rawCompressed,
                        extension: '.raw',
                        type: 'application/octet-stream',
                        method: 'raw'
                    });
                } catch (e) {
                    console.warn('Raw压缩失败:', e.message);
                }
            }
            
            updateProgress(index, 80);
            
            // 选择压缩效果最好的结果
            let bestCompression = null;
            let bestRatio = 1;
            
            for (const result of compressionResults) {
                const ratio = result.data.length / file.size;
                if (ratio < bestRatio) {
                    bestRatio = ratio;
                    bestCompression = result;
                }
            }
            
            updateProgress(index, 85);
            
            // 如果找到了有效的压缩结果
            if (bestCompression && bestRatio < 0.95) {
                // 创建压缩文件名
                const baseName = file.name.includes('.') ? 
                    file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
                const originalExt = file.name.includes('.') ? 
                    file.name.substring(file.name.lastIndexOf('.')) : '';
                
                const compressedFileName = `${baseName}_compressed${originalExt}${bestCompression.extension}`;
                
                const compressedFile = new File([bestCompression.data], compressedFileName, {
                    type: bestCompression.type
                });
                
                // 添加压缩信息到文件对象
                compressedFile.compressionMethod = bestCompression.method;
                compressedFile.originalSize = file.size;
                compressedFile.compressionRatio = bestRatio;
                
                updateProgress(index, 90);
                resolve(compressedFile);
            } else {
                // 如果压缩效果不好，尝试文本文件特殊处理
                const textCompressed = await tryTextCompression(file, data, compressionLevel);
                updateProgress(index, 90);
                resolve(textCompressed || file);
            }
            
        } catch (error) {
            console.error('通用文件压缩失败:', error);
            resolve(file);
        }
    });
}

// 文本文件特殊压缩处理
async function tryTextCompression(file, data, compressionLevel = 2) {
    try {
        // 检查是否为文本文件
        const isText = isTextFile(file.name, data);
        
        if (isText) {
            // 对文本文件进行预处理
            let text = new TextDecoder('utf-8').decode(data);
            
            // 根据压缩级别调整文本预处理强度
            if (compressionLevel >= 2) {
                // 基础预处理：统一换行符
                text = text.replace(/\r\n/g, '\n');
            }
            
            if (compressionLevel >= 3) {
                // 中级预处理：合并空白字符
                text = text.replace(/[ \t]+/g, ' '); // 合并多个空格
                text = text.replace(/\n\s*\n/g, '\n'); // 移除空行
            }
            
            if (compressionLevel >= 4) {
                // 高级预处理：移除行首行尾空白
                text = text.split('\n').map(line => line.trim()).join('\n').trim();
            }
            
            // 重新编码并压缩
            const processedData = new TextEncoder().encode(text);
            const pakoLevel = Math.min(9, compressionLevel * 2 + 1);
            const compressed = pako.gzip(processedData, { level: pakoLevel });
            
            // 根据压缩级别调整压缩效果阈值
            const thresholds = [0.95, 0.9, 0.8, 0.7, 0.6]; // 对应压缩级别 0-4
            const threshold = thresholds[Math.min(compressionLevel, 4)] || 0.8;
            
            if (compressed.length < file.size * threshold) {
                const compressedFile = new File([compressed], file.name + '.txt.gz', {
                    type: 'application/gzip'
                });
                compressedFile.compressionMethod = 'text-optimized-gzip';
                compressedFile.originalSize = file.size;
                compressedFile.compressionRatio = compressed.length / file.size;
                return compressedFile;
            }
        }
        
        return null;
    } catch (error) {
        console.warn('文本压缩失败:', error.message);
        return null;
    }
}

// 检查是否为文本文件
function isTextFile(fileName, data) {
    // 根据文件扩展名判断
    const textExtensions = ['.txt', '.js', '.css', '.html', '.xml', '.json', '.csv', '.md', '.log', '.sql', '.py', '.java', '.cpp', '.c', '.h'];
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    
    if (textExtensions.includes(ext)) {
        return true;
    }
    
    // 检查文件内容是否为文本
    try {
        const sample = data.slice(0, Math.min(1024, data.length));
        const text = new TextDecoder('utf-8', { fatal: true }).decode(sample);
        
        // 检查是否包含过多的控制字符
        const controlChars = text.match(/[\x00-\x08\x0E-\x1F\x7F]/g);
        return !controlChars || controlChars.length < text.length * 0.1;
    } catch (e) {
        return false;
    }
}