/**
 * 页脚组件
 * @returns {JSX.Element} 页脚组件
 */
function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold mb-2">产品图片翻译工具</h3>
            <p className="text-gray-400">帮助您轻松进行产品图片的文本翻译</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-github text-xl"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-linkedin text-xl"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-twitter text-xl"></i>
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} 产品图片翻译工具. 保留所有权利.</p>
          <p className="text-sm mt-2">基于 Next.js, React 和 Canvas API 构建</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;