# 图片文字翻译工具

这是一个基于Next.js和Tesseract.js开发的图片文字识别和翻译工具，可以自动识别图片中的中文文本并翻译成英文，翻译后的文本会直接覆盖在原文位置上。

## 主要功能

- ✅ 图片上传与预览
- ✅ 自动识别图片中的中文文字
- ✅ 使用百度翻译API将中文翻译成英文
- ✅ 按行处理文本，保持原意
- ✅ 翻译结果直接覆盖在原图上，保持原文样式
- ✅ 自动调整翻译文本大小以适应原文区域
- ✅ 支持下载处理后的图片

## 技术栈

- Next.js 13.x
- Tailwind CSS 
- Tesseract.js (OCR文字识别)
- 百度翻译API
- Canvas API (图像处理)

## 环境要求

- Node.js 14.x 或更高版本
- npm 或 yarn
- Docker (可选，用于容器化部署)

## 安装部署

### 本地开发环境

1. 克隆项目
```bash
git clone https://github.com/Cleanztt/img-translator.git
cd img-translator
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 开发环境运行
```bash
npm run dev
# 或
yarn dev
```

4. 在浏览器中访问 http://localhost:3000 (或控制台显示的端口)

### 使用Docker进行开发

1. 使用docker-compose启动开发环境
```bash
docker-compose up dev
```

2. 在浏览器中访问 http://localhost:3000
3. 代码更改将自动热重载

### 生产环境部署

#### 直接部署

1. 构建生产版本
```bash
npm run build
# 或
yarn build
```

2. 启动生产服务器
```bash
npm run start
# 或
yarn start
```

#### 使用Docker部署

1. 使用单个Dockerfile构建和运行
```bash
# 构建Docker镜像
docker build -t img-translator .

# 运行容器
docker run -p 3000:3000 img-translator
```

2. 使用docker-compose部署生产环境
```bash
# 构建并启动
docker-compose up app

# 后台运行
docker-compose up -d app

# 查看日志
docker-compose logs -f app
```

## 如何使用

1. 打开应用主页
2. 点击上传按钮选择包含中文文字的图片
3. 等待图片处理（包括OCR识别和翻译）
4. 处理完成后，页面右侧会显示翻译后的图片
5. 点击"下载翻译后的图片"按钮保存结果

## API接口

本项目提供以下API接口：

- `/api/translate`: 单文本翻译接口
  - 方法: POST
  - 参数: `{ text: "要翻译的文本" }`
  - 返回: `{ result: "翻译结果" }`

- `/api/batch-translate`: 批量文本翻译接口
  - 方法: POST
  - 参数: `{ texts: ["文本1", "文本2", ...] }`
  - 返回: `["翻译1", "翻译2", ...]`

## 进阶配置

### 自定义翻译API

默认使用百度翻译API，如需修改，请在`src/utils/translationUtils.js`中更新相关配置。

### 识别语言设置

默认识别中文和英文，如需支持其他语言，请在`src/components/ImageProcessor.js`中修改Tesseract调用参数。

### Docker环境变量配置

在生产环境部署时，可以通过环境变量配置应用：

```bash
# 使用环境变量运行容器
docker run -p 3000:3000 \
  -e BAIDU_APP_ID=your_app_id \
  -e BAIDU_API_KEY=your_api_key \
  img-translator
```

或在docker-compose.yml中配置：

```yaml
services:
  app:
    # ...其他配置
    environment:
      - NODE_ENV=production
      - BAIDU_APP_ID=your_app_id
      - BAIDU_API_KEY=your_api_key
```

## 项目目录结构

```
img-translator/
├── .next/               # Next.js构建输出
├── node_modules/        # 依赖模块
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── components/      # React组件
│   ├── pages/           # 页面组件
│   │   ├── api/         # API路由
│   │   ├── _app.js      # 应用入口
│   │   ├── _document.js # HTML文档结构
│   │   └── index.js     # 主页
│   └── utils/           # 工具函数
├── .dockerignore        # Docker忽略文件
├── .gitignore           # Git忽略文件
├── Dockerfile           # 生产环境Docker配置
├── Dockerfile.dev       # 开发环境Docker配置
├── docker-compose.yml   # Docker Compose配置
├── next.config.js       # Next.js配置
├── package.json         # 项目依赖和脚本
└── README.md            # 项目说明
```

## 注意事项

- 免费版百度翻译API有每日调用限制，超限后会降级为本地演示翻译
- 图片中文字越清晰，识别率越高
- 支持的图片格式：JPG, PNG, GIF等常见格式
- 使用Docker部署时，确保端口3000没有被其他应用占用

## 问题排查

1. 如果使用Docker后无法访问应用，请检查：
   - 容器是否正常运行：`docker ps`
   - 网络端口是否正确映射：`docker port <container_id>`
   - 容器日志是否有错误：`docker logs <container_id>`

2. 跨域问题：
   - 已通过API路由解决百度翻译API的跨域问题
   - 如遇其他跨域问题，请检查网络请求和Next.js配置

## 贡献指南

欢迎提交Pull Request或Issue来改进这个项目。

## 许可证

MIT 