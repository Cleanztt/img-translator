import { Html, Head, Main, NextScript } from 'next/document';

/**
 * 自定义文档组件
 * @returns {JSX.Element} 文档元素
 */
export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <body className="min-h-screen bg-gray-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 