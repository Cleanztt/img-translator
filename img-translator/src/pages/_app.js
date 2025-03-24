import '../styles/globals.css';
import Head from 'next/head';

/**
 * 自定义App组件
 * @param {Object} props - 组件属性
 * @param {React.Component} props.Component - 当前页面组件
 * @param {Object} props.pageProps - 页面属性
 * @returns {JSX.Element} App组件
 */
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>产品图片翻译工具</title>
        <meta name="description" content="一个快速识别并翻译产品图片上文字的Web应用" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;