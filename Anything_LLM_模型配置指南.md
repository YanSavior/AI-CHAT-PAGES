# 🔧 Anything LLM 模型配置指南

## 🚨 **当前问题**

根据API测试结果，发现以下错误：
```
"deepseek-chat is not valid for chat completion!"
```

这说明Anything LLM工作区配置了不兼容的模型。

## 🎯 **解决步骤**

### 步骤 1: 打开Anything LLM桌面应用

1. 确保Anything LLM应用正在运行
2. 打开应用界面（应该在系统托盘或桌面）

### 步骤 2: 访问工作区设置

1. **找到工作区 "test"**
   - 在工作区列表中找到名为 "test" 的工作区
   - 如果不存在，请创建一个新的工作区并命名为 "test"

2. **进入工作区设置**
   - 点击工作区右侧的设置图标（⚙️）
   - 或右键点击工作区选择"设置"

### 步骤 3: 配置正确的LLM模型

在工作区设置中找到 **"LLM Provider"** 或 **"模型配置"** 部分：

#### 🔄 **选项A：使用内置模型**
选择以下任一兼容模型：
- **AnythingLLM Built-in** (推荐)
- **Ollama** (如果已安装)
- **OpenAI** (如果有API密钥)
- **Anthropic Claude**
- **其他支持的模型**

#### 🔄 **选项B：配置外部API**
如果要使用DeepSeek：
1. 选择 **"Generic OpenAI"** 或 **"Custom API"**
2. 设置正确的API端点和模型名称
3. 模型名称改为：`deepseek-chat` → `gpt-3.5-turbo` 或其他兼容名称

### 步骤 4: 保存并测试

1. **保存配置**：点击"保存"或"应用"按钮
2. **重启工作区**：退出并重新进入工作区
3. **测试聊天**：在Anything LLM界面中发送测试消息

### 步骤 5: 验证连接

回到聊天应用（http://localhost:3000）：
1. **刷新页面**
2. **发送测试消息**
3. **查看来源标识**：应该显示 🔗 "Anything LLM"

## 🔍 **推荐配置**

### 💡 **最简单方案：使用内置模型**
```
LLM Provider: AnythingLLM Built-in
Model: 默认模型
Temperature: 0.7
Max Tokens: 1000
```

### 🚀 **高级方案：配置外部API**
如果要保持使用DeepSeek API：
```
LLM Provider: Generic OpenAI
API Base URL: https://api.deepseek.com/v1
API Key: sk-7f5214ed15764dfea0b45c84c6d0c961
Model Name: deepseek-chat
```

## 🚨 **常见问题**

### Q: 工作区"test"不存在怎么办？
A: 
1. 在Anything LLM中创建新工作区
2. 命名为 "test"
3. 按照上述步骤配置模型

### Q: 找不到模型配置选项？
A: 
1. 检查是否在正确的工作区设置中
2. 寻找 "Chat Settings"、"LLM Settings" 或类似选项
3. 可能在 "Advanced Settings" 中

### Q: 配置后仍然报错？
A: 
1. 完全重启Anything LLM应用
2. 确认工作区设置已保存
3. 检查API密钥是否正确

## 📞 **需要帮助？**

配置完成后，如果仍有问题，请提供：
1. Anything LLM当前配置的截图
2. 工作区设置详情
3. 新的错误日志

## 🎯 **预期结果**

正确配置后，应该看到：
```
✅ /api/v1/workspace/test/chat - Status: 200
🔗 Anything LLM (绿色标识)
📊 响应详情: {source: "anything_llm"...}
``` 