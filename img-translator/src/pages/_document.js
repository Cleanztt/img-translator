import { Html, Head, Main, NextScript } from 'next/document';

/**
 * 自定义文档组件
 * @returns {JSX.Element} 文档元素
 */
export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head />
      <body className="min-h-screen bg-gray-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 