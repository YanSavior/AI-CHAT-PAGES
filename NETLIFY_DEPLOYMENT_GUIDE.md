# 重邮AI问答系统 - Netlify 部署指南

## 🚀 快速部署

### 1. 准备工作

确保你有以下账户和资源：
- GitHub 账户
- Netlify 账户
- DeepSeek API Key

### 2. 部署步骤

#### 步骤 1: Fork 仓库
1. 访问项目仓库
2. 点击右上角的 "Fork" 按钮
3. 将仓库 Fork 到你的 GitHub 账户

#### 步骤 2: 连接 Netlify
1. 登录 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择 "GitHub" 作为 Git 提供商
4. 授权 Netlify 访问你的 GitHub 账户
5. 选择刚才 Fork 的仓库

#### 步骤 3: 配置构建设置
在 Netlify 的构建设置页面中配置：

```
Build command: npm run build:netlify
Publish directory: build
Node version: 18
```

#### 步骤 4: 设置环境变量
在 Netlify 控制台的 "Environment variables" 部分添加：

**必需的环境变量：**
```
REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key_here
REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com
```

**可选的环境变量：**
```
REACT_APP_APP_NAME=重邮AI问答系统
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_ADMIN_MODE=true
REACT_APP_ENABLE_FILE_UPLOAD=true
REACT_APP_ENABLE_KNOWLEDGE_EXPORT=true
REACT_APP_MAX_MESSAGE_LENGTH=5000
REACT_APP_MAX_KNOWLEDGE_ITEMS=1000
REACT_APP_SESSION_TIMEOUT=3600000
```

#### 步骤 5: 部署
1. 点击 "Deploy site" 按钮
2. 等待构建完成（通常需要 3-5 分钟）
3. 构建成功后，你会得到一个 Netlify 域名

### 3. 自定义域名（可选）

如果你有自己的域名：
1. 在 Netlify 控制台中点击 "Domain settings"
2. 点击 "Add custom domain"
3. 输入你的域名
4. 按照提示配置 DNS 记录

### 4. HTTPS 配置

Netlify 会自动为你的站点配置 HTTPS：
1. 在 "Domain settings" 中找到 "HTTPS" 部分
2. 确保 "Force HTTPS" 选项已启用
3. Let's Encrypt 证书会自动配置

## 🔧 高级配置

### 自定义构建脚本

项目包含了专门的 Netlify 构建脚本 `build-netlify.js`，它会：
- 执行标准的 React 构建
- 复制必要的数据文件
- 生成 Netlify 配置
- 优化静态资源
- 创建 PWA 支持

### API 代理配置

`netlify.toml` 文件已配置了 API 代理：
- DeepSeek API 请求会通过 `/api/deepseek/*` 代理
- 支持 CORS 和安全头配置
- 自动处理 SPA 路由

### 缓存策略

配置了多层缓存策略：
- 静态资源：1年缓存
- 数据文件：1小时缓存
- 培养方案文件：2小时缓存

## 🎯 功能验证

部署完成后，验证以下功能：

### 基础功能
- [ ] 页面正常加载
- [ ] 登录功能正常
- [ ] 聊天界面响应
- [ ] 管理员界面可访问

### 登录测试
**管理员账户：**
- 用户名：`cqupt`
- 密码：`1950`

**学生账户：**
- 用户名：`2024215001`（或其他符合格式的账号）
- 密码：`001`（账号后三位）

### API 连接测试
1. 登录后发送一条消息
2. 检查是否收到 AI 回复
3. 验证 RAG 系统是否工作

### 管理员功能测试
1. 使用管理员账户登录
2. 访问知识库管理界面
3. 尝试添加/编辑/删除知识条目
4. 测试文件上传功能

## 🐛 故障排除

### 常见问题

#### 1. 构建失败
**可能原因：**
- Node.js 版本不兼容
- 依赖包安装失败
- 环境变量未设置

**解决方案：**
```bash
# 检查构建日志
# 确保 Node 版本为 18
# 检查 package.json 中的依赖
```

#### 2. API 请求失败
**可能原因：**
- DeepSeek API Key 无效
- 网络连接问题
- CORS 配置问题

**解决方案：**
- 验证 API Key 是否正确
- 检查 netlify.toml 中的代理配置
- 查看浏览器控制台错误信息

#### 3. 登录功能异常
**可能原因：**
- 前端逻辑错误
- 本地存储问题

**解决方案：**
- 清除浏览器缓存和本地存储
- 检查控制台错误信息
- 验证登录逻辑

#### 4. 知识库功能异常
**可能原因：**
- 本地存储限制
- 数据格式错误

**解决方案：**
- 检查浏览器本地存储限制
- 验证知识库数据格式
- 重置知识库到默认状态

### 调试工具

#### 1. 浏览器开发者工具
- 检查控制台错误
- 查看网络请求
- 检查本地存储

#### 2. Netlify 构建日志
- 在 Netlify 控制台查看构建日志
- 检查部署状态
- 查看函数日志（如果使用）

#### 3. 性能监控
```javascript
// 在浏览器控制台运行
console.log('性能信息:', performance.getEntriesByType('navigation')[0]);
```

## 📊 监控和维护

### 性能监控
- 使用 Netlify Analytics 监控访问量
- 检查页面加载速度
- 监控 API 响应时间

### 定期维护
- 定期更新依赖包
- 检查 API Key 有效性
- 备份知识库数据
- 监控错误日志

### 更新部署
当你更新代码后：
1. 推送到 GitHub 仓库
2. Netlify 会自动触发重新构建
3. 等待构建完成
4. 验证新功能

## 🔒 安全考虑

### API Key 安全
- 永远不要在代码中硬编码 API Key
- 使用 Netlify 环境变量存储敏感信息
- 定期轮换 API Key

### 内容安全策略
- 已配置 CSP 头部
- 限制外部资源加载
- 防止 XSS 攻击

### 访问控制
- 实现了基础的登录验证
- 管理员和普通用户权限分离
- 会话超时保护

## 📞 技术支持

如果遇到问题：
1. 首先查看本文档的故障排除部分
2. 检查 Netlify 构建日志
3. 查看浏览器控制台错误
4. 联系技术支持团队

---

**部署成功后，你将拥有一个功能完整的 AI 问答系统！** 🎉

系统特性：
- ✅ 基于 DeepSeek 的智能对话
- ✅ RAG 检索增强生成
- ✅ 用户登录和权限管理
- ✅ 知识库管理功能
- ✅ 响应式设计
- ✅ PWA 支持
- ✅ 离线功能
- ✅ 自动缓存优化