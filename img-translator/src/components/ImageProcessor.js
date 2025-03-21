import { useState, useEffect, useRef } from 'react';
import { createImage, fileToDataURL, drawText, getResizedImageDimensions, sleep } from '../utils/imageUtils';
import { translateText, batchTranslate, containsChinese } from '../utils/translationUtils';
import { createWorker } from 'tesseract.js';

/**
 * 图片处理组件
 * @param {Object} props - 组件属性
 * @param {File} props.uploadedImage - 上传的图片文件
 * @param {boolean} props.isProcessing - 是否正在处理中
 * @param {Function} props.setIsProcessing - 设置处理状态的函数
 * @param {string|null} props.processedImage - 处理后的图片URL
 * @param {Function} props.onProcessingComplete - 处理完成后的回调
 * @returns {JSX.Element} 图片处理组件
 */
export default function ImageProcessor({
  uploadedImage,
  isProcessing,
  setIsProcessing,
  processedImage,
  onProcessingComplete
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recognizedText, setRecognizedText] = useState([]);
  const [translatedText, setTranslatedText] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const [worker, setWorker] = useState(null);
  
  // 初始化Tesseract工作器
  useEffect(() => {
    const initWorker = async () => {
      const newWorker = await createWorker('chi_sim');
      setWorker(newWorker);
    };
    
    initWorker();
    
    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, []);

  // 更新预览图
  useEffect(() => {
    if (uploadedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(uploadedImage);
    }
  }, [uploadedImage]);

  // 处理图片
  const processImage = async () => {
    if (!uploadedImage || !worker) return;
    
    try {
      setIsProcessing(true);
      setProgress(0);
      setCurrentStep('准备图片');
      setError(null);
      
      // 读取图片
      const imageDataUrl = await fileToDataURL(uploadedImage);
      const originalImage = await createImage(imageDataUrl);
      
      // 调整图片大小
      setProgress(10);
      setCurrentStep('调整图片大小');
      const { width, height, scale } = getResizedImageDimensions(originalImage);
      
      // 创建Canvas
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // 绘制原始图片
      ctx.drawImage(originalImage, 0, 0, width, height);
      
      // 识别文字
      setProgress(20);
      setCurrentStep('识别文字中...');
      
      // 使用Tesseract识别文字
      const { data } = await worker.recognize(imageDataUrl);
      
      setProgress(60);
      setCurrentStep('识别完成，准备翻译');
      
      // 过滤结果，保留置信度较高的文本
      const detectedTexts = data.words
        .filter(word => word.confidence > 60 && containsChinese(word.text))
        .map(word => ({
          text: word.text,
          x: word.bbox.x0 * scale,
          y: word.bbox.y0 * scale,
          confidence: word.confidence,
        }));
      
      setRecognizedText(detectedTexts);
      
      // 批量翻译
      setProgress(70);
      setCurrentStep('翻译中...');
      
      // 提取所有文本进行批量翻译
      const textsToTranslate = detectedTexts.map(item => item.text);
      const translatedTexts = await batchTranslate(textsToTranslate);
      
      // 更新翻译结果
      const translationResults = detectedTexts.map((item, index) => ({
        ...item,
        translated: translatedTexts[index]
      }));
      
      setTranslatedText(translationResults);
      setProgress(90);
      setCurrentStep('生成结果图片');
      
      // 在图片上绘制翻译结果
      for (const item of translationResults) {
        drawText(ctx, item.translated, item.x, item.y + 24, {
          fontSize: '16px',
          color: '#FFFFFF',
          bgColor: 'rgba(0, 0, 0, 0.7)',
          padding: 5
        });
      }
      
      // 获取最终图片
      const processedImageUrl = canvas.toDataURL('image/png');
      
      setProgress(100);
      setCurrentStep('处理完成');
      await sleep(500); // 短暂延迟以显示完成状态
      
      // 调用完成回调
      onProcessingComplete(processedImageUrl);
      
    } catch (err) {
      console.error('图片处理出错:', err);
      setError('处理图片时出错: ' + (err.message || '未知错误'));
      setIsProcessing(false);
    }
  };

  // 开始处理
  const handleStartProcessing = () => {
    processImage();
  };

  // 下载处理后的图片
  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'translated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">图片文字翻译处理</h2>
      
      {/* 原始图片预览 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">原始图片</h3>
        <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="上传图片预览" 
              className="max-h-[400px] object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-[200px] w-full text-gray-400">
              <p>未选择图片</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 处理按钮 */}
      <div className="mb-6 flex justify-center">
        {!isProcessing && !processedImage && (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleStartProcessing}
            disabled={!uploadedImage || !worker}
          >
            <i className="fas fa-magic mr-2"></i>
            开始处理图片
          </button>
        )}
      </div>
      
      {/* 进度指示器 */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{currentStep}</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* 错误提示 */}
      {error && (
        <div className="mb-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p className="font-bold">处理出错</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* 处理结果 */}
      {processedImage && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">处理结果</h3>
          <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
            <img 
              src={processedImage} 
              alt="处理后的图片" 
              className="max-h-[400px] object-contain"
            />
          </div>
          
          <div className="mt-4 flex justify-center">
            <button 
              className="btn btn-primary"
              onClick={handleDownload}
            >
              <i className="fas fa-download mr-2"></i>
              下载图片
            </button>
          </div>
        </div>
      )}
      
      {/* 识别文本列表 */}
      {translatedText.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">识别到的文本</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">原文</th>
                  <th className="py-2 px-4 border-b text-left">译文</th>
                  <th className="py-2 px-4 border-b text-left">可信度</th>
                </tr>
              </thead>
              <tbody>
                {translatedText.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{item.text}</td>
                    <td className="py-2 px-4 border-b">{item.translated}</td>
                    <td className="py-2 px-4 border-b">{Math.round(item.confidence)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 隐藏Canvas用于图像处理 */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      ></canvas>
    </div>
  );
} 