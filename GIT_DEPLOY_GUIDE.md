# 🚀 重邮AI问答系统 - Git部署完整指南

## 📋 部署前检查清单

- [ ] 已安装Git
- [ ] 已有GitHub账户
- [ ] 已有Netlify账户
- [ ] 已获取DeepSeek API密钥
- [ ] 项目构建成功

## 🔧 步骤1: 准备Git仓库

### 1.1 初始化Git仓库（如果还没有）
```bash
git init
git add .
git commit -m "初始提交：重邮AI问答系统"
```

### 1.2 连接到GitHub
```bash
# 在GitHub上创建新仓库，然后：
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

## 🌐 步骤2: 在Netlify中设置

### 2.1 创建新站点
1. 登录 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择 "GitHub"
4. 授权Netlify访问你的GitHub

### 2.2 选择仓库和配置
1. 选择你的仓库
2. 分支选择：`main`
3. 构建设置：
   ```
   Build command: npm run build:netlify
   Publish directory: build
   ```

### 2.3 高级设置
点击 "Show advanced" 并设置：
```
Node version: 18
NPM version: 9
```

## 🔐 步骤3: 配置环境变量

在Netlify控制台的 "Environment variables" 中添加：

### 必需变量
```
REACT_APP_DEEPSEEK_API_KEY=你的DeepSeek_API密钥
REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com
```

### 推荐变量
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

## 🚀 步骤4: 部署

1. 点击 "Deploy site"
2. 等待构建完成（通常3-5分钟）
3. 构建成功后获得Netlify域名

## ✅ 步骤5: 验证部署

### 5.1 基础功能测试
- [ ] 网站可以正常访问
- [ ] 页面加载正常
- [ ] 响应式设计工作

### 5.2 登录功能测试
**管理员登录：**
- 用户名：`cqupt`
- 密码：`1950`

**学生登录：**
- 用户名：`2024215001`
- 密码：`001`

### 5.3 AI聊天测试
- [ ] 可以发送消息
- [ ] 收到AI回复
- [ ] 功能正常

## 🔄 日常更新流程

当你需要更新系统时：

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "更新描述"
git push origin main

# 3. Netlify会自动检测到更改并重新构建部署
```

## 🛠️ 故障排除

### 构建失败
1. 查看Netlify构建日志
2. 检查Node版本设置
3. 确认环境变量设置正确

### API请求失败
1. 验证API密钥是否正确
2. 检查环境变量名称
3. 查看浏览器控制台错误

### 功能异常
1. 清除浏览器缓存
2. 检查网络连接
3. 查看控制台错误信息

## 🎯 成功标志

当看到以下内容时，表示部署成功：
- ✅ Netlify显示"Published"状态
- ✅ 网站可以正常访问
- ✅ 登录功能正常
- ✅ AI聊天功能正常
- ✅ 管理员功能正常

## 📞 获取帮助

如果遇到问题：
1. 查看Netlify构建日志
2. 检查浏览器控制台
3. 参考故障排除部分
4. 联系技术支持

---

🎉 **恭喜！你现在拥有一个完全自动化的AI问答系统！**