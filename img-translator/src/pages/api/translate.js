import { serverTranslateText } from '../../utils/translationUtils';

/**
 * 翻译API路由处理函数
 * @param {Object} req - HTTP请求对象
 * @param {Object} res - HTTP响应对象
 */
export default async function handler(req, res) {
  // 仅允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST方法' });
  }

  try {
    const { text, from = 'zh', to = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ error: '缺少要翻译的文本' });
    }

    // 调用服务器端翻译函数
    const result = await serverTranslateText(text, from, to);
    
    // 返回翻译结果
    res.status(200).json({ result });
  } catch (error) {
    console.error('翻译API出错:', error);
    res.status(500).json({ error: '翻译服务出错', message: error.message });
  }
} 