# 📋 GitHub 上传文件清单

## 🔥 **核心必需文件**

### 1. **项目配置文件**
```
✅ package.json                 # 项目依赖和脚本配置
✅ package-lock.json           # 锁定依赖版本
✅ netlify.toml                # Netlify部署配置
✅ craco.config.js             # Create React App配置覆盖
✅ tailwind.config.js          # Tailwind CSS配置
✅ postcss.config.js           # PostCSS配置
✅ .env.production             # 生产环境变量
✅ .gitignore                  # Git忽略文件配置
```

### 2. **构建和部署脚本**
```
✅ build-netlify.js            # Netlify构建脚本
✅ deploy-to-netlify.bat       # Netlify部署批处理
✅ manual-deploy.bat           # 手动部署脚本
```

### 3. **文档文件**
```
✅ README.md                   # 项目说明文档
✅ NETLIFY_DEPLOYMENT_GUIDE.md # Netlify部署指南
✅ DEPLOYMENT_CHECKLIST.md     # 部署检查清单
✅ GIT_DEPLOY_GUIDE.md         # Git部署指南
```

## 📁 **源代码目录**

### 4. **src/ 目录（完整上传）**
```
src/
├── components/                # React组件
│   ├── AIAvatar.js
│   ├── ChatInterface.js
│   ├── EnhancedRAGChat.js
│   ├── FileManager.js
│   ├── FreshmanChatInterface.js
│   ├── FrontendRAGChat.js
│   ├── KnowledgeBaseManager.js
│   └── LoginInterface.js
├── config/                    # 配置文件
│   ├── apiConfig.js
│   ├── ragApiConfig.js
│   └── ragConfig.js
├── data/                      # 数据文件
│   ├── graduateData.js
│   ├── pyfaData.json
│   └── pyfaData-1.json
├── pages/                     # 页面组件
│   ├── ChatPage.js
│   └── LoginPage.js
├── utils/                     # 工具函数
│   ├── addCultivationPlans.js
│   ├── apiBasedRAG.js
│   ├── frontendRAG.js
│   ├── GlobalRAGSystem.js
│   ├── hybridRAG.js
│   ├── hybridRAGSystem.js
│   ├── majorPlanLoader.js
│   ├── pdfTextExtractor.js
│   └── simpleFrontendRAG.js
├── App.css                    # 主应用样式
├── App.js                     # 主应用组件
├── index.css                  # 全局样式
└── index.js                   # 应用入口
```

### 5. **public/ 目录（完整上传）**
```
public/
├── data/                      # 公共数据文件
│   ├── cqupt_knowledge.json
│   └── knowledge_base.json
├── 培养方案/                   # 培养方案JSON文件
│   └── [所有JSON文件]
├── index.html                 # HTML模板
├── manifest.json              # PWA清单
├── sw.js                      # Service Worker
├── Picture.jpg                # 图片资源
├── Picture1.png
├── Picture2.png
├── Picturee.png
└── test-files.html            # 测试文件
```

### 6. **data/ 目录（数据文件）**
```
data/
├── _专业_培养方案.txt
├── all_cultivation_plans.txt
├── cultivation_plan.txt
├── real_graduates.csv
├── students.csv
└── [所有培养方案txt文件]
```

### 7. **培养方案/ 目录**
```
培养方案/
└── [所有JSON格式的培养方案文件]
```

### 8. **scripts/ 目录**
```
scripts/
├── moveCultivationPlans.js    # 培养方案移动脚本
├── pdf2json.py               # PDF转JSON脚本
└── readExcel.js              # Excel读取脚本
```

## ❌ **不需要上传的文件/目录**

### 自动生成/缓存文件
```
❌ node_modules/              # NPM依赖包（GitHub Actions会自动安装）
❌ build/                     # 构建输出（Netlify会自动生成）
❌ __pycache__/               # Python缓存文件
❌ .vscode/                   # VS Code配置（个人设置）
❌ temp/                      # 临时文件
❌ vector_db/                 # 向量数据库（运行时生成）
```

### Python后端文件（前端项目不需要）
```
❌ rag_system/                # Python RAG系统
❌ api_server*.py             # API服务器文件
❌ main*.py                   # Python主程序
❌ requirements*.txt          # Python依赖
❌ *.bat (除部署脚本外)        # 其他批处理文件
❌ *.sh                       # Shell脚本
❌ frpc.exe, frpc.ini         # 内网穿透工具
```

## 🚀 **快速上传步骤**

### 方法一：GitHub网页上传
1. **创建GitHub仓库**
   - 登录GitHub
   - 点击"New repository"
   - 仓库名：`cqupt-ai-chat`
   - 设为Public
   - 不要初始化README

2. **批量上传文件**
   - 直接拖拽上述文件列表到GitHub网页
   - 或使用"uploading an existing file"

### 方法二：Git命令行上传
```bash
# 初始化Git仓库
git init

# 添加所有需要的文件
git add package.json package-lock.json netlify.toml
git add craco.config.js tailwind.config.js postcss.config.js
git add .env.production .gitignore
git add build-netlify.js deploy-to-netlify.bat manual-deploy.bat
git add README.md NETLIFY_DEPLOYMENT_GUIDE.md DEPLOYMENT_CHECKLIST.md GIT_DEPLOY_GUIDE.md
git add src/ public/ data/ 培养方案/ scripts/

# 提交更改
git commit -m "初始提交：重邮AI问答系统前端项目"

# 连接远程仓库
git remote add origin https://github.com/你的用户名/cqupt-ai-chat.git

# 推送到GitHub
git push -u origin main
```

## 📊 **文件统计**
- **总文件数**：约150-200个文件
- **总大小**：约50-100MB（不含node_modules）
- **上传时间**：5-15分钟（取决于网络速度）

## 🔗 **后续步骤**
1. 上传完成后，在Netlify中连接GitHub仓库
2. 设置构建命令：`npm run build:netlify`
3. 设置发布目录：`build`
4. 配置环境变量：`REACT_APP_DEEPSEEK_API_KEY`

---
**注意**：确保所有敏感信息（如API密钥）都已正确配置在环境变量中，不要直接提交到代码中！