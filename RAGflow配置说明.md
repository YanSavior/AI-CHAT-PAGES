# RAGflow集成配置说明

## 概述

本系统已成功集成RAGflow API，实现完整的RAG（Retrieval Augmented Generation）功能。RAGflow负责文档上传、向量化、检索和重排，前端只需调用API即可获得智能问答服务。

## 当前配置

### 你的RAGflow实例信息
- **RAGflow地址**: http://localhost:80
- **API密钥**: ragflow-k1N2ZmYjRhN2UzNDExZjA4OGQ3ZjJkMm
- **数据集ID**: 4b03f4127e3011f0a2a51a264d04a702

✅ **配置已完成！** 系统现在已配置为使用你的RAGflow实例。

## 测试步骤

### 1. 快速测试
打开项目根目录的 `test-ragflow.html` 文件，在浏览器中测试RAGflow连接：

1. 双击打开 `test-ragflow.html`
2. 点击"测试连接状态"按钮
3. 点击"获取数据集列表"按钮验证数据集
4. 点击"测试检索功能"按钮验证检索功能

### 2. 启动应用测试
```bash
npm start
```
应用启动后：
1. 登录系统（学号：2024215xxx，密码：xxx）
2. 观察右上角状态指示器应显示"RAGflow已连接"
3. 输入问题测试智能问答功能

## 配置步骤（已完成）

### 1. 环境变量配置

在项目根目录创建 `.env` 文件，添加以下配置：

```bash
# RAGflow API 配置
REACT_APP_RAGFLOW_URL=http://localhost:80
REACT_APP_RAGFLOW_API_KEY=ragflow-k1N2ZmYjRhN2UzNDExZjA4OGQ3ZjJkMm
REACT_APP_RAGFLOW_DATASET_ID=4b03f4127e3011f0a2a51a264d04a702
REACT_APP_RAGFLOW_CHAT_ID=

# DeepSeek API 配置（备用）
REACT_APP_DEEPSEEK_API_KEY=sk-7f5214ed15764dfea0b45c84c6d0c961
```

### 2. RAGflow服务器配置

确保你的RAGflow服务器：

1. **已启动并运行在指定地址**
   ```bash
   # 检查RAGflow状态
   curl http://你的RAGflow地址/api/v1/datasets
   ```

2. **API密钥正确**
   - 你的API密钥：`ragflow-k1N2ZmYjRhN2UzNDExZjA4OGQ3ZjJkMm`
   - 在RAGflow管理界面生成或获取

3. **知识库已创建**
   - 登录RAGflow Web界面
   - 创建新的数据集（知识库）
   - 记录数据集ID，更新到环境变量中

### 3. 知识库配置

#### 创建知识库
1. 打开RAGflow Web界面
2. 点击"知识库">"创建知识库"
3. 配置参数：
   - **名称**：重庆邮电大学知识库
   - **描述**：重庆邮电大学AI问答系统专用知识库
   - **嵌入模型**：BAAI/bge-large-zh-v1.5（中文优化）
   - **分块方法**：General（通用）
   - **分块大小**：512 tokens

#### 上传文档
1. 选择创建的知识库
2. 点击"添加文件"
3. 上传以下类型的文档：
   - **培养方案**：各专业培养方案PDF/DOC
   - **就业数据**：毕业生就业统计数据
   - **政策文件**：相关教育政策文档
   - **常见问题**：FAQ文档

#### 文档解析
1. 上传完成后，点击"解析"按钮
2. 等待解析完成（状态变为SUCCESS）
3. 可以在"分块"页面查看解析结果

## 系统架构

```
前端 React 应用
    ↓
RAGflow API客户端 (src/utils/ragflowAPI.js)
    ↓
RAGflow 服务器 (Docker部署)
    ↓
知识库 (文档向量化存储)
```

## API功能说明

### 核心功能
1. **健康检查**：`ragflowAPI.checkHealth()`
2. **混合查询**：`ragflowAPI.hybridQuery(question, options)`
3. **文档检索**：`ragflowAPI.retrieveChunks(question, options)`
4. **聊天完成**：`ragflowAPI.chatCompletion(messages, options)`

### 数据管理
1. **数据集管理**：创建、列表、更新数据集
2. **文档管理**：上传、解析、列表文档
3. **分块管理**：查看和管理文档分块

## 使用流程

### 用户查询流程
1. 用户输入问题
2. 系统调用 `ragflowAPI.hybridQuery()`
3. RAGflow执行：
   - 向量相似度检索
   - 关键词匹配
   - 重排序
   - LLM生成回答
4. 返回包含引用的智能回答

### 回退机制
1. **RAGflow可用**：使用RAGflow完整功能
2. **RAGflow不可用**：回退到DeepSeek API + 本地数据

## 配置文件说明

### src/config/apiConfig.js
```javascript
export const RAGFLOW_CONFIG = {
  baseURL: 'RAGflow服务器地址',
  apiKey: 'RAGflow API密钥',
  defaultDatasetId: '默认知识库ID',
  defaultChatId: '默认聊天ID',
  retrieval: {
    similarity_threshold: 0.2,    // 相似度阈值
    vector_similarity_weight: 0.3, // 向量相似度权重
    top_k: 5,                     // 返回前K个结果
    page_size: 30                 // 分页大小
  }
};
```

### src/utils/ragflowAPI.js
- RAGflow API的完整封装
- 支持所有RAGflow RESTful接口
- 自动错误处理和重试
- 详细的日志记录

## 优势特点

### 完整RAG功能
- ✅ 文档上传和解析
- ✅ 自动向量化
- ✅ 智能检索
- ✅ 结果重排
- ✅ LLM增强生成

### 高可用性
- ✅ 健康检查机制
- ✅ 自动回退策略
- ✅ 错误重试机制
- ✅ 详细状态显示

### 易于维护
- ✅ 模块化设计
- ✅ 配置文件管理
- ✅ 完整日志记录
- ✅ 错误处理机制

## 测试验证

### 1. 服务连接测试
```bash
# 在浏览器控制台执行
ragflowAPI.checkHealth().then(console.log);
```

### 2. 知识库查询测试
```bash
# 在浏览器控制台执行
ragflowAPI.hybridQuery("微电子专业的就业前景如何？").then(console.log);
```

### 3. 状态监控
- 查看浏览器控制台日志
- 观察界面状态指示器
- 检查RAGflow Web界面

## 常见问题

### Q: RAGflow连接失败
**A:** 检查以下项目：
1. RAGflow服务器是否启动
2. 网络连接是否正常
3. API密钥是否正确
4. CORS设置是否正确

### Q: 查询无结果
**A:** 检查以下项目：
1. 知识库是否有文档
2. 文档是否解析成功
3. 相似度阈值是否过高
4. 查询关键词是否合适

### Q: 响应速度慢
**A:** 优化建议：
1. 调整分块大小
2. 优化检索参数
3. 使用更快的嵌入模型
4. 启用缓存机制

## 下一步优化

1. **添加文档上传界面**：允许管理员通过前端上传文档
2. **优化检索参数**：根据使用情况调整检索配置
3. **添加缓存机制**：缓存常见问题的答案
4. **多知识库支持**：支持多个专业领域的知识库
5. **用户反馈机制**：收集用户对答案质量的反馈

---

配置完成后，系统将拥有完整的RAG功能，无需复杂的后端部署，直接依托RAGflow的强大能力！ 