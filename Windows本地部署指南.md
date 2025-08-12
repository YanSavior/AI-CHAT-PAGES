# 🚀 RAG系统Windows本地+ngrok部署指南

## 📋 前置要求

### 1. Python环境
- **Python 3.8+** (推荐Python 3.9或3.10)
- **pip** 包管理器

### 2. 系统要求
- Windows 10/11
- 至少4GB内存
- 至少2GB可用磁盘空间

## 🔧 安装步骤

### 第一步：安装Python
1. 访问 [Python官网](https://www.python.org/downloads/)
2. 下载最新版本的Python 3.x
3. 安装时勾选 "Add Python to PATH"
4. 验证安装：
   ```cmd
   python --version
   pip --version
   ```

### 第二步：安装ngrok
1. 访问 [ngrok官网](https://ngrok.com/)
2. 注册免费账号
3. 下载Windows版本
4. 解压到任意目录（如 `C:\ngrok`）
5. 将ngrok目录添加到系统PATH环境变量
6. 配置认证令牌：
   ```cmd
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

### 第三步：下载项目
1. 确保您已经下载了完整的RAG系统项目
2. 解压到本地目录

## 🚀 快速部署

### 方法一：使用批处理脚本（推荐）
1. 双击运行 `local_ngrok_deploy.bat`
2. 脚本会自动：
   - 检查Python环境
   - 安装依赖包
   - 启动RAG API服务器
   - 启动ngrok隧道

### 方法二：手动部署
1. 打开命令提示符，进入项目目录
2. 安装依赖：
   ```cmd
   pip install -r requirements.txt
   ```
3. 启动API服务器：
   ```cmd
   python api_server.py
   ```
4. 新开一个命令提示符窗口，启动ngrok：
   ```cmd
   ngrok http 8000
   ```

## 🌐 访问地址

### 本地访问
- **API服务器**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/api/health

### 公网访问
- ngrok会生成类似 `https://abc123.ngrok.io` 的公网地址
- 每次重启ngrok都会生成新的地址

## 📚 API使用说明

### 1. 健康检查
```bash
GET http://localhost:8000/api/health
```

### 2. 查询接口
```bash
POST http://localhost:8000/api/query
Content-Type: application/json

{
    "question": "您的问题",
    "top_k_retrieve": 20,
    "top_k_final": 5
}
```

### 3. 构建知识库
```bash
POST http://localhost:8000/api/build_knowledge_base
```

## 🔍 故障排除

### 常见问题

#### 1. Python未找到
- 确保Python已添加到PATH环境变量
- 重启命令提示符

#### 2. 依赖安装失败
- 升级pip：`python -m pip install --upgrade pip`
- 使用国内镜像：`pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/`

#### 3. 端口8000被占用
- 修改 `api_server.py` 中的端口号
- 或者停止占用端口的其他服务

#### 4. ngrok连接失败
- 检查网络连接
- 验证ngrok认证令牌
- 确保防火墙未阻止ngrok

#### 5. 模型下载失败
- 检查网络连接
- 使用国内镜像源
- 手动下载模型文件

### 日志查看
- API服务器日志显示在命令提示符窗口中
- ngrok日志显示在ngrok窗口中

## 🎯 测试建议

### 1. 基础功能测试
```bash
# 测试健康检查
curl http://localhost:8000/api/health

# 测试查询接口
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "测试问题"}'
```

### 2. 前端集成测试
- 使用Postman或类似工具测试API
- 检查CORS设置是否正确
- 验证JSON响应格式

## 🔒 安全注意事项

### 1. ngrok安全
- ngrok免费版会暴露您的本地服务到公网
- 仅用于开发和测试，不要用于生产环境
- 考虑使用ngrok付费版获得固定域名

### 2. 网络安全
- 确保防火墙设置正确
- 不要在生产环境中使用默认端口
- 考虑添加API认证机制

## 📱 移动端测试

### 1. 同一网络
- 确保手机和电脑在同一WiFi网络
- 使用电脑的局域网IP地址访问

### 2. 公网访问
- 使用ngrok生成的公网地址
- 可以在任何地方访问您的RAG系统

## 🚀 下一步

部署成功后，您可以：
1. 集成到前端应用
2. 添加用户认证
3. 优化模型性能
4. 部署到云平台（Railway、Render等）

## 📞 技术支持

如果遇到问题，请检查：
1. Python版本和依赖包
2. 网络连接和防火墙设置
3. ngrok配置和认证
4. 系统日志和错误信息

---

**祝您部署顺利！** 🎉 