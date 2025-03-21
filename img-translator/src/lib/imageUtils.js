import Tesseract from 'tesseract.js';
import axios from 'axios';
import md5 from 'md5';

/**
 * 文字识别函数
 * @param {File} imageFile - 图片文件
 * @returns {Promise<Array>} 识别出的文字区域数组
 */
export async function recognizeText(imageFile) {
  try {
    // 添加处理进度的回调
    const progressCallback = info => {
      if (info.status === 'recognizing text') {
        console.log(`文字识别进度: ${(info.progress * 100).toFixed(2)}%`);
      }
    };
    
    const result = await Tesseract.recognize(
      imageFile,
      'chi_sim+eng', // 中文简体+英文
      { 
        logger: progressCallback
      }
    );
    
    // 过滤低置信度文本，并将结果转换为方便处理的格式
    const confidenceThreshold = 65; // 65%的置信度阈值
    return result.data.words
      .filter(word => word.confidence > confidenceThreshold)
      .map((word, index) => ({
        id: index,
        text: word.text,
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
        confidence: word.confidence
      }));
  } catch (error) {
    console.error('文字识别错误:', error);
    throw new Error('文字识别失败: ' + error.message);
  }
}

/**
 * 百度翻译API接口
 * @param {Array<string>} texts - 需要翻译的文字数组
 * @param {string} from - 源语言，默认auto自动检测
 * @param {string} to - 目标语言，默认en英语
 * @returns {Promise<Array<string>>} 翻译后的文字数组
 */
export async function translateText(texts, from = 'auto', to = 'en') {
  if (!texts || texts.length === 0) {
    return [];
  }
  
  try {
    // 百度翻译API配置
    const appid = '20250316002304904';
    const key = 'E8R5UhkK4ThD2qzNL90N';
    const salt = new Date().getTime();
    
    // 为了优化性能，合并文本进行批量翻译
    // 百度翻译API有单次请求字符数限制，这里使用简单的分组策略
    const batchSize = 5; // 每批次翻译5个文本
    const batches = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      batches.push(texts.slice(i, i + batchSize));
    }
    
    // 处理每批次文本
    const translationResults = [];
    
    for (const batch of batches) {
      // 合并文本，用特殊分隔符区分
      const batchText = batch.join('\n');
      
      // 计算签名
      const sign = md5(appid + batchText + salt + key);
      
      // 调用百度翻译API
      const response = await axios.get('http://api.fanyi.baidu.com/api/trans/vip/translate', {
        params: {
          q: batchText,
          appid,
          salt,
          from,
          to,
          sign
        },
        timeout: 10000, // 设置超时时间为10秒
      });
      
      // 检查API响应
      if (response.data && response.data.trans_result) {
        // 解析每个翻译结果，并按原始顺序添加到结果数组
        response.data.trans_result.forEach(item => {
          translationResults.push(item.dst);
        });
      } else if (response.data && response.data.error_code) {
        console.error('百度翻译API错误:', response.data);
        throw new Error(`翻译API错误: ${response.data.error_code} - ${response.data.error_msg || '未知错误'}`);
      }
      
      // 添加请求间隔，防止API限流
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return translationResults;
  } catch (error) {
    console.error('翻译错误:', error);
    
    // 发生错误时使用本地备选翻译
    return texts.map(text => {
      // 简单替换中文为英文示例作为后备方案
      const fallbackTranslations = {
        '产品名称': 'Product Name',
        '使用说明': 'Instructions',
        '警告': 'Warning',
        '特点': 'Features',
        '规格': 'Specifications'
      };
      
      return fallbackTranslations[text] || `Untranslated: ${text}`;
    });
  }
}

/**
 * 图片处理函数
 * @param {string} originalImageUrl - 原始图片URL（base64格式）
 * @param {Array} textRegions - 文字区域信息数组
 * @param {Array<string>} translations - 翻译后的文字数组
 * @returns {Promise<string>} 处理后的图片URL
 */
export async function processImage(originalImageUrl, textRegions, translations) {
  return new Promise((resolve) => {
    // 创建新的图片对象
    const image = new Image();
    image.src = originalImageUrl;
    
    image.onload = () => {
      // 创建Canvas
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      
      const ctx = canvas.getContext('2d');
      
      // 绘制原始图片
      ctx.drawImage(image, 0, 0);
      
      // 在文字区域上覆盖翻译后的文字
      textRegions.forEach((region, index) => {
        if (index >= translations.length) return;
        
        const translation = translations[index];
        
        // 计算字体大小，确保文本合适地适应矩形区域
        const fontSize = calculateFontSize(region.width, region.height, translation);
        
        // 先用白色半透明矩形覆盖原文字区域
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(region.x, region.y, region.width, region.height);
        
        // 设置文字样式
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'top';
        
        // 文本换行处理
        drawTextWithWrapping(
          ctx, 
          translation, 
          region.x, 
          region.y, 
          region.width, 
          region.height, 
          fontSize
        );
      });
      
      // 转换为base64图片
      const processedImageUrl = canvas.toDataURL('image/png');
      resolve(processedImageUrl);
    };
  });
}

/**
 * 计算合适的字体大小
 * @param {number} width - 区域宽度
 * @param {number} height - 区域高度
 * @param {string} text - 文本内容
 * @returns {number} 计算后的字体大小
 */
function calculateFontSize(width, height, text) {
  // 基础字体大小，根据区域高度计算
  let baseFontSize = height * 0.7;
  
  // 每个字符的估计宽度是字体大小的0.6倍
  const estimatedCharWidth = baseFontSize * 0.6;
  
  // 估计文本总宽度
  const estimatedTextWidth = text.length * estimatedCharWidth;
  
  // 如果估计宽度超过区域宽度，按比例缩小字体
  if (estimatedTextWidth > width) {
    const ratio = width / estimatedTextWidth;
    baseFontSize = Math.max(12, Math.floor(baseFontSize * ratio)); // 设置最小字体大小为12px
  }
  
  return Math.min(baseFontSize, height * 0.7); // 限制最大字体大小
}

/**
 * 绘制可换行的文本
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {string} text - 要绘制的文本
 * @param {number} x - 开始x坐标
 * @param {number} y - 开始y坐标
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @param {number} fontSize - 字体大小
 */
function drawTextWithWrapping(ctx, text, x, y, maxWidth, maxHeight, fontSize) {
  // 文本行间距
  const lineHeight = fontSize * 1.2;
  
  // 文本单词分割
  const words = text.split(' ');
  let line = '';
  let lines = [];
  
  // 计算文本行
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  
  // 如果文本行超出最大高度，减小字体大小
  if (lines.length * lineHeight > maxHeight) {
    const newFontSize = Math.floor(fontSize * (maxHeight / (lines.length * lineHeight)));
    ctx.font = `${newFontSize}px Arial, sans-serif`;
    return drawTextWithWrapping(ctx, text, x, y, maxWidth, maxHeight, newFontSize);
  }
  
  // 垂直居中
  const totalTextHeight = lines.length * lineHeight;
  const startY = y + (maxHeight - totalTextHeight) / 2;
  
  // 绘制文本
  lines.forEach((line, index) => {
    // 水平居中
    const textWidth = ctx.measureText(line).width;
    const startX = x + (maxWidth - textWidth) / 2;
    
    ctx.fillText(line, startX, startY + index * lineHeight);
  });
}

/**
 * 在实际项目中，建议将文字识别和翻译功能放在后端处理
 * 前端可以调用API接口进行处理，这样可以减轻前端负担并保护API密钥
 */ 