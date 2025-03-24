import axios from 'axios';
import md5 from 'md5';

// 百度翻译API配置
const BAIDU_APP_ID = '20250316002304904'; // 替换为实际的百度翻译API ID
const BAIDU_APP_KEY = 'E8R5UhkK4ThD2qzNL90N'; // 替换为实际的百度翻译API密钥

// 模拟翻译映射，用于演示
const DEMO_TRANSLATIONS = {
  '产品名称': 'Product Name',
  '智能翻译': 'Smart Translation',
  '使用说明': 'Instructions',
  '这是一段中文产品描述文本': 'This is a Chinese product description text',
  '请按照说明正确使用本产品': 'Please use this product according to the instructions',
  '高品质': 'High Quality',
  '中国制造': 'Made in China',
  '质量保证': 'Quality Guarantee',
  '使用方法': 'Usage Method',
  '注意事项': 'Precautions',
  '联系我们': 'Contact Us',
  '产品特点': 'Product Features',
  '技术参数': 'Technical Parameters',
  '保修信息': 'Warranty Information'
};

/**
 * 百度翻译API接口
 * @param {string} text - 需要翻译的文本
 * @param {string} [from='zh'] - 源语言
 * @param {string} [to='en'] - 目标语言
 * @returns {Promise<string>} 翻译后的文本
 */
export const translateText = async (text, from = 'zh', to = 'en') => {
  if (!text || text.trim() === '') {
    return '';
  }

  // 先检查是否有模拟翻译
  if (DEMO_TRANSLATIONS[text]) {
    return DEMO_TRANSLATIONS[text];
  }
  
  try {
    // 使用本地API路由来解决跨域问题
    const response = await axios.post('/api/translate', {
      text,
      from,
      to
    });
    
    if (response.data && response.data.result) {
      return response.data.result;
    }
    
    // 如果API返回结果无效，使用模拟翻译
    return `[EN] ${text}`;
  } catch (error) {
    console.error('翻译出错', error);
    // 如果翻译出错，返回带标记的原文
    return `[T] ${text}`;
  }
};

/**
 * 在服务器端使用的百度翻译函数（用于API路由）
 * @param {string} text - 需要翻译的文本
 * @param {string} [from='zh'] - 源语言
 * @param {string} [to='en'] - 目标语言
 * @returns {Promise<string>} 翻译后的文本
 */
export const serverTranslateText = async (text, from = 'zh', to = 'en') => {
  if (!text || text.trim() === '') {
    return '';
  }

  // 先检查是否有模拟翻译
  if (DEMO_TRANSLATIONS[text]) {
    return DEMO_TRANSLATIONS[text];
  }
  
  try {
    // 使用百度翻译API
    const salt = Date.now().toString();
    const sign = md5(BAIDU_APP_ID + text + salt + BAIDU_APP_KEY);
    
    const response = await axios.get('https://fanyi-api.baidu.com/api/trans/vip/translate', {
      params: {
        q: text,
        from,
        to,
        appid: BAIDU_APP_ID,
        salt,
        sign
      }
    });
    
    if (response.data && response.data.trans_result && response.data.trans_result.length > 0) {
      return response.data.trans_result[0].dst;
    }
    
    // 如果API返回结果无效，使用模拟翻译
    return `[EN] ${text}`;
  } catch (error) {
    console.error('翻译出错', error);
    // 如果翻译出错，返回带标记的原文
    return `[T] ${text}`;
  }
};

/**
 * 检测文本是否是中文
 * @param {string} text - 要检测的文本
 * @returns {boolean} 是否包含中文
 */
export const containsChinese = (text) => {
  if (!text) return false;
  const pattern = /[\u4e00-\u9fa5]/;
  return pattern.test(text);
};

/**
 * 批量翻译多个文本
 * @param {string[]} texts - 要翻译的文本数组
 * @param {string} [from='zh'] - 源语言
 * @param {string} [to='en'] - 目标语言
 * @returns {Promise<string[]>} 翻译后的文本数组
 */
export const batchTranslate = async (texts, from = 'zh', to = 'en') => {
  // 过滤空文本和非中文文本
  const validTexts = texts.filter(text => text && containsChinese(text));
  
  if (validTexts.length === 0) {
    return texts;
  }
  
  try {
    // 使用批量翻译API端点
    const response = await axios.post('/api/batch-translate', {
      texts,
      from,
      to
    });
    
    if (response.data && response.data.results) {
      return response.data.results;
    }
    
    // 如果API返回结果无效，返回原始文本
    return texts;
  } catch (error) {
    console.error('批量翻译出错', error);
    // 如果翻译出错，返回原始文本
    return texts;
  }
}; 