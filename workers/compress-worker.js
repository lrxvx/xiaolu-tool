// 文件压缩Worker

// 导入需要的库
importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'
);

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
                updateProgress(index, 20);
                compressedFile = await compressImage(file, options);
                updateProgress(index, 90);
                break;
            case 'video':
                // 视频压缩进度会由FFmpeg内部更新
                compressedFile = await compressVideo(file, options);
                break;
            case 'application':
                if (file.type === 'application/pdf') {
                    updateProgress(index, 30);
                    compressedFile = await compressPDF(file, options);
                    updateProgress(index, 90);
                } else {
                    updateProgress(index, 40);
                    compressedFile = await compressGenericFile(file);
                    updateProgress(index, 90);
                }
                break;
            default:
                updateProgress(index, 40);
                compressedFile = await compressGenericFile(file);
                updateProgress(index, 90);
        }
        
        // 发送完成消息
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
                message: error.message
            }
        });
    }
};

// 压缩图片
async function compressImage(file, options) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = function(e) {
            img.src = e.target.result;
            
            img.onload = function() {
                const canvas = new OffscreenCanvas(img.width, img.height);
                const ctx = canvas.getContext('2d');
                
                // 计算新的尺寸
                let width = img.width;
                let height = img.height;
                let quality = options.quality;
                
                // 根据文件大小动态调整压缩参数
                if (file.size > 5 * 1024 * 1024) { // 5MB以上
                    quality = 0.6;
                    if (width > 1920) {
                        height = (1920 / width) * height;
                        width = 1920;
                    }
                } else if (file.size > 2 * 1024 * 1024) { // 2MB-5MB
                    quality = 0.7;
                    if (width > 2560) {
                        height = (2560 / width) * height;
                        width = 2560;
                    }
                } else if (file.size > 1024 * 1024) { // 1MB-2MB
                    quality = 0.8;
                    if (width > 3840) {
                        height = (3840 / width) * height;
                        width = 3840;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // 使用更好的图像渲染
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为Blob
                canvas.convertToBlob({
                    type: 'image/jpeg', // 统一使用JPEG格式以获得更好的压缩率
                    quality: quality
                }).then(blob => {
                    const compressedFile = new File([blob], file.name.replace(/\.[^\.]+$/, '.jpg'), { type: 'image/jpeg' });
                    
                    // 如果压缩后文件更大，返回原文件
                    if (compressedFile.size >= file.size) {
                        resolve(file);
                    } else {
                        resolve(compressedFile);
                    }
                });
            };
        };
        
        reader.readAsDataURL(file);
    });
}

// 压缩视频
async function compressVideo(file, options) {
    // 导入FFmpeg.js
    importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.11.0/dist/ffmpeg.min.js');
    
    return new Promise(async (resolve, reject) => {
        try {
            // 创建FFmpeg实例
            const { createFFmpeg, fetchFile } = FFmpeg;
            const ffmpeg = createFFmpeg({
                log: false,
                corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
            });
            
            // 加载FFmpeg
            await ffmpeg.load();
            
            // 写入文件
            ffmpeg.FS('writeFile', file.name, await fetchFile(file));
            
            // 压缩视频
            await ffmpeg.run(
                '-i', file.name,
                '-c:v', 'libx264',
                '-crf', '28',
                '-preset', 'medium',
                '-c:a', 'aac',
                '-b:a', '128k',
                'output.mp4'
            );
            
            // 读取压缩后的文件
            const data = ffmpeg.FS('readFile', 'output.mp4');
            const compressedFile = new File([data.buffer], file.name.replace(/\.[^\.]+$/, '.mp4'), { type: 'video/mp4' });
            
            // 清理
            ffmpeg.FS('unlink', file.name);
            ffmpeg.FS('unlink', 'output.mp4');
            
            // 如果压缩后文件更大，返回原文件
            if (compressedFile.size >= file.size) {
                resolve(file);
            } else {
                resolve(compressedFile);
            }
        } catch (error) {
            console.error('视频压缩失败:', error);
            resolve(file); // 出错时返回原文件
        }
    });
}

// 压缩PDF
async function compressPDF(file, options) {
    // 导入PDF.js
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
    
    return new Promise(async (resolve, reject) => {
        try {
            const pdfjsLib = self.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            
            // 读取PDF文件
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            // 创建新的PDF文档
            const pdfDoc = await PDFLib.PDFDocument.create();
            
            // 遍历每一页并添加到新文档
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.8 }); // 降低分辨率
                
                // 创建新页面
                const newPage = pdfDoc.addPage([viewport.width, viewport.height]);
                
                // 绘制页面内容
                const canvas = new OffscreenCanvas(viewport.width, viewport.height);
                const context = canvas.getContext('2d');
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                // 将画布内容添加到新页面
                const jpgImage = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
                const image = await pdfDoc.embedJpg(await jpgImage.arrayBuffer());
                newPage.drawImage(image);
            }
            
            // 保存压缩后的PDF
            const compressedPdfBytes = await pdfDoc.save({
                useObjectStreams: false,
                addDefaultPage: false,
                compress: true
            });
            
            const compressedFile = new File([compressedPdfBytes], file.name, { type: 'application/pdf' });
            
            // 如果压缩后文件更大，返回原文件
            if (compressedFile.size >= file.size) {
                resolve(file);
            } else {
                resolve(compressedFile);
            }
        } catch (error) {
            console.error('PDF压缩失败:', error);
            resolve(file); // 出错时返回原文件
        }
    });
}

// 通用文件压缩
async function compressGenericFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                // 使用更高级的压缩选项
                const compressed = pako.deflate(e.target.result, {
                    level: 9, // 最高压缩级别
                    windowBits: 15, // 最大窗口大小
                    memLevel: 9, // 最大内存级别
                    strategy: 0 // 默认策略
                });
                
                // 创建压缩后的文件
                const blob = new Blob([compressed], { type: file.type });
                const compressedFile = new File([blob], file.name, { type: file.type });
                
                // 如果压缩后文件更大，返回原文件
                if (compressedFile.size >= file.size) {
                    resolve(file);
                } else {
                    resolve(compressedFile);
                }
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('文件读取失败'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}