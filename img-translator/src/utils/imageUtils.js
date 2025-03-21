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
 */
export const drawText = (ctx, text, x, y, options = {}) => {
  const {
    color = '#000',
    fontSize = '16px',
    fontFamily = 'Arial, sans-serif',
    bgColor = 'rgba(255, 255, 255, 0.8)',
    padding = 4
  } = options;

  ctx.font = `${fontSize} ${fontFamily}`;
  const metrics = ctx.measureText(text);
  const textHeight = parseInt(fontSize, 10);
  
  // 绘制背景
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