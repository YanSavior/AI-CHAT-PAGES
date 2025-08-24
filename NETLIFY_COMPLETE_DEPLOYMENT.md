# 🚀 重邮AI问答系统 - Netlify完整部署方案

## 📋 部署概述

已完成重邮AI问答系统在Netlify平台的完整构建和配置。系统包含以下特性：

### ✅ 核心功能
- **DeepSeek AI集成**: 基于DeepSeek API的智能对话系统
- **RAG检索增强**: 混合RAG系统支持知识库检索
- **用户认证系统**: 支持学生和管理员登录
- **知识库管理**: 管理员可管理和编辑知识库
- **文件上传处理**: 支持文档上传和处理
- **响应式设计**: 适配PC端和移动端
- **PWA支持**: 可安装为原生应用

### 🎯 部署架构
- **前端**: React 18 + Ant Design + Tailwind CSS
- **构建工具**: Create React App + Craco
- **AI服务**: DeepSeek API (通过Netlify代理)
- **数据存储**: 前端本地存储 + 静态数据文件
- **部署平台**: Netlify

## 🔧 构建配置

### 1. 核心文件结构
```
build/
├── index.html                 # 主应用入口
├── static/                    # 静态资源
│   ├── css/                   # 样式文件
│   └── js/                    # JavaScript文件
├── data/                      # 数据文件
│   ├── knowledge_base.json    # 知识库数据
│   ├── training-plans/        # 培养方案数据
│   └── graduates/             # 毕业生数据
├── netlify.toml               # Netlify配置
├── deployment-info.json       # 部署信息
└── README.md                  # 部署说明
```

### 2. Netlify配置 (netlify.toml)
- **构建命令**: `npm run build`
- **发布目录**: `build`
- **Node版本**: 18
- **API代理**: DeepSeek API自动代理
- **SPA路由**: 单页应用路由支持
- **安全头**: CSP、XSS保护等
- **缓存策略**: 静态资源长期缓存

### 3. 环境变量配置
必需的环境变量：
```
REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key_here
REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com
```

可选的环境变量：
```
REACT_APP_APP_NAME=重邮AI问答系统
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_ADMIN_MODE=true
REACT_APP_ENABLE_FILE_UPLOAD=true
REACT_APP_ENABLE_KNOWLEDGE_EXPORT=true
REACT_APP_ENABLE_LOCAL_RAG=true
REACT_APP_MAX_MESSAGE_LENGTH=5000
REACT_APP_MAX_KNOWLEDGE_ITEMS=1000
REACT_APP_SESSION_TIMEOUT=3600000
```

## 🚀 部署步骤

### 步骤1: 准备代码仓库
1. 将当前项目推送到GitHub仓库
2. 确保所有构建文件都已包含

### 步骤2: 连接Netlify
1. 登录 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择 "GitHub" 作为Git提供商
4. 授权Netlify访问GitHub账户
5. 选择项目仓库

### 步骤3: 配置构建设置
在Netlify的构建设置中输入：
```
Build command: npm run build:netlify
Publish directory: build
Node version: 18
```

### 步骤4: 设置环境变量
在Netlify控制台的"Environment variables"部分添加：
- `REACT_APP_DEEPSEEK_API_KEY`: 你的DeepSeek API密钥
- `REACT_APP_DEEPSEEK_API_URL`: https://api.deepseek.com
- 其他可选环境变量（见上文）

### 步骤5: 执行部署
1. 点击 "Deploy site" 按钮
2. 等待构建完成（约3-5分钟）
3. 获得部署完成的Netlify域名

### 步骤6: 配置自定义域名（可选）
1. 在Netlify控制台中点击"Domain settings"
2. 添加自定义域名
3. 配置DNS记录
4. 启用HTTPS

## 🎯 功能验证

### 登录测试
部署完成后，使用以下账户测试：

**管理员账户**:
- 用户名: `cqupt`
- 密码: `1950`

**学生账户示例**:
- 用户名: `2024215001` (或其他符合格式的学号)
- 密码: `001` (账号后三位)

### 功能测试清单
- [ ] 首页正常加载
- [ ] 登录功能正常
- [ ] 聊天界面响应
- [ ] AI对话功能
- [ ] RAG检索功能
- [ ] 知识库管理 (管理员)
- [ ] 文件上传功能
- [ ] 移动端适配
- [ ] PWA安装

## ⚙️ 配置优化

### 1. API代理配置
系统已配置DeepSeek API代理，避免CORS问题：
- 生产环境: `/api/deepseek/*` → `https://api.deepseek.com/*`
- 开发环境: 直接连接DeepSeek API

### 2. 缓存策略
- 静态资源: 1年缓存 + immutable
- 数据文件: 1小时缓存
- 培养方案: 2小时缓存
- 主应用: 无缓存确保更新

### 3. 安全配置
- CSP头: 防止XSS攻击
- Frame Options: 防止点击劫持
- HTTPS强制: 自动重定向
- API限流: 防止滥用

## 🔍 监控和维护

### 1. 性能监控
- 使用Netlify Analytics监控访问量
- 监控页面加载速度
- 检查API响应时间
- 观察错误日志

### 2. 定期维护
- **每月**: 检查API Key有效性
- **每季度**: 更新依赖包版本
- **每半年**: 审查安全配置
- **随时**: 监控错误日志

### 3. 备份策略
- 知识库数据定期导出
- 用户配置备份
- 应用设置记录

## 🐛 常见问题解决

### 1. 构建失败
**症状**: Netlify构建过程中失败
**排查**:
- 检查Node.js版本 (需要18+)
- 验证package.json依赖
- 查看构建日志错误信息
- 确认环境变量设置

### 2. API请求失败
**症状**: 聊天功能无响应或错误
**排查**:
- 验证DeepSeek API Key有效性
- 检查API配额使用情况
- 确认代理配置正确
- 查看浏览器控制台错误

### 3. 登录问题
**症状**: 无法登录或会话丢失
**排查**:
- 清除浏览器本地存储
- 检查账号密码格式
- 验证会话超时设置
- 确认本地存储权限

### 4. 知识库问题
**症状**: 知识库功能异常
**排查**:
- 检查数据文件完整性
- 验证JSON格式正确性
- 确认文件权限设置
- 重置知识库到默认状态

## 📞 技术支持

### 联系方式
- **GitHub Issues**: 在项目仓库提交问题
- **文档查阅**: 参考NETLIFY_DEPLOYMENT_GUIDE.md
- **错误调试**: 使用浏览器开发者工具

### 快速命令
```bash
# 本地构建测试
npm run build:netlify

# 本地预览构建结果
npx serve -s build

# 检查依赖更新
npm outdated

# 运行测试
npm test
```

## 🎉 部署完成

恭喜！重邮AI问答系统已成功配置为可部署到Netlify的完整方案。

### 下一步操作：
1. **立即部署**: 按照上述步骤部署到Netlify
2. **功能测试**: 使用提供的测试账户验证功能
3. **用户培训**: 为使用者提供操作指南
4. **持续优化**: 根据使用反馈持续改进

---

**构建信息**:
- 构建时间: 2025-08-24 10:16:45
- 版本: 1.0.0
- 环境: Netlify Production
- 特性: DeepSeek AI + RAG + 用户认证 + 知识库管理

🚀 **准备就绪，现在可以部署了！**
