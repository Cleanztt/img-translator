/**
 * 测试页面
 * @returns {JSX.Element} 测试页面组件
 */
export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">测试页面</h1>
      <p className="text-lg mb-6">如果你能看到这个页面，说明路由系统工作正常！</p>
      <a 
        href="/"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        返回首页
      </a>
    </div>
  );
} 