# 重邮AI问答系统 - Netlify 部署版本

## 🚀 快速部署

1. **Fork 此仓库**到你的 GitHub 账户

2. **连接到 Netlify**
   - 登录 [Netlify](https://netlify.com)
   - 点击 "New site from Git"
   - 选择你的 GitHub 仓库

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: `18`

4. **设置环境变量**
   在 Netlify 控制台的 Environment Variables 中添加：
   ```
   REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com
   ```

5. **部署**
   - 点击 "Deploy site"
   - 等待构建完成

## 🎯 功能特性

- ✅ **智能聊天**: 基于 DeepSeek API 的对话系统
- ✅ **RAG 检索**: 混合检索增强生成系统
- ✅ **用户认证**: 学生和管理员登录系统
- ✅ **知识管理**: 管理员可管理知识库
- ✅ **文件上传**: 支持文档上传和处理
- ✅ **响应式设计**: 适配各种设备
- ✅ **PWA 支持**: 可安装为应用

## 🔧 配置说明

### 登录账户
- **管理员**: 账号 `cqupt`, 密码 `1950`
- **学生**: 账号格式 `2024215XXX`, 密码为账号后三位

### API 配置
系统会自动处理 API 代理，无需额外配置。

### 知识库
- 支持自定义知识条目
- 支持文档文件上传
- 支持培养方案数据

## 📱 使用指南

1. **访问系统**: 打开部署后的网址
2. **登录**: 使用提供的账户信息登录
3. **开始对话**: 学生用户可直接开始聊天
4. **管理知识库**: 管理员可管理知识库内容

## 🛠️ 技术栈

- **前端**: React 18 + Ant Design + Tailwind CSS
- **AI**: DeepSeek API
- **检索**: 混合 RAG 系统
- **构建**: Create React App + Craco
- **部署**: Netlify

## 📞 支持

如有问题，请查看部署日志或联系技术支持。

---
构建时间: 2025/8/12 23:22:45
版本: 1.0.0
