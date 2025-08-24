# 🚀 Anything LLM 启动指南

## 📋 当前状态分析

根据控制台日志，您的系统配置如下：
- **状态**: ❌ Anything LLM 连接失败 
- **错误**: `Network Error` - 无法连接到 `http://localhost:3001`
- **当前模式**: 🤖 使用 DeepSeek 备用方案（仅基于本地数据）

## ⚠️ 问题原因

1. **Anything LLM 服务未启动** - 端口 3001 没有服务响应
2. **工作区可能不存在** - 需要确认 "test" 工作区已创建
3. **API密钥可能无效** - 需要验证密钥：`5DW5A42-8K7400V-NP3XPHT-MPHMMRP`

## 🔧 解决步骤

### 步骤 1: 启动 Anything LLM 服务

```bash
# 方法 1: 如果您有 Docker
docker run -d -p 3001:3001 --cap-add SYS_ADMIN \
  -v anythingllm-storage:/app/server/storage \
  -v anythingllm-hotdir:/app/collector/hotdir \
  -e STORAGE_DIR="/app/server/storage" \
  mintplexlabs/anythingllm

# 方法 2: 如果您有本地安装
cd /path/to/anythingllm
npm start
```

### 步骤 2: 验证服务状态

访问：http://localhost:3001
- 确认 Anything LLM 管理界面能正常打开
- 检查服务状态是否正常

### 步骤 3: 配置工作区

1. 在 Anything LLM 管理界面中：
   - 创建名为 "test" 的工作区
   - 上传您的知识库文档
   - 记录 API 密钥

2. 验证配置：
   - 工作区名称：`test`
   - API 密钥：`5DW5A42-8K7400V-NP3XPHT-MPHMMRP`

### 步骤 4: 测试连接

刷新聊天应用页面，查看状态栏：
- ✅ 绿点 + "Anything LLM已连接" = 成功
- ❌ 红点 + "本地模式" = 仍需调试

## 🔍 连接状态检查

### 界面指示器
- **顶部状态栏**: 显示连接状态和服务名称
- **消息来源标识**: 每条AI回复显示数据来源
  - 🔗 **Anything LLM** (绿色) = 使用知识库
  - 🤖 **DeepSeek备用** (橙色) = 仅本地数据

### 控制台日志 (F12 开发者工具)
```
✅ Anything LLM API可用           <- 连接成功
❌ Anything LLM API不可用         <- 连接失败
📊 响应详情: {source: "anything_llm"...}  <- 使用知识库
⚠️ 注意：此回答未使用Anything LLM知识库   <- 使用本地数据
```

## 🚨 常见问题

### Q: 为什么显示 "Anything LLM已连接" 但实际用的是 DeepSeek？
A: 状态检查和实际查询是分开的，可能存在以下情况：
1. 服务刚启动，连接不稳定
2. 工作区 "test" 不存在
3. API 密钥无效
4. 服务负载过高导致超时

### Q: 如何确认真正使用了 Anything LLM？
A: 查看消息下方的来源标识：
- 看到 "🔗 Anything LLM" = 成功使用知识库
- 看到 "🤖 DeepSeek备用" = 未使用知识库

### Q: DeepSeek 也超时怎么办？
A: 检查网络连接和 API 密钥配置：
```javascript
// 在 src/config/apiConfig.js 中确认
DEEPSEEK_API_KEY: 'sk-7f5214ed15764dfea0b45c84c6d0c961'
```

## 📞 需要帮助？

如果按照上述步骤仍无法连接，请提供：
1. Anything LLM 启动日志
2. 浏览器控制台完整错误信息
3. `http://localhost:3001` 访问结果

## 🎯 预期结果

成功配置后，您应该看到：
1. **状态栏**: 🟢 "Anything LLM已连接"
2. **AI回复**: 显示 "🔗 Anything LLM" 标识
3. **控制台**: `✅ Anything LLM API调用成功` + 知识库来源信息
4. **回答质量**: 基于您上传的知识库内容，而非仅限于本地毕业生数据 