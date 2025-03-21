import { useState } from 'react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import ImageProcessor from '../components/ImageProcessor';
import Footer from '../components/Footer';

/**
 * 应用主页
 * @returns {JSX.Element} 主页组件
 */
function Home() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [activeSection, setActiveSection] = useState('home');

  /**
   * 处理图片上传
   * @param {File} file - 上传的图片文件
   */
  const handleImageUpload = (file) => {
    setUploadedImage(file);
    setProcessedImage(null);
    setActiveSection('uploader');
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
   * 渲染主页内容
   * @returns {JSX.Element} 主页内容组件
   */
  const renderMainContent = () => {
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-grow">
        {renderMainContent()}
      </main>
      <Footer />
    </div>
  );
}

export default Home;