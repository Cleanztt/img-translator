import { useState, useRef } from 'react';

/**
 * 图片上传组件
 * @param {Object} props - 组件属性
 * @param {Function} props.onImageUpload - 图片上传回调
 * @returns {JSX.Element} 图片上传组件
 */
export default function ImageUploader({ onImageUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  
  // 支持的文件类型
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  // 最大文件大小 (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  /**
   * 处理文件拖放开始事件
   * @param {React.DragEvent} e - 拖放事件
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /**
   * 处理拖放结束或离开事件
   * @param {React.DragEvent} e - 拖放事件
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * 处理拖放事件
   * @param {React.DragEvent} e - 拖放事件
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  /**
   * 处理文件放置事件
   * @param {React.DragEvent} e - 拖放事件
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      validateAndProcessFile(files[0]);
    }
  };

  /**
   * 处理文件输入变化
   * @param {React.ChangeEvent} e - 输入事件
   */
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length) {
      validateAndProcessFile(files[0]);
    }
  };

  /**
   * 使用演示图片
   */
  const useDemoImage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 创建空白Canvas生成演示图片
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      // 设置背景色
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 添加一些演示文本区域
      // 顶部标题
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(200, 50, 400, 80);
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.fillText('产品名称', 400, 100);
      
      // 中间说明
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(150, 200, 500, 200);
      ctx.font = '24px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.fillText('使用说明', 400, 240);
      ctx.font = '18px Arial';
      ctx.fillText('这是一段中文产品描述文本', 400, 280);
      ctx.fillText('请按照说明正确使用本产品', 400, 320);
      
      // 底部标签
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(300, 450, 200, 60);
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.fillText('智能翻译', 400, 485);
      
      // 转换为base64
      const dataUrl = canvas.toDataURL('image/png');
      
      // 创建File对象
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'demo-product.png', { type: 'image/png' });
      
      processFile(file);
    } catch (err) {
      console.error('创建演示图片失败', err);
      setError('创建演示图片失败: ' + err.message);
      setLoading(false);
    }
  };

  /**
   * 验证并处理上传的文件
   * @param {File} file - 要处理的文件
   */
  const validateAndProcessFile = (file) => {
    setError(null);
    
    // 验证文件类型
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError('不支持的文件格式。请上传 JPG, PNG 或 WebP 图片');
      return;
    }
    
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      setError('文件大小超过限制。最大支持 10MB');
      return;
    }
    
    processFile(file);
  };

  /**
   * 处理有效的文件
   * @param {File} file - 要处理的文件
   */
  const processFile = (file) => {
    setLoading(true);
    setFileName(file.name);
    
    const reader = new FileReader();
    
    reader.onloadstart = () => {
      setLoading(true);
    };
    
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    
    reader.onerror = () => {
      setError('读取文件时出错');
      setLoading(false);
    };
    
    reader.onloadend = () => {
      setLoading(false);
      // 文件处理完成后，调用回调函数
      onImageUpload(file);
    };
    
    reader.readAsDataURL(file);
  };

  /**
   * 触发文件输入框点击
   */
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          上传产品图片
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左侧：上传区域 */}
          <div>
            <div
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center h-64 transition-colors ${
                isDragging
                  ? 'border-primary bg-primary bg-opacity-10'
                  : 'border-gray-300 hover:border-primary'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileInputChange}
                accept="image/jpeg,image/png,image/jpg,image/webp"
              />
              
              {loading ? (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
                  <p>处理中...</p>
                </div>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt text-5xl text-gray-400 mb-4"></i>
                  <p className="text-center text-gray-600 mb-2">
                    拖放图片到此处，或 <span className="text-primary font-medium">点击上传</span>
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    支持 JPG, PNG, WebP 格式，最大 10MB
                  </p>
                </>
              )}
            </div>
            
            {fileName && (
              <div className="mt-3 flex items-center bg-gray-100 p-2 rounded">
                <i className="fas fa-file-image text-primary mr-2"></i>
                <span className="text-sm text-gray-700 truncate flex-grow">{fileName}</span>
                <span className="text-xs text-gray-500">✓ 已上传</span>
              </div>
            )}
            
            {error && (
              <div className="mt-3 bg-red-100 text-red-700 p-3 rounded-lg">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}
            
            <div className="mt-6">
              <p className="text-center text-gray-600 mb-3">或者使用演示图片：</p>
              <button 
                className="w-full btn btn-outline"
                onClick={useDemoImage}
                disabled={loading}
              >
                <i className="fas fa-image mr-2"></i>
                加载演示图片
              </button>
            </div>
          </div>
          
          {/* 右侧：说明和预览 */}
          <div>
            {previewUrl ? (
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-medium mb-2">图片预览</h3>
                <div className="flex-grow bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="预览" 
                    className="max-h-64 max-w-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 h-full">
                <h3 className="text-lg font-medium mb-4">使用说明</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span>上传包含中文文本的产品图片</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span>系统会自动识别图片中的中文文本</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span>将中文文本翻译成英文</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span>生成带有英文翻译的新图片</span>
                  </li>
                  <li className="flex">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span>下载处理后的图片用于产品展示</span>
                  </li>
                </ul>
                
                <div className="mt-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <i className="fas fa-info-circle mr-2"></i>
                    为获得最佳效果，请使用清晰、文字可辨认的图片
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 