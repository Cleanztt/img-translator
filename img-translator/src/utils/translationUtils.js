import axios from 'axios';
import md5 from 'md5';

// 百度翻译API配置
const BAIDU_APP_ID = '20240321001982301'; // 替换为实际的百度翻译API ID
const BAIDU_APP_KEY = 'KzIwpkQjBiV09AXzQJHv'; // 替换为实际的百度翻译API密钥

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

  try {
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
    } else {
      console.error('翻译返回格式错误', response.data);
      return text;
    }
  } catch (error) {
    console.error('翻译出错', error);
    // 如果翻译出错，返回原文
    return text;
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
  
  // 并行处理所有翻译请求
  const results = await Promise.all(
    validTexts.map(text => translateText(text, from, to))
  );
  
  // 将结果映射回原始数组
  return texts.map(text => {
    if (text && containsChinese(text)) {
      const index = validTexts.indexOf(text);
      return results[index] || text;
    }
    return text;
  });
}; 