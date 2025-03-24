import { serverTranslateText, containsChinese } from '../../utils/translationUtils';

/**
 * 批量翻译API路由处理函数
 * @param {Object} req - HTTP请求对象
 * @param {Object} res - HTTP响应对象
 */
export default async function handler(req, res) {
  // 仅允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST方法' });
  }

  try {
    const { texts, from = 'zh', to = 'en' } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({ error: '缺少要翻译的文本数组' });
    }

    // 过滤空文本和非中文文本
    const validTexts = texts.filter(text => text && containsChinese(text));
    
    if (validTexts.length === 0) {
      return res.status(200).json({ results: texts });
    }
    
    // 并行处理所有翻译请求
    const translatedResults = await Promise.all(
      validTexts.map(text => serverTranslateText(text, from, to))
    );
    
    // 将结果映射回原始数组
    const results = texts.map(text => {
      if (text && containsChinese(text)) {
        const index = validTexts.indexOf(text);
        return translatedResults[index] || text;
      }
      return text;
    });
    
    // 返回翻译结果
    res.status(200).json({ results });
  } catch (error) {
    console.error('批量翻译API出错:', error);
    res.status(500).json({ error: '翻译服务出错', message: error.message });
  }
} 