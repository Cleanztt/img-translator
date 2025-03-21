import '../styles/globals.css';
import Head from 'next/head';

/**
 * 应用入口组件
 * @param {Object} props - 组件属性
 * @param {React.ComponentType} props.Component - 页面组件
 * @param {Object} props.pageProps - 页面属性
 * @returns {JSX.Element} 应用入口元素
 */
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>产品图片翻译工具</title>
        <meta name="description" content="一款能够自动识别产品图片中的中文文本并将其翻译成英文的工具" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;