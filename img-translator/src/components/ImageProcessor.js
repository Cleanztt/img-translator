import { useState, useEffect, useRef } from 'react';
import { createImage, fileToDataURL, drawText, getResizedImageDimensions, sleep } from '../utils/imageUtils';
import { translateText, batchTranslate, containsChinese } from '../utils/translationUtils';
import Tesseract from 'tesseract.js';

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
  const workerRef = useRef(null);
  
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
    if (!uploadedImage) {
      setError('请先上传图片');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(0);
      setCurrentStep('准备图片');
      setError(null);
      
      // 读取图片
      let imageDataUrl;
      try {
        imageDataUrl = await fileToDataURL(uploadedImage);
      } catch (err) {
        console.error('读取图片失败:', err);
        setError('读取图片失败，请重试');
        setIsProcessing(false);
        return;
      }
      
      let originalImage;
      try {
        originalImage = await createImage(imageDataUrl);
      } catch (err) {
        console.error('加载图片失败:', err);
        setError('加载图片失败，请重试');
        setIsProcessing(false);
        return;
      }
      
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
      try {
        // 使用tesseract.js 4.1.1版本的API
        const { data } = await Tesseract.recognize(imageDataUrl, 'chi_sim+eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.floor(20 + m.progress * 40));
            }
          }
        });
        
        setProgress(60);
        setCurrentStep('识别完成，准备翻译');
        
        // 过滤结果，按行分组文本而不是单个词
        if (!data?.lines || !Array.isArray(data.lines)) {
          throw new Error('OCR识别结果格式不正确');
        }

        // 使用lines而不是words，确保按行处理文本
        const detectedLines = data.lines
          .filter(line => line.confidence > 70 && containsChinese(line.text))
          .map(line => ({
            text: line.text,
            x: line.bbox.x0 * scale,
            y: line.bbox.y0 * scale,
            width: (line.bbox.x1 - line.bbox.x0) * scale,
            height: (line.bbox.y1 - line.bbox.y0) * scale,
            confidence: line.confidence,
          }));
        
        setRecognizedText(detectedLines);
        
        // 批量翻译完整行文本
        setProgress(70);
        setCurrentStep('翻译中...');
        
        // 提取所有行文本进行批量翻译
        const textsToTranslate = detectedLines.map(item => item.text);
        const translatedTexts = await batchTranslate(textsToTranslate);
        
        // 更新翻译结果
        const translationResults = detectedLines.map((item, index) => ({
          ...item,
          translated: translatedTexts[index]
        }));
        
        setTranslatedText(translationResults);
        setProgress(90);
        setCurrentStep('生成结果图片');
        
        // 在图片上绘制翻译结果
        for (const item of translationResults) {
          // 只翻译内容有变化的文本
          if (item.text !== item.translated) {
            drawText(ctx, item.translated, item.x, item.y, {
              color: '#FFFFFF',
              bgColor: 'rgb(0, 0, 0)', // 完全不透明黑色背景
              padding: 8, // 增加内边距
              // 提供原文本框信息以便在原位置上覆盖
              originalTextBox: {
                x: item.x,
                y: item.y + item.height,
                width: item.width,
                height: item.height
              }
            });
          }
        }
        
        // 获取最终图片
        const processedImageUrl = canvas.toDataURL('image/png');
        
        setProgress(100);
        setCurrentStep('处理完成');
        await sleep(500); // 短暂延迟以显示完成状态
        
        // 调用完成回调
        onProcessingComplete(processedImageUrl);
      } catch (err) {
        console.error('OCR识别失败:', err);
        setError('OCR识别失败，请重试');
        setIsProcessing(false);
        return;
      }
      
    } catch (err) {
      console.error('图片处理出错:', err);
      setError('处理图片时出错: ' + (err.message || '未知错误'));
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        图片文字识别与翻译
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左侧：原始图片预览 */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">原始图片</h3>
          <div className="border rounded-lg overflow-hidden bg-gray-100 h-80 flex items-center justify-center">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="原始图片" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <p className="text-gray-500">请先上传图片</p>
            )}
          </div>
        </div>

        {/* 右侧：处理后图片预览 */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">翻译结果</h3>
          <div className="border rounded-lg overflow-hidden bg-gray-100 h-80 flex items-center justify-center">
            {processedImage ? (
              <img 
                src={processedImage} 
                alt="处理后图片" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <p className="text-gray-500">暂无结果</p>
            )}
          </div>
        </div>
      </div>

      {/* 处理进度 */}
      {isProcessing && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{currentStep}</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* 按钮区域 */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={processImage}
          disabled={!uploadedImage || isProcessing}
          className={`btn btn-primary px-6 py-3 ${
            !uploadedImage || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
              处理中...
            </>
          ) : (
            <>
              <i className="fas fa-magic mr-2"></i>
              开始识别和翻译
            </>
          )}
        </button>
      </div>

      {/* 处理结果下载按钮 */}
      {processedImage && !isProcessing && (
        <div className="mt-4 text-center">
          <a 
            href={processedImage} 
            download="translated_image.png"
            className="btn btn-outline-primary"
          >
            <i className="fas fa-download mr-2"></i>
            下载翻译后的图片
          </a>
        </div>
      )}

      {/* 隐藏的Canvas元素，用于处理图片 */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}