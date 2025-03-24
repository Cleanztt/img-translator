import { useState } from 'react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import ImageProcessor from '../components/ImageProcessor';
import Footer from '../components/Footer';
import Head from 'next/head';

/**
 * 应用主页
 * @returns {JSX.Element} 主页组件
 */
function Home() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const [error, setError] = useState(null);

  /**
   * 处理图片上传
   * @param {File} file - 上传的图片文件
   */
  const handleImageUpload = (file) => {
    try {
      setUploadedImage(file);
      setProcessedImage(null);
      setActiveSection('uploader');
      setError(null);
    } catch (err) {
      console.error('上传图片出错', err);
      setError('上传图片时出错，请刷新页面重试');
    }
  };

  /**
   * 处理图片处理完成
   * @param {string} processedImageUrl - 处理后的图片URL
   */
  const handleProcessingComplete = (processedImageUrl) => {
    setProcessedImage(processedImageUrl);
    setIsProcessing(false);
  };

  /**
   * 渲染页面主要内容
   * @returns {JSX.Element} 主要内容组件
   */
  const renderMainContent = () => {
    try {
      if (error) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <h2 className="text-red-500 text-xl mb-4">出错了</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              刷新页面
            </button>
          </div>
        );
      }

      if (activeSection === 'home') {
        return (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <h1 className="text-4xl font-bold text-center mb-6">产品图片翻译工具</h1>
            <p className="text-xl text-gray-600 text-center max-w-2xl mb-10">
              上传您的产品图片，我们将自动识别图片中的中文文本并将其翻译成英文，然后将翻译后的文本覆盖在原图上
            </p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setActiveSection('uploader')}
            >
              <i className="fas fa-rocket mr-2"></i>
              开始使用
            </button>
          </div>
        );
      }

      return (
        <div className="container mx-auto py-8 px-4">
          {!uploadedImage ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <ImageProcessor
              uploadedImage={uploadedImage}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              processedImage={processedImage}
              onProcessingComplete={handleProcessingComplete}
            />
          )}
        </div>
      );
    } catch (err) {
      console.error('渲染主要内容出错', err);
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <h2 className="text-red-500 text-xl mb-4">页面渲染出错</h2>
          <p className="text-gray-700 mb-4">请刷新页面重试</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            刷新页面
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>产品图片翻译工具</title>
        <meta name="description" content="一个快速识别并翻译产品图片上文字的Web应用" />
      </Head>
      
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderMainContent()}
      </main>
      
      <Footer />
    </div>
  );
}

export default Home;