/**
 * 导航头部组件
 * @param {Object} props - 组件属性
 * @param {string} props.activeSection - 当前活动区域
 * @param {Function} props.setActiveSection - 设置活动区域的函数
 * @returns {JSX.Element} 导航组件
 */
export default function Header({ activeSection, setActiveSection }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => setActiveSection('home')}
          >
            <i className="fas fa-language text-primary text-2xl mr-3"></i>
            <h1 className="text-xl font-bold text-gray-800">产品图片翻译工具</h1>
          </div>
          
          <nav>
            <ul className="flex space-x-8">
              <li>
                <a 
                  href="#"
                  className={`py-2 px-1 border-b-2 ${
                    activeSection === 'home' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection('home');
                  }}
                >
                  <i className="fas fa-home mr-2"></i>
                  首页
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className={`py-2 px-1 border-b-2 ${
                    activeSection === 'uploader' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection('uploader');
                  }}
                >
                  <i className="fas fa-upload mr-2"></i>
                  开始识别
                </a>
              </li>
            </ul>
          </nav>
          
          <div>
            <button className="btn btn-sm btn-outline-primary">
              <i className="fas fa-question-circle mr-2"></i>
              帮助
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 