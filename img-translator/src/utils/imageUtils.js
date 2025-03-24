/**
 * 将File对象转换为Data URL
 * @param {File} file - 要转换的文件
 * @returns {Promise<string>} 转换后的Data URL
 */
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * 创建图像对象
 * @param {string} src - 图像源URL
 * @returns {Promise<HTMLImageElement>} 加载完成的图像元素
 */
export const createImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = src;
  });
};

/**
 * 等待指定时间
 * @param {number} ms - 等待毫秒数
 * @returns {Promise<void>} 等待完成的Promise
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 绘制文本到Canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {string} text - 要绘制的文本
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {Object} options - 绘制选项
 * @param {string} options.color - 文本颜色
 * @param {string} options.fontSize - 字体大小
 * @param {string} options.fontFamily - 字体家族
 * @param {string} options.bgColor - 背景颜色
 * @param {number} options.padding - 内边距
 * @param {Object} options.originalTextBox - 原文本框信息
 */
export const drawText = (ctx, text, x, y, options = {}) => {
  const {
    color = '#000',
    fontSize = '14px',
    fontFamily = 'Arial, sans-serif',
    bgColor = 'rgba(0, 0, 0, 0.7)',
    padding = 4,
    originalTextBox = null
  } = options;

  // 如果提供了原文本框信息，直接在原位置绘制翻译文本
  if (originalTextBox) {
    const { x: origX, y: origY, width: origWidth, height: origHeight } = originalTextBox;
    
    // 保存上下文状态
    ctx.save();
    
    // 计算原文字体大小（基于文本框高度估算）
    const estimatedOrigFontSize = Math.max(Math.floor(origHeight * 0.7), 10);
    const baseFontSize = `${estimatedOrigFontSize}px`;
    
    // 先完全清除原区域（绘制纯白色矩形作为底层）
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(origX, origY - origHeight, origWidth, origHeight);
    
    // 在原文文本框的位置绘制完全不透明的黑色背景
    ctx.fillStyle = 'rgb(0, 0, 0)'; // 完全不透明黑色
    ctx.fillRect(origX, origY - origHeight, origWidth, origHeight);
    
    // 设置初始字体大小（基于原文估算）
    ctx.font = `${baseFontSize} ${fontFamily}`;
    
    // 测量文本宽度以进行自适应处理
    const metrics = ctx.measureText(text);
    let fitFontSize = baseFontSize;
    
    // 如果文本宽度超过原文框宽度，缩小字体
    if (metrics.width > origWidth - padding * 2) {
      // 按比例缩小字体
      const scaleFactor = (origWidth - padding * 2) / metrics.width;
      const newSize = Math.floor(estimatedOrigFontSize * scaleFactor);
      fitFontSize = `${newSize}px`;
      ctx.font = `${fitFontSize} ${fontFamily}`;
    }
    
    // 在原位置绘制翻译文本
    ctx.fillStyle = '#FFFFFF'; // 白色文本
    
    // 文本居中显示
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制文本
    ctx.fillText(
      text, 
      origX + origWidth / 2, // X坐标居中
      origY - origHeight / 2 // Y坐标居中
    );
    
    // 恢复上下文状态
    ctx.restore();
    return;
  }
  
  // 以下是没有提供原文本框信息时的默认行为
  ctx.font = `${fontSize} ${fontFamily}`;
  const metrics = ctx.measureText(text);
  const textHeight = parseInt(fontSize, 10);
  
  // 绘制翻译文本的背景
  ctx.fillStyle = bgColor;
  ctx.fillRect(
    x - padding, 
    y - textHeight - padding, 
    metrics.width + padding * 2, 
    textHeight + padding * 2
  );
  
  // 绘制文本
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

/**
 * 将图像调整为合适的尺寸
 * @param {HTMLImageElement} image - 原始图像
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @returns {Object} 调整后的尺寸和比例
 */
export const getResizedImageDimensions = (image, maxWidth = 1200, maxHeight = 800) => {
  let { width, height } = image;
  let scale = 1;

  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    scale = Math.min(widthRatio, heightRatio);
    width = width * scale;
    height = height * scale;
  }

  return { width, height, scale };
}; 