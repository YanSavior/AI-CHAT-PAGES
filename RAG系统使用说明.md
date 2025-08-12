# RAG系统使用说明

本项目实现了一个完整的RAG（检索增强生成）系统，通过本地服务器+内网穿透的方式提供API服务，并与前端进行集成。现在还支持混合RAG模式，无需依赖内网穿透。

## 系统架构

1. **后端RAG系统**：使用Python实现，包含向量化、检索和排序等功能
2. **API服务器**：使用FastAPI提供RESTful API接口
3. **内网穿透**：支持ngrok或frp，将本地API服务暴露到公网
4. **前端集成**：前端通过API调用RAG系统获取知识增强
5. **混合RAG模式**：直接在前端实现RAG功能，同时支持本地检索和DeepSeek API调用

## 环境要求

- Python 3.8+
- 内网穿透工具（ngrok或frp）- 仅在使用API模式时需要
- Node.js 14+（前端开发环境）

## 安装依赖

```bash
# 安装Python依赖
pip install -r requirements.txt

# 安装内网穿透工具
# 方式一：ngrok
# Windows: 下载安装包并添加到PATH
# Linux/Mac: npm install -g ngrok 或下载二进制文件

# 方式二：frp
# 从 https://github.com/fatedier/frp/releases 下载最新版本
# 解压后将frpc(Linux/Mac)或frpc.exe(Windows)放到项目目录
```

## 使用方法

### 一键启动（API模式）

#### 使用ngrok（国外服务器）

##### Windows系统

```bash
start_rag_with_ngrok.bat
```

##### Linux/Mac系统

```bash
chmod +x start_rag_with_ngrok.sh
./start_rag_with_ngrok.sh
```

#### 使用frp（国内更稳定）

##### Windows系统

```bash
start_rag_with_frp.bat
```

##### Linux/Mac系统

```bash
chmod +x start_rag_with_frp.sh
./start_rag_with_frp.sh
```

### 混合RAG模式（推荐）

混合RAG模式不需要启动后端服务器和内网穿透，直接在前端实现RAG功能：

1. 启动前端应用：
   ```bash
   npm start
   ```

2. 系统会自动初始化混合RAG模式：
   - 首先尝试连接远程RAG API（如果有）
   - 如果远程API不可用，自动切换到本地RAG模式
   - 所有RAG处理都在前端完成，无需依赖内网穿透

3. 混合RAG模式的优势：
   - 无需配置和维护内网穿透
   - 即使在网络不稳定的情况下也能工作
   - 自动在远程API和本地处理之间切换
   - 当DeepSeek API不可用时，提供本地回退方案

### 手动启动（API模式）

如果一键脚本不适用于您的环境，可以按以下步骤手动启动：

1. 启动RAG API服务器：
   ```bash
   python api_server.py
   ```

2. 启动内网穿透：
   ```bash
   # 使用ngrok
   ngrok http 8000
   
   # 或使用frp
   frpc -c frpc.ini
   ```

3. 记下公网URL，并修改`src/config/ragApiConfig.js`中的`baseURL`为该URL。

### 验证系统状态

1. 访问本地API：http://localhost:8000/api/health
2. 访问公网URL：http(s)://xxxx.xxxx.xxx/api/health

如果返回`{"status":"healthy","rag_system_initialized":true}`，则表示系统正常运行。

## 前端集成

前端会自动检测RAG系统的可用性：
- 如果远程API可用，将显示"已连接"状态，并使用远程RAG系统
- 如果远程API不可用，将自动切换到本地混合RAG模式
- 如果DeepSeek API不可用，将使用本地RAG系统提供回退方案

## 常见问题

1. **ngrok连接失败**
   - 确保已登录ngrok账号：`ngrok config add-authtoken YOUR_TOKEN`
   - 检查网络连接和防火墙设置
   - 尝试使用frp替代
   - 或切换到混合RAG模式，无需内网穿透

2. **frp连接失败**
   - 检查frpc.ini配置是否正确
   - 确认服务器地址和端口是否可达
   - 查看日志文件`temp/frp.log`
   - 或切换到混合RAG模式，无需内网穿透

3. **API服务器启动失败**
   - 检查端口8000是否被占用
   - 查看日志文件`temp/api_server.log`
   - 或切换到混合RAG模式，无需启动API服务器

4. **前端无法连接RAG API**
   - 检查`src/config/ragApiConfig.js`中的URL是否正确
   - 确认内网穿透是否正常运行
   - 检查浏览器控制台是否有CORS错误
   - 或切换到混合RAG模式，无需连接远程API

5. **混合RAG模式问题**
   - 确保`src/utils/hybridRAGSystem.js`文件存在
   - 检查浏览器控制台是否有错误信息
   - 确认知识库文件正确加载

## 注意事项

- 混合RAG模式是推荐的使用方式，无需依赖内网穿透
- API模式下，保持启动脚本窗口开启，关闭窗口将终止服务
- ngrok免费版每次启动会生成不同的URL，需要重新配置
- frp使用的是公共服务器，可能存在不稳定因素
- 如需长期稳定的公网地址，建议使用自己的服务器或云服务 