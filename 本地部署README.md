# 🚀 RAG系统本地+ngrok部署方案

## 📁 文件说明

本项目提供了完整的RAG系统本地部署方案，包含以下文件：

### 🖥️ Windows部署脚本
- **`local_ngrok_deploy.bat`** - Windows批处理脚本，一键部署
- **`start_rag_local.ps1`** - PowerShell脚本，快速启动

### 🐧 Linux/macOS部署脚本
- **`local_ngrok_deploy.sh`** - Shell脚本，适用于Linux/macOS

### 📚 文档和指南
- **`Windows本地部署指南.md`** - 详细的Windows部署指南
- **`test_local_deployment.py`** - Python测试脚本，验证部署

## 🚀 快速开始

### Windows用户（推荐）

1. **一键部署**：
   ```cmd
   双击运行 local_ngrok_deploy.bat
   ```

2. **PowerShell启动**：
   ```powershell
   右键 start_rag_local.ps1 -> "使用PowerShell运行"
   ```

### Linux/macOS用户

```bash
chmod +x local_ngrok_deploy.sh
./local_ngrok_deploy.sh
```

## 🌐 访问地址

部署成功后，您可以通过以下地址访问：

- **本地访问**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/api/health

## 🔧 系统要求

- **Python**: 3.8+
- **内存**: 至少4GB
- **磁盘**: 至少2GB可用空间
- **操作系统**: Windows 10/11, Linux, macOS

## 📦 依赖包

系统会自动安装以下依赖：
- FastAPI - Web框架
- Uvicorn - ASGI服务器
- Sentence-Transformers - 文本嵌入
- ChromaDB - 向量数据库
- PyTorch - 深度学习框架

## 🌍 ngrok公网访问

### 安装ngrok
1. 访问 [ngrok官网](https://ngrok.com/)
2. 注册免费账号
3. 下载对应版本
4. 配置认证令牌

### 启动隧道
```bash
ngrok http 8000
```

### 注意事项
- 免费版每次重启会生成新的公网地址
- 仅用于开发和测试，不要用于生产环境
- 考虑付费版获得固定域名

## 🧪 测试部署

运行测试脚本验证部署：
```bash
python test_local_deployment.py
```

## 📱 移动端测试

### 同一网络
- 确保手机和电脑在同一WiFi
- 使用电脑的局域网IP地址

### 公网访问
- 使用ngrok生成的公网地址
- 可在任何地方访问您的RAG系统

## 🔍 故障排除

### 常见问题

1. **Python未找到**
   - 确保Python已添加到PATH
   - 重启命令提示符

2. **端口8000被占用**
   - 修改 `api_server.py` 中的端口号
   - 或停止占用端口的其他服务

3. **依赖安装失败**
   - 升级pip：`python -m pip install --upgrade pip`
   - 使用国内镜像源

4. **ngrok连接失败**
   - 检查网络连接
   - 验证认证令牌
   - 确保防火墙未阻止

## 🎯 下一步

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

## 🔒 安全提醒

- ngrok免费版会暴露本地服务到公网
- 仅用于开发和测试
- 生产环境请使用云平台部署
- 考虑添加API认证机制

---

**🎉 祝您部署顺利！**

如有问题，请查看详细部署指南或运行测试脚本进行诊断。 