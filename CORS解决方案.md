# RAGflow CORS 问题解决方案

## 问题描述

如果聊天界面右上角显示"本地模式"而不是"RAGflow已连接"，通常是由于CORS（跨域资源共享）问题导致的。这是因为浏览器的安全策略阻止了前端应用（http://localhost:3000）访问RAGflow服务（http://localhost:80）。

## 解决方案

### 方案1：配置RAGflow Docker的CORS设置（推荐）

#### 1. 停止RAGflow服务
```bash
docker-compose down
```

#### 2. 修改RAGflow的docker-compose.yml文件
在RAGflow的docker-compose.yml中找到ragflow服务，添加环境变量：

```yaml
services:
  ragflow:
    image: infiniflow/ragflow:v0.20.3
    environment:
      - CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
      - CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
      - CORS_ALLOW_HEADERS=Content-Type,Authorization
    # ... 其他配置
```

#### 3. 重启RAGflow服务
```bash
docker-compose up -d
```

### 方案2：使用nginx代理（如果方案1不行）

#### 1. 创建nginx配置文件 `ragflow-proxy.conf`
```nginx
server {
    listen 8080;
    server_name localhost;

    location /api/ {
        proxy_pass http://localhost:80/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # CORS配置
        add_header Access-Control-Allow-Origin "http://localhost:3000" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials true always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

#### 2. 启动nginx代理
```bash
# 使用Docker运行nginx代理
docker run -d --name ragflow-proxy \
  -p 8080:8080 \
  -v $(pwd)/ragflow-proxy.conf:/etc/nginx/conf.d/default.conf \
  nginx:alpine
```

#### 3. 更新前端配置
修改 `src/config/apiConfig.js` 中的RAGflow地址：
```javascript
export const RAGFLOW_CONFIG = {
  baseURL: 'http://localhost:8080', // 改为代理地址
  // ... 其他配置保持不变
};
```

### 方案3：在开发环境中禁用浏览器CORS检查（临时方案）

#### Chrome浏览器
```bash
# Windows
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security --disable-features=VizDisplayCompositor

# macOS
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security

# Linux
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev_test"
```

⚠️ **注意**: 此方案仅用于开发测试，不适用于生产环境。

### 方案4：使用浏览器扩展（临时方案）

安装CORS浏览器扩展，如：
- "CORS Unblock" (Chrome扩展)
- "CORS Everywhere" (Firefox扩展)

## 验证CORS解决方案

### 1. 使用测试页面验证
打开 `test-ragflow.html` 并点击"测试连接状态"按钮。

### 2. 检查浏览器控制台
打开浏览器开发者工具，查看控制台日志：
- ✅ 成功：会看到"RAGflow健康检查成功"
- ❌ 失败：会看到CORS相关错误信息

### 3. 检查聊天界面状态
启动应用后，右上角应该显示"RAGflow已连接"而不是"本地模式"。

## 常见CORS错误信息

```
Access to fetch at 'http://localhost:80/api/v1/datasets' from origin 'http://localhost:3000' has been blocked by CORS policy
```

如果看到此类错误，说明需要配置CORS支持。

## 推荐解决顺序

1. **首先尝试方案1**：配置RAGflow Docker的CORS设置
2. **如果方案1不行**：使用方案2的nginx代理
3. **开发测试时**：可临时使用方案3或方案4

## 生产环境建议

在生产环境中：
1. 使用专业的反向代理（nginx、Apache等）
2. 配置正确的CORS策略
3. 使用HTTPS
4. 限制允许的域名范围

## 检查当前状态

在浏览器控制台运行以下命令检查连接状态：
```javascript
// 检查RAGflow连接
ragflowAPI.checkHealth().then(result => {
  console.log('RAGflow状态:', result);
});
```

成功配置后，你应该能看到"RAGflow已连接"状态，并且可以正常使用智能问答功能。 